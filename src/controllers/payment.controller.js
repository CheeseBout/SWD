const paymentServices = require("../services/payment.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");
const config = require("../configs/app.config");
const axios = require("axios"); // Thêm axios để gửi request từ backend

class PaymentController {
  getAllPayments = catchAsync(async (req, res) => {
    return OK(res, "Success", await paymentServices.getAllPayments());
  });

  createPaymentUrl = catchAsync(async (req, res) => {
    const { reservationID, phase, totalPrice, platform } = req.body;

    // Thêm thông tin platform (web/mobile) vào transactionCode để xử lý khác nhau sau này
    const result = await paymentServices.createPaymentUrl(
      reservationID,
      phase,
      totalPrice,
      platform || "web" // Mặc định là web nếu không có
    );

    return OK(res, "Success", result);
  });

  verifyIPN = catchAsync(async (req, res) => {
    const vnpayRes = await paymentServices.verifyIPN(req.query);
    res.json(vnpayRes);
  });

  verifyReturnUrl = catchAsync(async (req, res) => {
    try {
      console.log("VNPay return query received:", req.query);

      // 1. Xử lý việc cập nhật trong database trước tiên
      const transactionCode = req.query.vnp_TxnRef;
      const transaction = await paymentServices.findTransactionByCode(
        transactionCode
      );

      if (!transaction) {
        console.log(`Transaction not found: ${transactionCode}`);
        return res.redirect(
          `${config.CLIENT_URL}/payment/result?success=false&message=Transaction not found`
        );
      }

      // Chuẩn bị thông tin thanh toán
      const isPaid = req.query.vnp_ResponseCode === "00";
      const isCancelled = req.query.vnp_ResponseCode === "24"; // Mã 24 là mã hủy thanh toán của VNPay

      const paymentInfo = {
        transactionCode: transactionCode,
        amount: req.query.vnp_Amount ? parseInt(req.query.vnp_Amount) / 100 : 0,
        bank: req.query.vnp_BankCode || "",
        date: req.query.vnp_PayDate || "",
        success: isPaid,
        cancelled: isCancelled,
      };

      // 2. Cập nhật transaction và payment status
      if (isPaid) {
        await paymentServices.updateTransactionStatus(transaction._id, "PAID");
        await paymentServices.updatePaymentAfterSuccessfulTransaction(
          transaction
        );
        console.log(
          `Transaction ${transaction.transactionCode} marked as PAID`
        );
      } else if (isCancelled || req.query.vnp_ResponseCode !== "00") {
        // Cập nhật trạng thái thành CANCELLED nếu người dùng hủy hoặc có lỗi
        await paymentServices.updateTransactionStatus(
          transaction._id,
          "CANCELLED"
        );
        console.log(
          `Transaction ${transaction.transactionCode} marked as CANCELLED`
        );
      }

      // 3. Kiểm tra nếu transaction đến từ mobile app
      if (transaction.transactionCode.includes("mobile")) {
        // Mobile app handling - Deep linking
        const mobileRedirect = new URL("premarital://payment", "");
        Object.keys(paymentInfo).forEach((key) => {
          mobileRedirect.searchParams.append(key, paymentInfo[key]);
        });

        return res.redirect(mobileRedirect.toString());
      }

      // 4. Xử lý redirect cho web browser
      const frontendUrl = new URL("/payment/result", config.CLIENT_URL);
      frontendUrl.searchParams.append("success", isPaid);

      if (isCancelled) {
        frontendUrl.searchParams.append("cancelled", "true");
        frontendUrl.searchParams.append("message", "Payment was cancelled");
      } else {
        frontendUrl.searchParams.append("code", paymentInfo.transactionCode);
        frontendUrl.searchParams.append("amount", paymentInfo.amount);
        frontendUrl.searchParams.append("bank", paymentInfo.bank);
        frontendUrl.searchParams.append("date", paymentInfo.date);
        frontendUrl.searchParams.append(
          "message",
          isPaid ? "Payment successful" : "Payment failed"
        );
      }

      // Chuyển hướng về web frontend
      console.log(`Redirecting to frontend: ${frontendUrl.toString()}`);
      return res.redirect(frontendUrl.toString());
    } catch (error) {
      console.error("Payment verification error:", error);

      // Nếu có lỗi vẫn chuyển hướng về frontend với thông báo lỗi
      const errorUrl = new URL("/payment/result", config.CLIENT_URL);
      errorUrl.searchParams.append("success", "false");
      errorUrl.searchParams.append("message", "Payment processing error");
      errorUrl.searchParams.append("error", error.message || "Unknown error");

      return res.redirect(errorUrl.toString());
    }
  });

  checkPaymentStatus = catchAsync(async (req, res) => {
    const { transactionCode } = req.body;

    if (!transactionCode) {
      return res.status(400).json({
        success: false,
        message: "Transaction code is required",
      });
    }

    const transaction = await paymentServices.findTransactionByCode(
      transactionCode
    );
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const paymentStatus = await paymentServices.checkPaymentStatusWithVnPay(
      transactionCode
    );
    if (paymentStatus.isSuccess && transaction.status === "PENDING") {
      await paymentServices.updateTransactionStatus(transaction._id, "PAID");
      await paymentServices.updatePaymentAfterSuccessfulTransaction(
        transaction
      );
    }

    return OK(res, "Success", { paymentStatus, transaction });
  });

  getTransactionsByPayment = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await paymentServices.getTransactionsByPayment(req)
    );
  });
}

module.exports = new PaymentController();
