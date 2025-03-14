import { api, BASE_URL } from "../apiConfig";

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/api/v1/auth/login", {
        email,
        password,
      });

      localStorage.setItem("accessToken", response.data.token);

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

  changePassword: async (data) => {
    const response = await api.post("/api/v1/auth/change-password", data);
    return response.data;
  },

  linkGoogleAccount: async (code) => {
    if (code) {
      // If we have a code, we're handling the callback
      try {
        const response = await api.post(
          "/api/v1/auth/therapist-google-callback",
          { code }
        );
        return response.data;
      } catch (error) {
        console.error("Google callback error:", error);
        throw error;
      }
    } else {
      // If no code, we're initiating the connection
      try {
        // Use the api instance which should have proper headers already set up
        const response = await api.get(
          "/api/v1/auth/therapist-google-auth-url"
        );

        // Check the response format based on the actual server response
        if (response.data && response.data.data && response.data.data.authUrl) {
          // Open Google auth URL in the same window
          window.location.href = response.data.data.authUrl;
          return { redirected: true };
        } else {
          throw new Error("Invalid response from server: Missing authUrl");
        }
      } catch (error) {
        console.error("Error getting Google auth URL:", error);
        throw error;
      }
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get("/api/v1/users/me");
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw error;
    }
  },

  disconnectGoogleAccount: async () => {
    try {
      const response = await api.post(
        "/api/v1/auth/therapist-google-disconnect"
      );
      return response.data;
    } catch (error) {
      console.error("Google disconnection error:", error);
      throw error;
    }
  },
};
