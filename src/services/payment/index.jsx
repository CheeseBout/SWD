import { api } from "../apiConfig";

const paymentService = {
  createPayment: async (paymentData) => {
    try {
      const response = await api.post(
        "/api/v1/payment/create-payment-url",
        paymentData
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating payment:", error);
      return { message: "Error creating payment" };
    }
  },
};
export default paymentService;
