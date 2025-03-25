import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { blogService } from "../../services/api";
import { toast } from "react-toastify";
import BlogForm from "../../components/Admin/BlogForm";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function BlogEdit() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    async function fetchBlog() {
      try {
        const response = await blogService.getBlogBySlug(slug);
        if (response && response.data) {
          setBlog(response.data);
          // Set initial cover photo as preview if it exists
          if (response.data.coverPhoto) {
            setImagePreview(response.data.coverPhoto);
          }
        } else {
          setError("Blog post not found");
        }
      } catch (err) {
        console.error("Error fetching blog post:", err);
        setError("Failed to load the blog post. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchBlog();
  }, [slug]);
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

    try {
      await blogService.updateBlog(blogData, blog.id || blog._id);
      toast.success("Blog updated successfully");

      // Đợi 500ms trước khi navigate để server có thời gian xử lý
      setTimeout(() => {
        navigateToAppropriateBlogs();
      }, 500);
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error("Failed to update blog");
      setIsSubmitting(false);
    }
  };
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Blog Post</h1>
      </div>
      {blog && (
        <BlogForm
          title={blog.title}
          setTitle={(title) => setBlog({ ...blog, title })}
          category={blog.category}
          setCategory={(category) => setBlog({ ...blog, category })}
          status={blog.status}
          setStatus={(status) => setBlog({ ...blog, status })}
          coverPhoto={blog.coverPhoto || ""}
          setCoverPhoto={(coverPhoto) => setBlog({ ...blog, coverPhoto })}
          slug={blog.slug}
          setSlug={(slug) => setBlog({ ...blog, slug })}
          initialContent={blog.content.html}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          submitButtonText="Update Blog"
          onCancel={() => navigateToAppropriateBlogs()}
          autoGenerateSlug={false}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
        />
      )}
    </div>
  );
}
