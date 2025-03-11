import apiClient from "../configs/axiosConfig";

const getPosts = async () => {
  try {
    const response = await apiClient.get("/blog");
    return response;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw error;
  }
};

const getPostBySlug = async (slug) => {
  try {
    const response = await apiClient.get(`/blog/${slug}`);
    return response;
  } catch (error) {
    console.error("Error fetching blog detail:", error);
    throw error;
  }
};

export default {
  getPosts,
  getPostBySlug,
};
