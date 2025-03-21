const PAYMENT = require("../models/payment.model");

class PaymentRepository {
  async calculateAllPayments() {
    try {
      const payments = await PAYMENT.find();
      console.log("payments", payments);

      if (!payments || payments.length === 0) {
        console.log("No payments found");
        return 0;
      }

      const sum = payments.reduce((acc, payment) => {
        return acc + (payment.totalPaid || 0);
      }, 0);

      return sum;
    } catch (error) {
      console.error("Error calculating payments:", error);
      throw error;
    }
  }

  async getPaymentById(paymentId) {
    try {
      const payment = await PAYMENT.findById(paymentId);
      return payment;
    } catch (error) {
      console.error("Error getting payment by ID:", error);
      throw error;
    }
  }
}

module.exports = new PaymentRepository();
