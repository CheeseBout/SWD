import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { questionService } from "../../services/api";
import AdminSideBar from "../../components/Sidebar/AdminSidebar";
import {
  SearchIcon,
  FilterIcon,
  ViewListIcon,
  PencilAltIcon,
  LockOpenIcon,
  LockClosedIcon,
} from "@heroicons/react/outline";

export default function QuestionBanksManagement() {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentBank, setCurrentBank] = useState(null);
  const [bankFormData, setBankFormData] = useState({
    questionBankName: "",
    description: "",
  });

  const navigate = useNavigate();
  const itemsPerPage = 8;

  useEffect(() => {
    fetchQuestionBanks();
  }, [refreshTrigger]);

  useEffect(() => {
    let filtered = questionBanks;

    if (searchTerm) {
      filtered = filtered.filter(
        (bank) =>
          bank.questionBankName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          bank.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (bank) =>
          (statusFilter === "active" && bank.status === "active") ||
          (statusFilter === "inactive" && bank.status !== "active")
      );
    }

    setFilteredBanks(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / itemsPerPage)));
    setCurrentPage(1);
  }, [questionBanks, searchTerm, statusFilter]);

  const fetchQuestionBanks = async () => {
    try {
      setIsLoading(true);
      const response = await questionService.getAllQuestionBanks();

      const dataArray = response?.data?.data || [];

      setQuestionBanks(dataArray);
      setFilteredBanks(dataArray);
      setTotalPages(Math.max(1, Math.ceil(dataArray.length / itemsPerPage)));
    } catch (error) {
      console.error("Error fetching question banks:", error);
      toast.error("Failed to load question banks. Please try again.");
      setQuestionBanks([]);
      setFilteredBanks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewQuestions = (bank) => {
    navigate(`/admin/question-banks/questions/${bank._id}`, {
      state: {
        bankName: bank.questionBankName,
        bankDescription: bank.description,
      },
    });
  };

  const openEditModal = (bank) => {
    setCurrentBank(bank);
    setBankFormData({
      questionBankName: bank.questionBankName,
      description: bank.description,
    });
    document.getElementById("edit_bank_modal").showModal();
  };

  const handleUpdateBank = async (e) => {
    e.preventDefault();
    if (!currentBank) return;

    try {
      setIsUpdating(true);
      const updateData = {
        questionBankId: currentBank._id,
        questionBankName: bankFormData.questionBankName,
        description: bankFormData.description,
      };

      await questionService.updateQuestionBank(updateData);
      toast.success("Question bank updated successfully");

      const modal = document.getElementById("edit_bank_modal");
      if (modal) {
        modal.close();
      }

      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error updating question bank:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to update question bank";
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async (bank) => {
    try {
      setIsUpdating(true);
      const updateData = {
        questionBankId: bank._id,
      };

      if (bank.status === "active") {
        await questionService.deleteQuestionBank(updateData);
        toast.success("Question bank deactivated successfully");
      } else {
        await questionService.activeQuestionBank(updateData);
        toast.success("Question bank activated successfully");
      }

      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error toggling question bank status:", error);
      const errorMsg =
        error.response?.data?.message ||
        `Failed to ${
          bank.status === "active" ? "deactivate" : "activate"
        } question bank`;
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminSideBar />

      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Question Banks Management
            </h1>
            <p className="text-gray-600">View and manage question banks</p>
          </header>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Question Banks
                </h2>
                <p className="text-gray-600 mt-1">
                  Select a question bank to view and manage its questions
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="relative">
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <SearchIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <div className="relative ml-4">
                  <select
                    className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <FilterIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">
                          Title
                        </th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">
                          Description
                        </th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">
                          Status
                        </th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">
                          Questions
                        </th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBanks
                        .slice(
                          (currentPage - 1) * itemsPerPage,
                          currentPage * itemsPerPage
                        )
                        .map((bank) => (
                          <tr key={bank._id}>
                            <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                              {bank.questionBankName}
                            </td>
                            <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                              {bank.description}
                            </td>
                            <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                  bank.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {bank.status === "active"
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </td>
                            <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                              {Array.isArray(bank.questions)
                                ? bank.questions.length
                                : 0}
                            </td>
                            <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewQuestions(bank)}
                                  className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                  title="View questions"
                                >
                                  <ViewListIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => openEditModal(bank)}
                                  className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                                  title="Edit bank"
                                >
                                  <PencilAltIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(bank)}
                                  className={`p-1 rounded ${
                                    bank.status === "active"
                                      ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                                      : "text-green-600 hover:text-green-900 hover:bg-green-50"
                                  }`}
                                  title={
                                    bank.status === "active"
                                      ? "Deactivate bank"
                                      : "Activate bank"
                                  }
                                  disabled={isUpdating}
                                >
                                  {bank.status === "active" ? (
                                    <LockClosedIcon className="h-5 w-5" />
                                  ) : (
                                    <LockOpenIcon className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {filteredBanks.length === 0 && (
                  <div className="text-center p-8 bg-gray-50 rounded-lg mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      No question banks found
                    </h3>
                    <p className="mt-1 text-gray-500">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "No question banks are available"}
                    </p>
                  </div>
                )}

                {filteredBanks.length > itemsPerPage && (
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span className="text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {}
          <dialog id="edit_bank_modal" className="modal backdrop-blur-sm">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Edit Question Bank</h3>
              <form onSubmit={handleUpdateBank}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="questionBankName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="questionBankName"
                      value={bankFormData.questionBankName}
                      onChange={(e) =>
                        setBankFormData({
                          ...bankFormData,
                          questionBankName: e.target.value,
                        })
                      }
                      className="w-full border rounded-md p-2 border-gray-300"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      rows="3"
                      value={bankFormData.description}
                      onChange={(e) =>
                        setBankFormData({
                          ...bankFormData,
                          description: e.target.value,
                        })
                      }
                      className="w-full border rounded-md p-2 border-gray-300"
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      const modal = document.getElementById("edit_bank_modal");
                      if (modal) modal.close();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        </div>
      </div>
    </div>
  );
}
