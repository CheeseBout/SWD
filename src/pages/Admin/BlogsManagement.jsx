import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { blogService } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { toast } from "react-toastify";
import AdminSideBar from "../../components/Sidebar/AdminSidebar";
import {
  PlusIcon,
  PencilAltIcon,
  TrashIcon,
  ExternalLinkIcon,
  SearchIcon,
  FilterIcon,
  EyeIcon,
} from "@heroicons/react/outline";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 8;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await blogService.getAllBlogs();
        let blogData = [];

        if (response?.data) {
          blogData = response.data;
        } else if (Array.isArray(response)) {
          blogData = response;
        } else {
          throw new Error("Invalid blog data format");
        }

        blogData.sort((a, b) => {
          const dateA = new Date(
            a.createdAt ||
              a.created_at ||
              a.postDate ||
              a.updatedAt ||
              a.date ||
              0
          );
          const dateB = new Date(
            b.createdAt ||
              b.created_at ||
              b.postDate ||
              b.updatedAt ||
              b.date ||
              0
          );

          return dateB - dateA;
        });

        setBlogs(blogData);
        setFilteredBlogs(blogData);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [refreshTrigger]);

  useEffect(() => {
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

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  const handleDelete = (blog) => {
    setCurrentBlog(blog);
    document.getElementById("delete_blog_modal").checked = true;
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const Pagination = () => {
    return (
      <div className="flex justify-center mt-6">
        <div className="join">
          <button
            className="join-item btn btn-sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            «
          </button>
          <button
            className="join-item btn btn-sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          <button className="join-item btn btn-sm">
            Page {currentPage} of {totalPages}
          </button>
          <button
            className="join-item btn btn-sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            ›
          </button>
          <button
            className="join-item btn btn-sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>
    );
  };

  if (loading && blogs.length === 0)
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <AdminSideBar />
        <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600"></p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <AdminSideBar />
        <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <ErrorMessage error={error} />
            <button
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              className="mt-4 btn btn-primary w-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminSideBar />

      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Blog Management
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
              onChange={handleSearch}
              className="input input-bordered w-full pl-10"
              placeholder="Search blogs..."
            />
          </div>

          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="select select-bordered w-full pl-10"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex justify-start lg:justify-end">
            <Link
              to="/manage/blogs/create"
              className="btn btn-primary w-full lg:w-auto"
            >
              <PlusIcon className="h-5 w-5" />
              Add New Blog
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="stat bg-white shadow-sm rounded-lg">
            <div className="stat-title">Total Blogs</div>
            <div className="stat-value">{blogs.length}</div>
          </div>
          <div className="stat bg-white shadow-sm rounded-lg">
            <div className="stat-title">Published</div>
            <div className="stat-value text-green-600">
              {
                blogs.filter(
                  (blog) => (blog.stage || "").toLowerCase() === "published"
                ).length
              }
            </div>
          </div>
          <div className="stat bg-white shadow-sm rounded-lg">
            <div className="stat-title">Drafts</div>
            <div className="stat-value text-yellow-600">
              {
                blogs.filter(
                  (blog) => (blog.stage || "").toLowerCase() === "draft"
                ).length
              }
            </div>
          </div>
          <div className="stat bg-white shadow-sm rounded-lg">
            <div className="stat-title">Archived</div>
            <div className="stat-value text-gray-600">
              {
                blogs.filter(
                  (blog) => (blog.stage || "").toLowerCase() === "archived"
                ).length
              }
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center my-4">
            <LoadingSpinner size="md" />
          </div>
        )}

        {!loading && filteredBlogs.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0  0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No blogs found
              </h3>
              {searchTerm || statusFilter !== "all" ? (
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria
                </p>
              ) : (
                <p className="text-gray-600 mb-6">
                  Get started by creating your first blog post
                </p>
              )}
              <div className="flex flex-wrap gap-4 justify-center">
                {(searchTerm || statusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="btn btn-outline"
                  >
                    Clear Filters
                  </button>
                )}
                <Link to="/manage/blogs/create" className="btn btn-primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create New Blog
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentBlogs.map((blog) => (
                    <tr
                      key={blog.id || blog._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                            {blog.coverPhoto ? (
                              <img
                                src={blog.coverPhoto}
                                alt=""
                                className="h-10 w-10 object-cover rounded-md"
                              />
                            ) : (
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
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {blog.title}
                            </div>
                            {blog.slug && (
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <span className="mr-1 hidden sm:inline">
                                  /blogs/{blog.slug}
                                </span>
                                <span className="mr-1 inline sm:hidden">
                                  View
                                </span>
                                <a
                                  href={`/blogs/${blog.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <ExternalLinkIcon className="h-3 w-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="text-sm text-gray-500">
                          {blog.author?.name || "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="text-sm text-gray-500">
                          {new Date(
                            blog.postDate || blog.created_at
                          ).toLocaleDateString("en-GB")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                          {blog.slug ? (
                            <Link
                              to={`/manage/blogs/edit/${blog.slug}`}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                              title="Edit blog"
                            >
                              <PencilAltIcon className="h-5 w-5" />
                            </Link>
                          ) : (
                            <span
                              className="text-gray-400 p-1"
                              title="Missing slug - cannot edit"
                            >
                              <PencilAltIcon className="h-5 w-5" />
                            </span>
                          )}
                          <button
                            onClick={() => handleDelete(blog)}
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

            {totalPages > 1 && <Pagination />}

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
        )}

        <ConfirmationModal
          id="delete_blog_modal"
          title="Delete Blog"
          message={
            currentBlog
              ? `Are you sure you want to delete "${currentBlog?.title}"? This action cannot be undone.`
              : ""
          }
          confirmText="Delete"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}
