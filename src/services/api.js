import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/api/v1/auth/login", { email, password });
      console.log("Login API response:", response.data); // Add this line
      
      // Store the token
      localStorage.setItem('accessToken', response.data.token);
      
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

export const userService = {
  getAllUsers: async () => {
    const response = await api.get("/api/v1/users");
    return response.data;
  },

  getUserById: async (id) => {
    try {
      if (!id) {
        throw new Error('User ID is required');
      }
      console.log(`Fetching user with ID: ${id}`);
      const response = await api.get(`/api/v1/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  },
};

export const topicService = {
  getAllTopics: async () => {
    const response = await api.get("/api/v1/topics");
    return response.data;
  },

  getTopicById: async (id) => {
    const response = await api.get(`/api/v1/topics/${id}`);
    return response.data;
  },
};

export const quizService = {
  getAllQuizzes: async () => {
    const response = await api.get("/api/v1/quiz");
    return response.data;
  },

  getQuizById: async (id) => {
    try {
      const response = await api.get(`/api/v1/quiz/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching quiz with ID ${id}:`, error);
      throw error;
    }
  },
};
