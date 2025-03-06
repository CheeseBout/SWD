import axios from "axios";
import appConfig from "./app.config";
import { getTokens } from "../utils/tokenStorage";

// Create an Axios instance with default configs
const apiClient = axios.create({
  baseURL: appConfig.BASE_API_URL,
  timeout: 10000, // 10 seconds timeout
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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để refresh token khi token hết hạn
apiClient.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
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
