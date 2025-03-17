import apiClient from "../configs/axiosConfig";
import { getTokens } from "../utils/tokenStorage";

const paymentServices = {
  createPaymentUrl: async (paymentData) => {
    try {
      const tokens = await getTokens();
      // Thêm redirect URL vào payment data
      const paymentDataWithRedirect = {
        ...paymentData,
        returnUrl: "swdmobile://payment/result", // URL scheme của app
      };

      const response = await apiClient.post(
        "/payment/create-payment-url",
        paymentDataWithRedirect,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );

      console.log("Payment URL response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating payment URL:", error);
      throw error;
    }
  },
};

export default paymentServices;
