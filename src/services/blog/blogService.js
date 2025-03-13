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
      if (!blogData.title) {
        throw new Error("Blog title is required");
      }
      
      if (!blogData.slug) {
        throw new Error("Blog slug is required");
      }

      const formattedBlogData = {
        title: blogData.title,
        slug: blogData.slug,
        category: blogData.category || "",
        coverPhoto: blogData.coverPhoto || "",
        content: blogData.content || { json: { type: "doc", content: [] } },
        tags: blogData.tags || [],
      };

      console.log("Sending blog data:", formattedBlogData);
      
      const response = await api.post(`${BASE_URL}/api/v1/blog/create-post`, formattedBlogData);
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error("Server responded with error:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      
      throw error;
    }
  },

  updateBlog: async (blogData, id) => {
    try {
      if (!id) {
        throw new Error("Blog ID is required for updating");
      }
      
      const formattedBlogData = {
        title: blogData.title,
        slug: blogData.slug,
        category: blogData.category || "",
        coverPhoto: blogData.coverPhoto || "",
        content: blogData.content || { json: { type: "doc", content: [] } },
        stage: blogData.stage || "DRAFT",
        tags: blogData.tags || [],
      };

      const response = await api.put(`${BASE_URL}/api/v1/blog/${id}`, formattedBlogData);
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error("Server error during blog update:", {
          status: error.response.status,
          data: error.response.data
        });
      } else {
        console.error("Error updating blog:", error.message);
      }
      throw error;
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

