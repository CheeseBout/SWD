import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { quizService } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
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
  DocumentTextIcon,
} from "@heroicons/react/outline";

export default function QuizzesManagement() {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const quizzesPerPage = 8;

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await quizService.getAllQuizzes();
        let quizData = [];

        if (response?.data?.quizzes) {
          quizData = response.data.quizzes;
        } else if (response?.quizzes) {
          quizData = response.quizzes;
        } else if (Array.isArray(response)) {
          quizData = response;
        } else {
          throw new Error("Invalid quiz data format");
        }

        // Sort quizzes by date (newest first)
        quizData.sort((a, b) => {
          const dateA = new Date(a.lastEdited || a.createdAt || a.created_at);
          const dateB = new Date(b.lastEdited || b.createdAt || b.created_at);
          return dateB - dateA;
        });

        setQuizzes(quizData);
        setFilteredQuizzes(quizData);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setError("Failed to load quizzes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [refreshTrigger]);

  useEffect(() => {
    let results = quizzes;

    if (searchTerm) {
      results = results.filter(
        (quiz) =>
          quiz.quizName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (quiz.quizDescription &&
            quiz.quizDescription.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== "all") {
      results = results.filter(
        (quiz) => quiz.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredQuizzes(results);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, quizzes]);

  const indexOfLastQuiz = currentPage * quizzesPerPage;
  const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
  const currentQuizzes = filteredQuizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);
  const totalPages = Math.ceil(filteredQuizzes.length / quizzesPerPage);

  const handleDelete = (quiz) => {
    setCurrentQuiz(quiz);
    document.getElementById("delete_quiz_modal").checked = true;
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await quizService.deleteQuiz(currentQuiz._id);
      setRefreshTrigger((prev) => prev + 1);
      toast.success("Quiz deleted successfully");
    } catch (err) {
      console.error("Error deleting quiz:", err);
      toast.error("Failed to delete quiz");
    } finally {
      setLoading(false);
      document.getElementById("delete_quiz_modal").checked = false;
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

  if (loading && quizzes.length === 0)
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <AdminSideBar />
        <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading quizzes...</p>
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
            Quizzes Management
          </h1>
          <p className="text-gray-600">
            Create, edit and manage your assessment quizzes
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
              placeholder="Search quizzes..."
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
            <Link
              to="/manage/quizzes/create"
              className="btn btn-primary w-full lg:w-auto"
            >
              <PlusIcon className="h-5 w-5" />
              Add New Quiz
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat bg-white shadow-sm rounded-lg">
            <div className="stat-title">Total Quizzes</div>
            <div className="stat-value">{quizzes.length}</div>
          </div>
          <div className="stat bg-white shadow-sm rounded-lg">
            <div className="stat-title">Active</div>
            <div className="stat-value text-green-600">
              {
                quizzes.filter(
                  (quiz) => (quiz.status || "").toLowerCase() === "active"
                ).length
              }
            </div>
          </div>
          <div className="stat bg-white shadow-sm rounded-lg">
            <div className="stat-title">Inactive</div>
            <div className="stat-value text-gray-600">
              {
                quizzes.filter(
                  (quiz) => (quiz.status || "").toLowerCase() === "inactive"
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

        {!loading && filteredQuizzes.length === 0 ? (
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No quizzes found
              </h3>
              {searchTerm || statusFilter !== "all" ? (
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria
                </p>
              ) : (
                <p className="text-gray-600 mb-6">
                  Get started by creating your first quiz
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
                <Link to="/manage/quizzes/create" className="btn btn-primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create New Quiz
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
                      Quiz Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Last Edited
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Questions
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
                  {currentQuizzes.map((quiz) => (
                    <tr
                      key={quiz._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                            {quiz.imageUrl ? (
                              <img
                                src={quiz.imageUrl}
                                alt=""
                                className="h-10 w-10 object-cover rounded-md"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/40x40?text=Quiz";
                                }}
                              />
                            ) : (
                              <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {quiz.quizName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {quiz.quizDescription || "No description"}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="text-sm text-gray-500">
                          {new Date(quiz.lastEdited || quiz.createdAt || quiz.created_at).toLocaleDateString('en-GB')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {quiz.questions?.length || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            quiz.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {quiz.status || "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <a
                            href={`/quizzes/${quiz._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View quiz"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </a>
                          <Link
                            to={`/manage/quizzes/edit/${quiz._id}`}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                            title="Edit quiz"
                          >
                            <PencilAltIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(quiz)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete quiz"
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
                Showing {indexOfFirstQuiz + 1}-
                {Math.min(indexOfLastQuiz, filteredQuizzes.length)} of{" "}
                {filteredQuizzes.length} quizzes
                {(searchTerm || statusFilter !== "all") && (
                  <span> (filtered from {quizzes.length} total quizzes)</span>
                )}
              </div>
            </div>
          </div>
        )}

        <dialog id="delete_quiz_modal" className="modal">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Delete Quiz</h3>
            <p className="py-4">
              {currentQuiz
                ? `Are you sure you want to delete "${currentQuiz?.quizName}"? This action cannot be undone.`
                : ""}
            </p>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn btn-sm btn-ghost">Cancel</button>
              </form>
              <button
                onClick={confirmDelete}
                className="btn btn-sm bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </div>
  );
}
