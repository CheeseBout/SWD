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
const emailServices = require("./email.services");
const userRepo = require("../repositories/user.repo");

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

      // Ensure totalPrice is a valid number
      if (isNaN(totalPrice) || totalPrice <= 0) {
        throw new APIError(400, `Invalid total price: ${totalPrice}`);
      }

      console.log(
        `Creating payment with totalPrice: ${totalPrice}, phase: ${phase}`
      );

      // Find or create payment record
      let payment = await PAYMENT.findOne({ reservation: reservationID });
      if (!payment) {
        payment = new PAYMENT({
          reservation: new mongoose.Types.ObjectId(reservationID),
          totalPrice: totalPrice,
          totalPaid: 0,
          status: "PENDING",
        });
        await payment.save();
      } else {
        // Update existing payment record
        payment.totalPrice = totalPrice;
        await payment.save();
      }

      console.log(
        `Payment record: totalPrice=${payment.totalPrice}, totalPaid=${payment.totalPaid}`
      );

      // Check if previous transactions exist for this payment
      const previousTransactions = await TRANSACTION.find({
        payment: payment._id,
        status: "PAID",
      });

      let actualPaid = payment.totalPaid;

      // Sum up amounts from all paid transactions to ensure we have the correct total
      if (previousTransactions && previousTransactions.length > 0) {
        const paidAmount = previousTransactions.reduce(
          (sum, transaction) => sum + transaction.amount,
          0
        );

        console.log(
          `Found ${previousTransactions.length} previous successful transactions, total paid: ${paidAmount}`
        );

        // If the amounts don't match, update the payment record
        if (paidAmount !== payment.totalPaid) {
          console.log(
            `Updating payment totalPaid from ${payment.totalPaid} to ${paidAmount}`
          );
          payment.totalPaid = paidAmount;
          await payment.save();
          actualPaid = paidAmount;
        } else {
          actualPaid = payment.totalPaid;
        }
      }

      // Calculate payment amount - use direct approach
      let amount;

      if (phase === "DEPOSIT") {
        // 50% deposit
        amount = Math.round(totalPrice * 0.5);
      } else if (phase === "FINAL") {
        // For final payment, calculate remaining amount using the verified actualPaid
        const remainingAmount = totalPrice - actualPaid;

        console.log(
          `Calculating FINAL payment: totalPrice=${totalPrice}, totalPaid=${actualPaid}, remainingAmount=${remainingAmount}`
        );

        amount = Math.round(remainingAmount);

        // If totalPaid is equal to totalPrice, something is wrong
        if (actualPaid >= totalPrice) {
          throw new APIError(400, "Payment is already complete");
        }
      } else {
        // For any other case, use full amount
        amount = Math.round(totalPrice);
      }

      // Extra safety check
      if (amount <= 0) {
        throw new APIError(
          400,
          `Cannot process payment with zero or negative amount (${amount}). Please check your payment configuration.`
        );
      }

      console.log(`Final amount to be charged: ${amount}`);

      // Generate transaction code with platform identifier
      const timestamp = moment().format("HHmmss");
      const transactionCode = `${platform}_${timestamp}`;

      // Create expiration date
      const expDate = new Date();
      expDate.setMinutes(expDate.getMinutes() + 5);

      // Build payment URL using vnpay library
      const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: amount,
        vnp_IpAddr: "52.151.214.177",
        vnp_TxnRef: transactionCode,
        vnp_OrderInfo: "Thanh toan don hang: " + transactionCode,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: returnUrl || config.VNPay.vnp_ReturnUrl,
        vnp_Locale: VnpLocale.VN,
        vnp_BankCode: "VNBANK",
        vnp_ExpireDate: dateFormat(expDate),
      });

      // Debug: Extract the amount from the generated URL
      try {
        const paymentUrlObj = new URL(paymentUrl);
        const urlAmount = paymentUrlObj.searchParams.get("vnp_Amount");
        console.log(`Amount in payment URL: ${urlAmount}`);
        console.log(
          `Creating payment with return url: ${config.VNPay.vnp_ReturnUrl}`
        );
      } catch (e) {
        console.log("Could not parse URL for debugging");
      }

      // Create transaction record
      const transaction = new TRANSACTION({
        payment: payment._id,
        phase,
        amount,
        method: "VNPAY",
        transactionCode: transactionCode,
        status: "PENDING",
        platform,
        returnUrl: returnUrl,
      });

      await transaction.save();
      console.log(
        `Transaction created: ID=${transaction._id}, amount=${amount}`
      );

      return { paymentUrl, transaction };
    } catch (error) {
      console.error("Error in createPaymentUrl:", error);
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

      console.log(
        "VNPay IPN - Transaction found:",
        JSON.stringify(transaction)
      );

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

      // Fix amount comparison logic - VNPay amounts are multiplied by 100
      const vnpAmount = parseInt(verify.vnp_Amount);
      const dbAmount = transaction.amount * 100; // Multiply by 100 to match VNPay format

      console.log("Amount comparison:", {
        vnpAmount,
        dbAmount,
        transactionAmount: transaction.amount,
        isMatch: vnpAmount === dbAmount,
      });

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

        // Send payment notification email
        try {
          const reservation = await RESERVATION.findById(payment.reservation)
            .populate("client")
            .populate("therapist");

          if (reservation) {
            // Send notification to client
            await this.sendPaymentNotification({
              transaction,
              payment,
              reservation,
              isComplete: payment.status === "COMPLETED",
            });
          }
        } catch (emailError) {
          console.error(
            "Error sending payment notification email:",
            emailError
          );
          // Don't fail the transaction just because email failed
        }
      }

      return IpnSuccess;
    } catch (error) {
      console.error(error);
      return IpnUnknownError;
    }
  }

  // New method to send payment notification
  async sendPaymentNotification({
    transaction,
    payment,
    reservation,
    isComplete,
  }) {
    try {
      // Get client info
      const client = reservation.client;
      const therapist = reservation.therapist;

      if (!client || !therapist) {
        console.error(
          "Missing client or therapist info for payment notification"
        );
        return;
      }

      // Format date
      const paymentDate = moment().format("MMMM Do YYYY, h:mm:ss a");

      // Send notification to client
      await emailServices.sendPaymentNotification({
        email: client.email,
        name: client.fullName || client.username,
        therapistName: therapist.fullName || therapist.username,
        amount: transaction.amount,
        date: paymentDate,
        phase: transaction.phase,
        isComplete: isComplete,
        sessionDate: reservation.appointmentDate
          ? moment(reservation.appointmentDate).format("MMMM Do YYYY")
          : "Scheduled session",
        transactionCode: transaction.transactionCode, // Add transaction code
      });

      console.log(`Payment notification email sent to client: ${client.email}`);
    } catch (error) {
      console.error("Error in sendPaymentNotification:", error);
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
      } else {
        payment.status = "IN_PROGRESS";
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

      console.log("Transaction found:", JSON.stringify(transaction, null, 2));

      if (transaction) {
        // Get payment details for logging
        const payment = await PAYMENT.findById(transaction.payment).lean();
        console.log("Related payment:", JSON.stringify(payment, null, 2));

        // Log amount details for debugging
        const vnpAmountFromQuery = query.vnp_Amount
          ? parseInt(query.vnp_Amount)
          : "not provided";
        console.log("Amount comparison:", {
          amountInTransaction: transaction.amount,
          amountInVnpay: vnpAmountFromQuery,
          totalPriceInPayment: payment ? payment.totalPrice : "unknown",
          totalPaidInPayment: payment ? payment.totalPaid : "unknown",
          phase: transaction.phase,
        });
      }

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
