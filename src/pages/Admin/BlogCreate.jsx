import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { blogService } from "../../services/api";
import { toast } from "react-toastify";
import BlogForm from "../../components/Admin/BlogForm";

export default function BlogCreate() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  const [coverPhoto, setCoverPhoto] = useState("");
  const [slug, setSlug] = useState("");

  const navigateToAppropriateBlogs = () => {
    const therapistId = localStorage.getItem("therapistId");
    if (therapistId) {
      navigate("/therapist/blogs");
    } else {
      navigate("/admin/blogs");
    }
  };

  const handleSubmit = async (blogData) => {
    setIsSubmitting(true);
    setError(null);

    if (!blogData.title || !blogData.slug) {
      setError("Title and slug are required fields");
      setIsSubmitting(false);
      toast.error("Title and slug are required fields");
      return;
    }

    try {
      if (!blogData.postDate) {
        blogData.postDate = new Date().toISOString().split("T")[0];
      }

      console.log("Submitting blog data:", JSON.stringify(blogData, null, 2));

      const response = await blogService.createBlog(blogData);
      toast.success("Blog created successfully");
      setTimeout(() => {
        navigateToAppropriateBlogs();
      }, 500);
    } catch (error) {
      console.error("Error creating blog:", error);

      const errorMsg =
        error.message ||
        "Failed to create blog. Please check all required fields and try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Blog Post</h1>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <BlogForm
        title={title}
        setTitle={setTitle}
        category={category}
        setCategory={setCategory}
        status={status}
        setStatus={setStatus}
        coverPhoto={coverPhoto}
        setCoverPhoto={setCoverPhoto}
        slug={slug}
        setSlug={setSlug}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        submitButtonText="Create Blog"
        onCancel={navigateToAppropriateBlogs}
        autoGenerateSlug={true}
      />
    </div>
  );
}
