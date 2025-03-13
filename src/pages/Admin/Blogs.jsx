import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { blogService } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { toast } from "react-toastify";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentBlog, setCurrentBlog] = useState(null);
  
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await blogService.getAllBlogs();
        if (response?.data) {
          setBlogs(response.data);
        } else if (Array.isArray(response)) {
          setBlogs(response);
        } else {
          throw new Error("Invalid blog data format");
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [refreshTrigger]);

  const handleDelete = (blog) => {
    setCurrentBlog(blog);
    document.getElementById('delete_blog_modal').checked = true;
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await blogService.deleteBlog(currentBlog.id || currentBlog._id);
      setRefreshTrigger((prev) => prev + 1);
      toast.success("Blog deleted successfully");
    } catch (err) {
      console.error("Error deleting blog:", err);
      toast.error("Failed to delete blog");
    } finally {
      setLoading(false);
    }
  };

  if (loading && blogs.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Management</h1>

        <Link
          to="/manage/blogs/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Blog
        </Link>
      </div>

      {loading && <div className="text-center py-4">Updating...</div>}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <tr key={blog.id || blog._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {blog.title}
                    </div>
                    {blog.slug && (
                      <div className="text-xs text-gray-500">
                        /blogs/{blog.slug}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {blog.author?.name || "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(
                        blog.createdAt || blog.created_at
                      ).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        blog.stage === "PUBLISHED"
                          ? "bg-green-100 text-green-800"
                          : blog.stage === "DRAFT"
                          ? "bg-yellow-100 text-yellow-800"
                          : blog.stage === "ARCHIVED"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {blog.stage || "DRAFT"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {blog.slug ? (
                      <>
                        <Link
                          to={`/manage/blogs/edit/${blog.slug}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </Link>
                      </>
                    ) : (
                      <span className="text-gray-400 mr-4" title="Missing slug - cannot edit">Edit</span>
                    )}
                    <button
                      onClick={() => handleDelete(blog)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No blogs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        id="delete_blog_modal"
        title="Delete Blog"
        message={currentBlog ? `Are you sure you want to delete "${currentBlog?.title}"? This action cannot be undone.` : ""}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
