import { api, BASE_URL } from "../apiConfig";

export const blogService = {
  getAllBlogs: async () => {
    try {
      const response = await api.get(`${BASE_URL}/api/v1/blog`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all blogs:", error);
      return [];
    }
  },

  getBlogBySlug: async (slug) => {
    try {
      const response = await api.get(`${BASE_URL}/api/v1/blog/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching blog with slug ${slug}:`, error);

      try {
        const allBlogs = await blogService.getAllBlogs();
        let blogs = [];

        if (allBlogs && Array.isArray(allBlogs)) {
          blogs = allBlogs;
        } else if (allBlogs && allBlogs.data && Array.isArray(allBlogs.data)) {
          blogs = allBlogs.data;
        }

        const blog = blogs.find((blog) => blog.slug === slug);

        if (blog) {
          return { data: blog };
        }
        return null;
      } catch (fallbackError) {
        console.error("Error in fallback blog retrieval:", fallbackError);
        return null;
      }
    }
  },

  createBlog: async (blogData) => {
    try {
      const response = await api.post(`${BASE_URL}/api/v1/blog/create-blog`, blogData);
      return response.data;
    } catch (error) {
      console.error("Error creating blog:", error);
      return null;
    }
  },

  updateBlog: async (blogData, id) => {
    try {
      const response = await api.put(`${BASE_URL}/api/v1/blog/${id}`, blogData);
      return response.data;
    } catch (error) {
      console.error("Error updating blog:", error);
      return null;
    }
  },

  deleteBlog: async (id) => {
    try {
      const response = await api.delete(`${BASE_URL}/api/v1/blog/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting blog:", error);
      return null;
    }
  },
};
