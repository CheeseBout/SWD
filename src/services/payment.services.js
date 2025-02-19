const crypto = require("crypto");
const moment = require("moment");
const querystring = require("qs");
const config = require("../configs/app.config");
const mongoose = require("mongoose");
const PAYMENT = require("../models/payment.model");
const TRANSACTION = require("../models/transaction.model");
const { VNPay } = require("vnpay");

const vnpay = new VNPay({
  tmnCode: config.VNPay.tmnCode,
  secureSecret: config.VNPay.secureSecret,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
});

class PaymentService {
  async createPayment(reservationID, totalAmount) {
    try {
      if (!mongoose.Types.ObjectId.isValid(reservationID)) {
        throw new Error("Invalid reservation ID format");
      }

      let payment = await PAYMENT.findOne({ reservation: reservationID });

      if (!payment) {
        payment = new PAYMENT({
          reservation: new mongoose.Types.ObjectId(reservationID), // ✅ Chuyển sang ObjectId
          totalAmount,
          totalPaid: 0,
          status: "PENDING",
        });

        await payment.save();
      }

      return payment;
    } catch (error) {
      throw new Error("Error creating payment: " + error.message);
    }
  }

  async createPaymentUrl(reservationID, phase) {
    try {
      // Kiểm tra reservationID có hợp lệ không
      if (!mongoose.Types.ObjectId.isValid(reservationID)) {
        throw new Error("Invalid reservation ID format");
      }

      console.log("reservationID", reservationID);
      // Chuyển reservationID sang ObjectId
      const objectId = new mongoose.Types.ObjectId(reservationID);

      // Tìm Payment theo reservation
      const payment = await PAYMENT.findOne({ reservation: objectId });
      if (!payment) throw new Error("Payment record not found");

      // Xác định số tiền cần thanh toán
      let amount;
      if (phase === "DEPOSIT") {
        amount = payment.totalAmount * 0.5; // Thanh toán 50% lần đầu
      } else if (phase === "FINAL") {
        amount = payment.totalAmount * 0.5; // Thanh toán 50% lần cuối
      } else {
        throw new Error("Invalid payment phase");
      }

      // Kiểm tra nếu đã thanh toán đủ
      if (payment.totalPaid + amount > payment.totalAmount) {
        throw new Error("Payment exceeds total reservation amount");
      }

      // Tạo mã giao dịch
      const date = new Date();
      const createDate = moment(date).format("YYYYMMDDHHmmss");
      const transId = `${moment(date).format(
        "HHmmss"
      )}_${reservationID}_${phase}`;

      let vnpParams = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: config.VNPay.tmnCode,
        vnp_Amount: Math.round(amount * 100),
        vnp_CreateDate: createDate,
        vnp_CurrCode: "VND",
        vnp_IpAddr: "192.168.1.1",
        vnp_Locale: "vn",
        vnp_OrderInfo: `Thanh toán ${phase} cho đơn ${reservationID}`,
        vnp_OrderType: "250000",
        vnp_ReturnUrl: config.VNPay.returnUrl,
        vnp_TxnRef: transId,
      };

      // Sắp xếp tham số
      vnpParams = sortObject(vnpParams);

      // Tạo chữ ký SHA512
      const signData = querystring.stringify(vnpParams, { encode: false });
      const hmac = crypto.createHmac("sha512", config.VNPay.hashSecret);
      const signed = hmac.update(signData).digest("hex");
      vnpParams["vnp_SecureHash"] = signed;

      // Tạo URL thanh toán
      const paymentUrl = `${config.VNPay.vnp_Url}?${querystring.stringify(
        vnpParams,
        { encode: true }
      )}`;

      // Tạo transaction mới
      const transaction = new Transaction({
        payment: payment._id,
        phase,
        amount,
        method: "VNPAY",
        transactionCode: transId,
        status: "PENDING",
      });

      await transaction.save();

      return { paymentUrl, transaction };
    } catch (error) {
      throw new Error("Error creating payment URL: " + error.message);
    }
  }

  /**
   * Xác thực phản hồi từ VNPay và cập nhật trạng thái thanh toán
   */
  async validatePaymentReturn(vnpParams) {
    const secureHash = vnpParams["vnp_SecureHash"];
    delete vnpParams["vnp_SecureHash"];
    delete vnpParams["vnp_SecureHashType"];

    // Sắp xếp lại tham số
    vnpParams = this.sortObject(vnpParams);
    const signData = querystring.stringify(vnpParams, { encode: false });

    // Kiểm tra chữ ký hợp lệ
    const hmac = crypto.createHmac("sha512", config.VNPay.hashSecret);
    const signed = hmac.update(signData).digest("hex");

    if (secureHash !== signed) {
      return { isSuccess: false, message: "Invalid signature" };
    }

    // Lấy thông tin transaction từ DB
    const transaction = await Transaction.findOne({
      transactionCode: vnpParams["vnp_TxnRef"],
    });
    if (!transaction) {
      return { isSuccess: false, message: "Transaction not found" };
    }

    // Kiểm tra trạng thái giao dịch
    if (transaction.status !== "PENDING") {
      return { isSuccess: false, message: "Transaction already processed" };
    }

    // Kiểm tra số tiền hợp lệ
    if (parseInt(vnpParams["vnp_Amount"]) / 100 !== transaction.amount) {
      return { isSuccess: false, message: "Invalid amount" };
    }

    // Nếu thanh toán thành công
    if (vnpParams["vnp_ResponseCode"] === "00") {
      transaction.status = "PAID";
      await transaction.save();

      // Cập nhật Payment tổng số tiền đã thanh toán
      const payment = await Payment.findById(transaction.payment);
      payment.totalPaid += transaction.amount;

      // Nếu thanh toán đủ thì đánh dấu Payment là COMPLETED
      if (payment.totalPaid >= payment.totalAmount) {
        payment.status = "COMPLETED";
      } else {
        payment.status = "IN_PROGRESS";
      }

      await payment.save();

      return { isSuccess: true, message: "Payment successful" };
    }

    return { isSuccess: false, message: "Payment failed" };
  }

  /**
   * Sắp xếp object theo key
   */
  sortObject(obj) {
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        if (obj[key]) result[key] = obj[key];
        return result;
      }, {});
  }
}

module.exports = new PaymentService();
