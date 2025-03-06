import { api, BASE_URL } from '../apiConfig';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/api/v1/auth/login", {
        email,
        password,
      });
      console.log("Login API response:", response.data);

      // Store the token
      localStorage.setItem("accessToken", response.data.token);

      // Return the full response data
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  loginWithGoogle: async () => {
    window.location.href = `${BASE_URL}/api/v1/auth/login/google`;
  },

  register: async (formData) => {
    try {
      const response = await api.post("/api/v1/auth/register", formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || "Registration failed";
    }
  },

  forgotPassword: async (email) => {
    const response = await api.post("/api/v1/auth/forgot-password", { email });
    return response.data;
  },
};
