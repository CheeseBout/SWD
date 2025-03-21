const TRANSACTION = require("../models/transaction.model");

class TransactionRepository {
  async getAllTransactions() {
    try {
      const transactions = await TRANSACTION.find().populate("payment");
      return transactions;
    } catch (error) {
      throw error;
    }
  }
  async getRevenueByDate() {
    try {
      const transactions = await TRANSACTION.find().populate("payment");
      const paidTransactions = transactions.filter(
        (transaction) => transaction.status === "PAID"
      );
      return paidTransactions;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new TransactionRepository();
