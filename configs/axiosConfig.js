import axios from "axios";
import appConfig from "./app.config";
import { getTokens } from "../utils/tokenStorage";

// Create an Axios instance with default configs
const apiClient = axios.create({
  baseURL: appConfig.BASE_API_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  async (config) => {
    const tokens = await getTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    console.log(
      `Making ${config.method.toUpperCase()} request to: ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Thêm interceptor để refresh token khi token hết hạn
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `Response from ${response.config.url}: Status ${response.status}`
    );
    return response;
  },
  async (error) => {
    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject(
        new Error("Network error. Please check your connection.")
      );
    }

    // Log detailed error information
    console.error("API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });

    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const tokens = await getTokens();
      // Thêm logic refresh token ở đây
    }
    return Promise.reject(error);
  }
);

export default apiClient;
