const {
  IpnSuccess,
  IpnFailChecksum,
  IpnUnknownError,
  VNPay,
  ProductCode,
  VnpLocale,
  IpnInvalidAmount,
  InpOrderAlreadyConfirmed,
  IpnOrderNotFound,
  dateFormat,
} = require("vnpay");
const config = require("../configs/app.config");
const mongoose = require("mongoose");
const PAYMENT = require("../models/payment.model");
const TRANSACTION = require("../models/transaction.model");
const moment = require("moment");
const reservationsRepo = require("../repositories/reservations.repo");
const APIError = require("../utils/ApiError");
const packageServices = require("./package.services");
const RESERVATION = require("../models/reservation.model");

const vnpay = new VNPay({
  tmnCode: config.VNPay.vnp_TmnCode,
  secureSecret: config.VNPay.vnp_HashSecret,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
});

class PaymentService {
  successResCode = "00";
  failResCode = "02";
  cancelResCode = "24"; // Thêm mã hủy thanh toán

  async createPaymentUrl(
    reservationID,
    phase,
    totalPrice,
    platform = "web",
    returnUrl = null
  ) {
    try {
      // Validate inputs
      if (!mongoose.Types.ObjectId.isValid(reservationID)) {
        throw new Error("Invalid reservation ID format");
      }

      const existingReservation = await reservationsRepo.findReservationByCode(
        reservationID
      );

      if (!existingReservation) {
        throw new Error("Reservation not found");
      }

      // Check if reservation is confirmed
      if (existingReservation.status === "pending") {
        throw new APIError(
          400,
          "Reservation is not confirmed by couple therapist yet"
        );
      }

      // Use the totalPrice parameter directly without recalculating the discount
      // Find or create payment record
      let payment = await PAYMENT.findOne({ reservation: reservationID });
      if (!payment) {
        payment = new PAYMENT({
          reservation: new mongoose.Types.ObjectId(reservationID),
          totalPrice: totalPrice, // Use the total price directly
          totalPaid: 0,
          status: "PENDING",
        });
        await payment.save();
      } else {
        // Update existing payment record with the provided price
        payment.totalPrice = totalPrice; // Use the provided total price
        await payment.save();
      }

      // Calculate payment amount
      const amount =
        phase === "DEPOSIT"
          ? Math.round(payment.totalPrice * 0.5)
          : Math.round(payment.totalPrice - payment.totalPaid);

      console.log("Amount to pay:", amount, "VND"); // Log for debugging

      // Generate transaction code with platform identifier
      const timestamp = moment().format("HHmmss");
      const transactionCode = `${platform}_${timestamp}`;

      // Create expiration date (5 minutes from now)
      const expDate = new Date();
      expDate.setMinutes(expDate.getMinutes() + 5);

      console.log("Platform:", platform, "ReturnUrl:", returnUrl);

      // Build payment URL using vnpay library
      const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: amount, // The library will multiply by 100
        vnp_IpAddr: "52.151.214.177", // Azure host IP
        vnp_TxnRef: transactionCode,
        vnp_OrderInfo: "Thanh toan don hang: " + transactionCode,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: returnUrl || config.VNPay.vnp_ReturnUrl, // Use provided returnUrl if available
        vnp_Locale: VnpLocale.VN,
        vnp_BankCode: "VNBANK",
        vnp_ExpireDate: dateFormat(expDate),
      });

      // Create transaction record with returnUrl
      const transaction = new TRANSACTION({
        payment: payment._id,
        phase,
        amount,
        method: "VNPAY",
        transactionCode: transactionCode,
        status: "PENDING",
        platform,
        returnUrl: returnUrl, // Save returnUrl in transaction
      });

      await transaction.save();

      return { paymentUrl, transaction };
    } catch (error) {
      throw new Error("Error processing payment: " + error.message);
    }
  }

  async verifyIPN(query) {
    try {
      const verify = vnpay.verifyIpnCall(query);
      if (!verify.isVerified) {
        return IpnFailChecksum;
      }

      const transaction = await TRANSACTION.findOne({
        transactionCode: verify.vnp_TxnRef,
      });

      if (!transaction) {
        return IpnOrderNotFound;
      }

      // Kiểm tra trạng thái giao dịch
      if (
        verify.vnp_TransactionStatus === this.failResCode ||
        query.vnp_ResponseCode === this.cancelResCode
      ) {
        if (transaction.status !== "CANCELLED") {
          transaction.status = "CANCELLED";
          transaction.paymentMessage =
            verify.message || "Payment cancelled by user";
          await transaction.save();
        }

        return InpOrderAlreadyConfirmed;
      }

      // Sửa lại so sánh số tiền
      // Lấy số tiền từ VNPay (đã bao gồm việc nhân với 100)
      const vnpAmount = parseInt(verify.vnp_Amount);
      // Số tiền trong DB (chưa nhân với 100)
      const dbAmount = transaction.amount;

      // So sánh số tiền (cần nhân dbAmount với 100 để so sánh)
      if (vnpAmount !== dbAmount) {
        console.log("Amount mismatch:", vnpAmount, "vs", dbAmount);
        return IpnInvalidAmount;
      }

      if (transaction.status !== "PENDING") {
        return InpOrderAlreadyConfirmed;
      }

      if (verify.vnp_ResponseCode === this.successResCode) {
        // Update transaction status
        transaction.status = "PAID";
        await transaction.save();

        // Update payment
        const payment = await PAYMENT.findById(transaction.payment);
        payment.totalPaid += transaction.amount;
        payment.status =
          payment.totalPaid >= payment.totalPrice ? "COMPLETED" : "IN_PROGRESS";
        await payment.save();
      }

      return IpnSuccess;
    } catch (error) {
      console.error(error);
      return IpnUnknownError;
    }
  }

  // Tìm transaction theo mã
  async findTransactionByCode(transactionCode) {
    try {
      return await TRANSACTION.findOne({ transactionCode });
    } catch (error) {
      console.error("Error finding transaction:", error);
      return null;
    }
  }

  // Cập nhật trạng thái transaction
  async updateTransactionStatus(transactionId, status) {
    try {
      await TRANSACTION.findByIdAndUpdate(
        transactionId,
        { status, updatedAt: new Date() },
        { new: true }
      );
      console.log(`Transaction ${transactionId} updated to status ${status}`);
      return true;
    } catch (error) {
      console.error("Error updating transaction status:", error);
      return false;
    }
  }

  // Cập nhật payment sau khi thanh toán thành công
  async updatePaymentAfterSuccessfulTransaction(transaction) {
    try {
      const payment = await PAYMENT.findById(transaction.payment);
      if (!payment) {
        console.error(`Payment not found for transaction ${transaction._id}`);
        return false;
      }

      // Cập nhật tổng số tiền đã thanh toán
      payment.totalPaid += transaction.amount;

      // Xác định trạng thái mới của payment
      if (payment.totalPaid >= payment.totalPrice) {
        payment.status = "COMPLETED";
      }

      await payment.save();
      console.log(
        `Payment ${payment._id} updated. New status: ${payment.status}`
      );
      return true;
    } catch (error) {
      console.error("Error updating payment:", error);
      return false;
    }
  }

  async validatePaymentReturn(query) {
    try {
      console.log("Received VNPay return query:", query);
      const verify = vnpay.verifyReturnUrl(query);

      const transaction = await TRANSACTION.findOne({
        transactionCode: query.vnp_TxnRef,
      }).lean();

      console.log("Transaction found:", transaction);

      // IMPORTANT: Explicitly check platform
      const platform = transaction?.platform || "web";
      console.log("Platform detected:", platform);
      const isMobile = platform === "mobile";
      const customReturnUrl = transaction?.returnUrl;

      // Create response parameters
      const responseParams = new URLSearchParams();
      responseParams.append("vnp_ResponseCode", query.vnp_ResponseCode);
      responseParams.append("vnp_TxnRef", query.vnp_TxnRef);
      responseParams.append("platform", platform);

      if (!verify.isVerified) {
        responseParams.append("status", "failed");
        responseParams.append("message", "Invalid signature");
        const url = this.getRedirectUrl(
          responseParams,
          isMobile,
          customReturnUrl
        );
        console.log("Redirecting to (verify failed):", url);
        return url;
      }

      if (!transaction) {
        responseParams.append("status", "failed");
        responseParams.append("message", "Transaction not found");
        const url = this.getRedirectUrl(
          responseParams,
          isMobile,
          customReturnUrl
        );
        console.log("Redirecting to (no transaction):", url);
        return url;
      }

      // Handle payment result
      if (query.vnp_ResponseCode === "00") {
        responseParams.append("status", "success");
        responseParams.append("message", "Payment successful");
      } else {
        responseParams.append("status", "failed");
        responseParams.append(
          "message",
          query.vnp_ResponseCode === "24"
            ? "Payment was cancelled"
            : "Payment failed"
        );
      }

      const finalUrl = this.getRedirectUrl(
        responseParams,
        isMobile,
        customReturnUrl
      );
      console.log("Final redirect URL:", finalUrl);
      return finalUrl;
    } catch (error) {
      console.error("Payment validation error:", error);
      const errorParams = new URLSearchParams();
      errorParams.append("status", "error");
      errorParams.append("message", error.message || "Internal server error");
      return this.getRedirectUrl(errorParams, false);
    }
  }

  getRedirectUrl(params, isMobile, customReturnUrl = null) {
    if (isMobile && customReturnUrl) {
      console.log("Using custom return URL:", customReturnUrl);
      return `${customReturnUrl}?${params.toString()}`;
    }

    if (isMobile) {
      return `swdmobile://payment/result?${params.toString()}`;
    }

    return `${config.CLIENT_URL}/payment/result?${params.toString()}`;
  }

  buildRedirectUrl(params, isMobile) {
    if (isMobile) {
      // Use swdmobile:// scheme for mobile
      const mobileUrl = `swdmobile://payment/result?${params.toString()}`;
      console.log("Generated mobile URL:", mobileUrl);
      return mobileUrl;
    }
    // Use web URL for browser
    return `${config.CLIENT_URL}/payment/result?${params.toString()}`;
  }

  formatRedirectUrl(url, isMobile) {
    if (isMobile) {
      // Replace with your mobile app scheme
      return url.replace(/^https?:\/\/[^/]+/, "swdmobile:");
    }
    return url;
  }

  async checkPaymentStatusWithVnPay(transactionCode) {
    try {
      // Trong môi trường thật, bạn sẽ gọi API của VNPay để kiểm tra
      // Đối với sandbox, chúng ta giả lập kết quả
      const transaction = await this.findTransactionByCode(transactionCode);

      if (!transaction) {
        return { isSuccess: false, message: "Transaction not found" };
      }

      // Nếu transaction có paymentUrl, coi như đã thanh toán thành công
      if (transaction.status === "PAID") {
        return { isSuccess: true, message: "Payment completed" };
      }

      return { isSuccess: false, message: "Payment pending or failed" };
    } catch (error) {
      console.error("Error checking payment status:", error);
      return { isSuccess: false, message: "Error checking payment status" };
    }
  }
}

module.exports = new PaymentService();
