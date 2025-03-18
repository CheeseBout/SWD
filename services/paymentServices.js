import apiClient from "../configs/axiosConfig";
import { getTokens } from "../utils/tokenStorage";

const paymentServices = {
  createPaymentUrl: async (paymentData) => {
    console.log("Creating payment URL with data:", paymentData);
    try {
      // Include amount explicitly as a separate field
      const paymentDataWithRedirect = {
        ...paymentData,
        totalPrice: paymentData.totalPrice,
        returnUrl: "swdmobile://payment/result",
      };

      console.log(
        "Payment data with redirect:",
        JSON.stringify(paymentDataWithRedirect)
      );

      const response = await apiClient.post(
        "/payment/create-payment-url",
        paymentDataWithRedirect
      );

      console.log("Payment URL response:", response.data);

      // Validate payment URL has amount parameter
      if (
        response.data?.data?.paymentUrl &&
        response.data.data.paymentUrl.includes("vnp_Amount=0")
      ) {
        console.error("Warning: Payment URL has zero amount");
      }

      return response.data;
    } catch (error) {
      console.error("Error creating payment URL:", error);
      throw error;
    }
  },
};

export default paymentServices;
