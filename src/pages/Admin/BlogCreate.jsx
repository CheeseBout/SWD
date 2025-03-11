import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { blogService } from "../../services/api";
import { toast } from "react-toastify";
import BlogForm from "../../components/Admin/BlogForm";

export default function BlogCreate() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("draft");
  const [coverPhoto, setCoverPhoto] = useState("");
  const [slug, setSlug] = useState("");

  const handleSubmit = async (blogData) => {
    setIsSubmitting(true);

    try {
      await blogService.createBlog(blogData);
      toast.success("Blog created successfully");
      navigate("/admin/blogs");
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error("Failed to create blog");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Blog Post</h1>
      </div>

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
        onCancel={() => navigate("/admin/blogs")}
        autoGenerateSlug={true}
      />
    </div>
  );
}
