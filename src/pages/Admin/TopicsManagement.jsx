import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { topicService } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import AdminSideBar from "../../components/Sidebar/AdminSidebar";
import TopicForm from "../../components/Admin/TopicForm";
import { toast } from "react-toastify";
import {
  PlusIcon,
  PencilAltIcon,
  TrashIcon,
  SearchIcon,
  FilterIcon,
  EyeIcon,
  LockOpenIcon,
  LockClosedIcon,
} from "@heroicons/react/outline";

export default function TopicsManagement() {
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const topicsPerPage = 8;

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const response = await topicService.getAllTopics();
        let topicsData = [];

        if (response?.data?.topics) {
          topicsData = response.data.topics;
        } else if (Array.isArray(response)) {
          topicsData = response;
        } else {
          throw new Error("Invalid topics data format");
        }

        topicsData.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at);
          const dateB = new Date(b.createdAt || b.created_at);
          return dateB - dateA;
        });

        setTopics(topicsData);
        setFilteredTopics(topicsData);
      } catch (err) {
        console.error("Error fetching topics:", err);
        setError("Failed to load topics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [refreshTrigger]);

  useEffect(() => {
    let results = topics;

    if (searchTerm) {
      results = results.filter(
        (topic) =>
          topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          topic.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      results = results.filter(
        (topic) => topic.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredTopics(results);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, topics]);

  const indexOfLastTopic = currentPage * topicsPerPage;
  const indexOfFirstTopic = indexOfLastTopic - topicsPerPage;
  const currentTopics = filteredTopics.slice(
    indexOfFirstTopic,
    indexOfLastTopic
  );
  const totalPages = Math.ceil(filteredTopics.length / topicsPerPage);

  const handleDelete = (topic) => {
    setCurrentTopic(topic);
    document.getElementById("delete_topic_modal").checked = true;
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const deleteData = {
        topicId: currentTopic._id,
      };

      await topicService.deleteTopic(deleteData);
      setRefreshTrigger((prev) => prev + 1);
      toast.success("Topic deleted successfully");
    } catch (err) {
      console.error("Error deleting topic:", err);
      toast.error("Failed to delete topic");
    } finally {
      setLoading(false);
      const modal = document.getElementById("delete_topic_modal");
      if (modal && typeof modal.checked !== "undefined") {
        modal.checked = false;
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const openCreateModal = () => {
    const modal = document.getElementById("create_topic_modal");
    if (modal) {
      modal.showModal();
    }
  };

  const openEditModal = (topic) => {
    setCurrentTopic(topic);
    const modal = document.getElementById("edit_topic_modal");
    if (modal) {
      modal.showModal();
    }
  };

  const handleCreateSubmit = async (formData) => {
    try {
      setLoading(true);
      await topicService.createTopic(formData);

      const modal = document.getElementById("create_topic_modal");
      if (modal) {
        modal.close();
      }

      setRefreshTrigger((prev) => prev + 1);
      toast.success("Topic created successfully");
    } catch (error) {
      console.error("Error creating topic:", error);
      toast.error("Failed to create topic");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      setLoading(true);
      const updateData = {
        topicId: currentTopic._id,
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
      };

      await topicService.updateTopic(updateData);

      const modal = document.getElementById("edit_topic_modal");
      if (modal) {
        modal.close();
      }

      setRefreshTrigger((prev) => prev + 1);
      toast.success("Topic updated successfully");
    } catch (error) {
      console.error("Error updating topic:", error);
      toast.error("Failed to update topic");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (topic) => {
    try {
      setLoading(true);
      const updateData = {
        topicId: topic._id,
      };

      if (topic.status === "active") {
        await topicService.deleteTopic(updateData);
        toast.success("Topic deactivated successfully");
      } else {
        await topicService.activateTopic(updateData);
        toast.success("Topic activated successfully");
      }
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error toggling topic status:", error);
      toast.error(
        `Failed to ${
          topic.status === "active" ? "deactivate" : "activate"
        } topic`
      );
    } finally {
      setLoading(false);
    }
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

  if (loading && topics.length === 0)
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
            Topic Management
          </h1>
          <p className="text-gray-600">
            Create, edit and manage your learning topics
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
              placeholder="Search topics..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-start lg:justify-end">
            <button
              onClick={openCreateModal}
              className="btn btn-primary w-full lg:w-auto"
            >
              <PlusIcon className="h-5 w-5" />
              Add New Topic
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat bg-white shadow-sm rounded-lg">
            <div className="stat-title">Total Topics</div>
            <div className="stat-value">{topics.length}</div>
          </div>
          <div className="stat bg-white shadow-sm rounded-lg">
            <div className="stat-title">Active</div>
            <div className="stat-value text-green-600">
              {topics.filter((topic) => topic.status === "active").length}
            </div>
          </div>
          <div className="stat bg-white shadow-sm rounded-lg">
            <div className="stat-title">Inactive</div>
            <div className="stat-value text-gray-600">
              {topics.filter((topic) => topic.status === "inactive").length}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center my-4">
            <LoadingSpinner size="md" />
          </div>
        )}

        {!loading && filteredTopics.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No topics found
              </h3>
              {searchTerm || statusFilter !== "all" ? (
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria
                </p>
              ) : (
                <p className="text-gray-600 mb-6">
                  Get started by creating your first topic
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
                <button onClick={openCreateModal} className="btn btn-primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create New Topic
                </button>
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
                      Topic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quizzes
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentTopics.map((topic) => (
                    <tr
                      key={topic._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                            {topic.imageUrl ? (
                              <img
                                src={topic.imageUrl}
                                alt=""
                                className="h-10 w-10 object-cover rounded-md"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/40x40?text=Topic";
                                }}
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
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {topic.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {topic.description || "No description"}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="text-sm text-gray-500">
                          {new Date(topic.createdAt).toLocaleDateString(
                            "en-GB"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            topic.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {topic.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {topic.quiz?.length || topic.quizzes?.length || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/topics/${topic._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View topic"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>

                          <button
                            onClick={() => openEditModal(topic)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                            title="Edit topic"
                          >
                            <PencilAltIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(topic)}
                            className={`p-1 rounded ${
                              topic.status === "active"
                                ? "text-green-600 hover:text-green-900 hover:bg-green-50"
                                : "text-red-600 hover:text-red-900 hover:bg-red-50"
                            }`}
                            title={
                              topic.status === "active"
                                ? "Deactivate topic"
                                : "Activate topic"
                            }
                          >
                            {topic.status === "active" ? (
                              <LockOpenIcon className="h-5 w-5" />
                            ) : (
                              <LockClosedIcon className="h-5 w-5" />
                            )}
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
                Showing {indexOfFirstTopic + 1}-
                {Math.min(indexOfLastTopic, filteredTopics.length)} of{" "}
                {filteredTopics.length} topics
                {(searchTerm || statusFilter !== "all") && (
                  <span> (filtered from {topics.length} total topics)</span>
                )}
              </div>
            </div>
          </div>
        )}

        <dialog id="create_topic_modal" className="modal backdrop-blur-sm">
          <div className="modal-box">
            <h3 className="text-xl font-semibold mb-4">Create New Topic</h3>
            <TopicForm
              onSubmit={handleCreateSubmit}
              onCancel={() => {
                const modal = document.getElementById("create_topic_modal");
                if (modal) {
                  modal.close();
                }
              }}
              isSubmitting={loading}
              submitButtonText="Create Topic"
            />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        {/* Edit Topic Modal */}
        <dialog id="edit_topic_modal" className="modal backdrop-blur-sm">
          <div className="modal-box">
            <h3 className="text-xl font-semibold mb-4">Edit Topic</h3>
            <TopicForm
              initialData={currentTopic}
              onSubmit={handleEditSubmit}
              onCancel={() => {
                const modal = document.getElementById("edit_topic_modal");
                if (modal) {
                  modal.close();
                }
              }}
              isSubmitting={loading}
              submitButtonText="Save Changes"
            />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        <ConfirmationModal
          id="delete_topic_modal"
          title="Delete Topic"
          message={
            currentTopic
              ? `Are you sure you want to delete "${currentTopic.name}"? This action cannot be undone.`
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
