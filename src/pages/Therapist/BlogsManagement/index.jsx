import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import TherapistSidebar from "../../../components/SideBar/TherapistSidebar";
import { AuthContext } from "../../../contexts/AuthContextObject";
import { blogService } from "../../../services/blog/blogService";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import {
  PencilAltIcon,
  TrashIcon,
  PlusCircleIcon,
  SearchIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/outline";

export default function TherapistBlogs() {
  const { user } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const therapistId = localStorage.getItem("therapistId");

  useEffect(() => {
    fetchBlogs();
  }, [searchTerm, currentPage]);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      // Fetch blogs created only by the current therapist
      const response = await blogService.getBlogs({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        authorId: therapistId, // Filter by current therapist ID
      });

      if (response?.data?.data) {
        setBlogs(response.data.data.blogs);
        setTotalPages(response.data.data.totalPages || 1);
      } else {
        setBlogs([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load your blogs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (blog) => {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;

    try {
      await blogService.deleteBlog(blogToDelete.slug);
      toast.success("Blog deleted successfully");
      setShowDeleteModal(false);
      fetchBlogs(); // Refresh the list
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <div className="sticky top-0 h-screen">
          <TherapistSidebar />
        </div>

        <div className="flex-1 p-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                Manage Your Blogs
              </h2>

              <div className="flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search blogs..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <SearchIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  <button type="submit" className="hidden">
                    Search
                  </button>
                </form>

                <Link
                  to="/manage/blogs/create"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md inline-flex items-center transition-colors duration-150"
                >
                  <PlusCircleIcon className="h-5 w-5 mr-2" />
                  <span>Create New Blog</span>
                </Link>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : blogs.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <PencilAltIcon className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No blogs found
                </h3>
                <p className="text-gray-500 mb-6">
                  You haven't created any blogs yet or none match your search
                  criteria.
                </p>
                <Link
                  to="/manage/blogs/create"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md inline-flex items-center transition-colors duration-150"
                >
                  <PlusCircleIcon className="h-5 w-5 mr-2" />
                  <span>Create Your First Blog</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Title
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Created
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {blogs.map((blog) => (
                      <tr key={blog._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={
                                  blog.thumbnail ||
                                  "https://via.placeholder.com/150?text=Blog"
                                }
                                alt={blog.title}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {blog.title}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {blog.description.substring(0, 60)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                              blog.status === "published"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {blog.status || "draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dayjs(blog.createdAt).format("MMM D, YYYY")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/manage/blogs/edit/${blog.slug}`}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            <PencilAltIcon className="h-5 w-5 inline" />
                            <span className="sr-only">Edit</span>
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(blog)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5 inline" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-4 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page{" "}
                      <span className="font-medium">{currentPage}</span> of{" "}
                      <span className="font-medium">{totalPages}</span> pages
                    </p>
                  </div>
                  <div>
                    <nav
                      className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-900 hover:bg-gray-50"
                        } ring-1 ring-inset ring-gray-300`}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold ${
                          currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-900 hover:bg-gray-50"
                        } ring-1 ring-inset ring-gray-300`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-center justify-center text-red-500 mb-4">
              <ExclamationCircleIcon className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-bold text-center mb-2">Delete Blog</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete "{blogToDelete?.title}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
