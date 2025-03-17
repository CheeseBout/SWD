import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { questionService } from "../../services/api";
import AdminSideBar from "../../components/Sidebar/AdminSidebar";
import QuestionForm from "../../components/Admin/QuestionForm";
import QuestionTable from "../../components/Admin/QuestionTable";
import {
  SearchIcon,
  FilterIcon,
  PlusCircleIcon,
  ViewListIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/outline";

export default function QuestionManagement() {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [selectedBank, setSelectedBank] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showDeleteQuestionModal, setShowDeleteQuestionModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [questionFormData, setQuestionFormData] = useState({
    id: "",
    question: "",
    options: ["", "", "", ""],
    optionScores: [1, 2, 3, 4],
  });

  const [questionToDelete, setQuestionToDelete] = useState(null);

  const itemsPerPage = 8;

  useEffect(() => {
    fetchQuestionBanks();
  }, [refreshTrigger]);

  useEffect(() => {
    let filtered = questionBanks;

    if (searchTerm) {
      filtered = filtered.filter(
        (bank) =>
          bank.questionBankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

      // Extract the array from the nested data structure
      const dataArray = response?.data?.data || [];
      console.log("Question banks data:", dataArray);
      
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

  const fetchQuestions = async (bankId) => {
    try {
      setIsLoading(true);
      
      // Find the selected bank in our existing data
      const bank = questionBanks.find(bank => bank._id === bankId);
      if (!bank) {
        toast.error("Question bank not found");
        setQuestions([]);
        return;
      }
      
      // Check if questions are already present in the bank data
      if (Array.isArray(bank.questions) && bank.questions.length > 0) {
        console.log("Bank questions:", bank.questions);
        
        // Convert the question data to the format expected by QuestionTable
        const formattedQuestions = bank.questions.map(q => {
          // Check if it's already an object with all needed properties
          if (typeof q === 'object' && q !== null && q.questionContent) {
            return {
              _id: q._id,
              question: q.questionContent,
              options: q.options.map(opt => opt.optionContent),
              optionScores: q.options.map(opt => opt.score),
              status: q.status
            };
          } else {
            // Fallback for cases where we only have an ID
            return {
              _id: typeof q === 'string' ? q : q?._id || `unknown-${Math.random()}`,
              question: "Question not available",
              options: ["Option A", "Option B", "Option C", "Option D"],
              optionScores: [1, 2, 3, 4],
              status: "unknown"
            };
          }
        });
        
        setQuestions(formattedQuestions);
      } else {
        // No questions in this bank
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error processing questions:", error);
      toast.error("Failed to load questions. Please try again.");
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewQuestions = (bank) => {
    setSelectedBank(bank);
    fetchQuestions(bank._id);
  };

  const handleAddQuestion = () => {
    setQuestionFormData({
      id: "",
      question: "",
      options: ["", "", "", ""],
      optionScores: [1, 2, 3, 4],
    });
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (question) => {
    setQuestionFormData({
      id: question._id,
      question: question.question || "",
      options: Array.isArray(question.options)
        ? [...question.options]
        : ["", "", "", ""],
      optionScores: Array.isArray(question.optionScores)
        ? [...question.optionScores]
        : [1, 2, 3, 4]
    });
    setShowQuestionModal(true);
  };

  const handleSubmitQuestion = async (formData) => {
    try {
      setIsUpdating(true);
      console.log("Form data to submit:", formData);
      console.log("Selected bank:", selectedBank);
      
      // Format the question data for the API
      const apiQuestion = {
        questionContent: formData.question,
        options: formData.options.map((opt, idx) => ({
          optionContent: opt,
          score: formData.optionScores?.[idx] || idx + 1,
          userAnswers: []
        }))
      };
      
      let questionId;
      
      if (formData.id) {
        // Update existing question
        const updateData = {
          questionId: formData.id,
          ...apiQuestion
        };
        console.log("Updating question with data:", updateData);
        await questionService.updateQuestion(updateData);
        questionId = formData.id;
        toast.success("Question updated successfully");
      } else {
        // Create new question - key point: use questionBank instead of questionBankId
        const createData = {
          questionBank: selectedBank._id,
          ...apiQuestion
        };
        console.log("Creating question with data:", createData);
        const response = await questionService.createQuestion(createData);
        console.log("Question creation response:", response);
        
        // Extract the question ID correctly based on the API response structure
        console.log("Full response structure:", JSON.stringify(response));
        
        // Based on the response structure, the question ID is in data.data._id
        questionId = response?.data?.data?._id;
                    
        console.log("Extracted question ID:", questionId);
        
        if (questionId) {
          // Prepare options array for the API - make sure structure matches expectations
          const options = formData.options.map((opt, idx) => ({
            optionContent: opt,
            score: parseInt(formData.optionScores?.[idx]) || idx + 1
          }));
          
          try {
            // Create options separately after question creation
            console.log("Creating options for question ID:", questionId);
            console.log("Options data:", options);
            await questionService.createOptionsForQuestion(questionId, options);
            toast.success("Question and options added successfully");
          } catch (optionsError) {
            console.error("Error creating options:", optionsError.response || optionsError);
            toast.warning("Question created but options may not have been saved correctly");
          }
        } else {
          toast.success("Question added successfully");
          console.warn("Could not extract question ID from response, options not created");
        }
      }
      
      setShowQuestionModal(false);
      
      // Refresh the bank data to get updated question list
      const refreshedBanks = await questionService.getAllQuestionBanks();
      const dataArray = refreshedBanks?.data?.data || [];
      setQuestionBanks(dataArray);
      
      // Find the selected bank in the refreshed data and update questions
      const updatedBank = dataArray.find(bank => bank._id === selectedBank._id);
      if (updatedBank) {
        setSelectedBank(updatedBank);
        fetchQuestions(updatedBank._id);
      }
    } catch (error) {
      console.error("Error saving question:", error);
      const errorMsg = error.response?.data?.message || "Failed to save question";
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      setIsUpdating(true);
      console.log("Deleting question:", questionToDelete._id);
      
      await questionService.deleteQuestion({
        questionId: questionToDelete._id
      });
      
      toast.success("Question deleted successfully");
      setShowDeleteQuestionModal(false);
      
      // Refresh the question list
      const refreshedBanks = await questionService.getAllQuestionBanks();
      const dataArray = refreshedBanks?.data?.data || [];
      setQuestionBanks(dataArray);
      
      // Find the selected bank in the refreshed data and update questions
      const updatedBank = dataArray.find(bank => bank._id === selectedBank._id);
      if (updatedBank) {
        setSelectedBank(updatedBank);
        fetchQuestions(updatedBank._id);
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      const errorMsg = error.response?.data?.message || "Failed to delete question";
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShowDeleteQuestion = (question) => {
    setQuestionToDelete(question);
    setShowDeleteQuestionModal(true);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminSideBar />

      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Question Management
            </h1>
            <p className="text-gray-600">
              View and manage questions in question banks
            </p>
          </header>

          {selectedBank ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <button
                    onClick={() => setSelectedBank(null)}
                    className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Back to Question Banks
                  </button>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedBank.questionBankName}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {selectedBank.description}
                  </p>
                </div>

                <div className="flex items-center mt-4 md:mt-0">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      selectedBank.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    } mr-4`}
                  >
                    {selectedBank.status === "active" ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => handleAddQuestion()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
                  >
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Add Question
                  </button>
                </div>
              </div>

              <QuestionTable
                questions={questions}
                onEdit={handleEditQuestion}
                onDelete={handleShowDeleteQuestion}
                isLoading={isLoading}
              />
            </div>
          ) : (
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
                                  {bank.status === "active" ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                                {Array.isArray(bank.questions) ? bank.questions.length : 0}
                              </td>
                              <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                                <button
                                  onClick={() => handleViewQuestions(bank)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <ViewListIcon className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredBanks.length === 0 && (
                    <div className="text-center p-8 bg-gray-50 rounded-lg mt-4">
                      <h3 className="text-lg font-medium text-gray-900">No question banks found</h3>
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
          )}

          {/* Question Modal */}
          {showQuestionModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-xl w-full mx-4">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="text-lg font-medium text-gray-900">
                    {questionFormData.id ? "Edit Question" : "Add Question"}
                  </h3>
                </div>

                <div className="p-6">
                  <QuestionForm
                    initialData={questionFormData}
                    onSubmit={handleSubmitQuestion}
                    onCancel={() => setShowQuestionModal(false)}
                    isProcessing={isUpdating}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Delete Question Confirmation */}
          {showDeleteQuestionModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
                <div className="flex items-center justify-center text-red-500 mb-4">
                  <ExclamationCircleIcon className="h-12 w-12" />
                </div>
                <h3 className="text-lg font-bold text-center mb-2">
                  Delete Question
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to delete this question? This action
                  cannot be undone.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowDeleteQuestionModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteQuestion}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
