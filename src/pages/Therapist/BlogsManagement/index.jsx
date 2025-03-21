import { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import {
  SearchIcon,
  PencilAltIcon,
  TrashIcon,
  PlusCircleIcon,
  ExclamationCircleIcon,
  FilterIcon,
  ExternalLinkIcon,
  EyeIcon,
} from "@heroicons/react/outline";
import { AuthContext } from "../../../contexts/AuthContextObject";
import TherapistSidebar from "../../../components/SideBar/TherapistSidebar";
import { blogService } from "../../../services/api";

export default function TherapistBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const { user } = useContext(AuthContext);
  const blogsPerPage = 8;


  const [refreshTrigger, setRefreshTrigger] = useState();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const userId = user?._id || localStorage.getItem("userId");

        const response = await blogService.getAllBlogs();

        if (response?.data) {
          // Filter blogs client-side to show only therapist's own blogs
          const therapistBlogs = response.data.filter(
            (blog) => blog.author?.userId === userId
          );
          // Sort blogs by date (newest first)
          therapistBlogs.sort((a, b) => {
            const dateA = new Date(a.postDate || a.created_at);
            const dateB = new Date(b.postDate || b.created_at);
            return dateB - dateA;
          });

          setBlogs(therapistBlogs);
          setFilteredBlogs(therapistBlogs);
        } else {
          setBlogs([]);
          setFilteredBlogs([]);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast.error("Failed to load blogs");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, [refreshTrigger]);

  useEffect(() => {
    // Apply client-side filtering on search term or status changes
    let results = blogs;

    if (searchTerm) {
      results = results.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (blog.slug &&
            blog.slug.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== "all") {
      results = results.filter(
        (blog) =>
          (blog.stage || "DRAFT").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredBlogs(results);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, blogs]);

  const handleDeleteClick = (blog) => {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;
    try {
      setIsLoading(true);
      // Try both ID formats
      const blogId = blogToDelete.id || blogToDelete._id;
      await blogService.deleteBlog(blogId);
      toast.success("Blog deleted successfully");

      // Optimistically update the UI immediately
      const updatedBlogs = blogs.filter(
        (blog) => blog.id !== blogId && blog._id !== blogId
      );
      setBlogs(updatedBlogs);
      setFilteredBlogs((prevFiltered) =>
        prevFiltered.filter((blog) => blog.id !== blogId && blog._id !== blogId)
      );
      setShowDeleteModal(false);
      // setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog");
    } finally {
      setIsLoading(false);
    }
  };
  // Calculate pagination details
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <div className="sticky top-0 h-screen">
          <TherapistSidebar />
        </div>

        <div className="flex-1 p-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Manage Your Blogs
              </h1>
              <p className="text-gray-600">
                Create, edit and manage your blog posts
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                  placeholder="Search blogs..."
                />
              </div>

              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FilterIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full appearance-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="flex justify-start lg:justify-end">
                <Link
                  to="/manage/blogs/create"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md inline-flex items-center transition-colors duration-150 w-full lg:w-auto justify-center"
                >
                  <PlusCircleIcon className="h-5 w-5 mr-2" />
                  <span>Create New Blog</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
                <div className="text-xs font-medium uppercase text-gray-500">
                  Total Blogs
                </div>
                <div className="text-2xl font-bold">{blogs.length}</div>
              </div>
              <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
                <div className="text-xs font-medium uppercase text-gray-500">
                  Published
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {
                    blogs.filter(
                      (blog) => (blog.stage || "").toLowerCase() === "published"
                    ).length
                  }
                </div>
              </div>
              <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
                <div className="text-xs font-medium uppercase text-gray-500">
                  Drafts
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {
                    blogs.filter(
                      (blog) => (blog.stage || "").toLowerCase() === "draft"
                    ).length
                  }
                </div>
              </div>
            </div>

            {isLoading && blogs.length === 0 ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <PencilAltIcon className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No blogs found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "You haven't created any blogs yet."}
                </p>
                {searchTerm || statusFilter !== "all" ? (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md inline-flex items-center transition-colors duration-150 mr-3"
                  >
                    Clear Filters
                  </button>
                ) : null}
                <Link
                  to="/manage/blogs/create"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md inline-flex items-center transition-colors duration-150"
                >
                  <PlusCircleIcon className="h-5 w-5 mr-2" />
                  <span>Create Your First Blog</span>
                </Link>
              </div>
            ) : (
              <>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentBlogs.map((blog) => (
                          <tr
                            key={blog.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {blog.coverPhoto ? (
                                    <img
                                      className="h-10 w-10 rounded-md object-cover"
                                      src={blog.coverPhoto}
                                      alt={blog.title}
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={1}
                                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {blog.title}
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center mt-1">
                                    {blog.slug && (
                                      <>
                                        <span className="mr-1 hidden sm:inline">
                                          /blogs/{blog.slug}
                                        </span>
                                        <a
                                          href={`/blogs/${blog.slug}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-500 hover:text-blue-700"
                                        >
                                          <ExternalLinkIcon className="h-3 w-3" />
                                        </a>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                                  blog.stage === "PUBLISHED"
                                    ? "bg-green-100 text-green-800"
                                    : blog.stage === "DRAFT"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {blog.stage
                                  ? blog.stage.toLowerCase()
                                  : "draft"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {dayjs(blog.postDate || blog.created_at).format(
                                "MMM D, YYYY"
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <a
                                  href={`/blogs/${blog.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="View blog"
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </a>
                                <Link
                                  to={`/manage/blogs/edit/${blog.slug}`}
                                  className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                                  title="Edit blog"
                                >
                                  <PencilAltIcon className="h-5 w-5" />
                                </Link>
                                <button
                                  onClick={() => handleDeleteClick(blog)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                  title="Delete blog"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center my-6">
                      <div className="flex space-x-1">
                        <button
                          className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                        >
                          «
                        </button>
                        <button
                          className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                        >
                          ‹
                        </button>
                        <span className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          ›
                        </button>
                        <button
                          className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                        >
                          »
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="px-6 py-4 border-t bg-gray-50">
                    <div className="text-sm text-gray-500">
                      Showing {indexOfFirstBlog + 1}-
                      {Math.min(indexOfLastBlog, filteredBlogs.length)} of{" "}
                      {filteredBlogs.length} blogs
                      {(searchTerm || statusFilter !== "all") && (
                        <span> (filtered from {blogs.length} total blogs)</span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

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
