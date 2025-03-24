import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { questionService } from "../../services/api";
import AdminSideBar from "../../components/SideBar/AdminSidebar";
import QuestionForm from "../../components/Admin/QuestionForm";
import QuestionTable from "../../components/Admin/QuestionTable";
import {
  PlusCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/outline";

export default function QuestionsManagement() {
  const { bankId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { bankName, bankDescription } = location.state || {};

  const [isLoading, setIsLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const [questionFormData, setQuestionFormData] = useState({
    id: "",
    question: "",
    options: ["", "", "", ""],
    optionScores: [1, 2, 3, 4],
  });

  const [questionToDelete, setQuestionToDelete] = useState(null);

  useEffect(() => {
    if (bankId) {
      fetchBankDetails(bankId);
    }
  }, [bankId]);

  const fetchBankDetails = async (id) => {
    try {
      setIsLoading(true);
      const response = await questionService.getAllQuestionBanks();

      const dataArray = response?.data?.data || [];
      const bank = dataArray.find((bank) => bank._id === id);

      if (!bank) {
        toast.error("Question bank not found");
        navigate("/manage/question-banks");
        return;
      }

      setBankDetails(bank);
      fetchQuestions(bank);
    } catch (error) {
      console.error("Error fetching question bank:", error);
      toast.error("Failed to load question bank. Please try again.");
      navigate("/manage/question-banks");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestions = async (bank) => {
    try {
      setIsLoading(true);

      if (Array.isArray(bank.questions) && bank.questions.length > 0) {
        const formattedQuestions = bank.questions.map((q) => {
          if (typeof q === "object" && q !== null && q.questionContent) {
            return {
              _id: q._id,
              question: q.questionContent,
              options: q.options.map((opt) => opt.optionContent),
              optionScores: q.options.map((opt) => opt.score),
              status: q.status,
            };
          } else {
            return {
              _id:
                typeof q === "string"
                  ? q
                  : q?._id || `unknown-${Math.random()}`,
              question: "Question not available",
              options: ["Option A", "Option B", "Option C", "Option D"],
              optionScores: [1, 2, 3, 4],
              status: "unknown",
            };
          }
        });

        setQuestions(formattedQuestions);
      } else {
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

  const handleAddQuestion = () => {
    setQuestionFormData({
      id: "",
      question: "",
      options: ["", "", "", ""],
      optionScores: [1, 2, 3, 4],
    });
    document.getElementById("question_modal").showModal();
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
        : [1, 2, 3, 4],
    });
    document.getElementById("question_modal").showModal();
  };

  const handleSubmitQuestion = async (formData) => {
    try {
      setIsUpdating(true);

      const apiQuestion = {
        questionContent: formData.question,
        options: formData.options.map((opt, idx) => ({
          optionContent: opt,
          score: formData.optionScores?.[idx] || idx + 1,
          userAnswers: [],
        })),
      };

      if (formData.id) {
        const updateData = {
          questionId: formData.id,
          ...apiQuestion,
        };
        await questionService.updateQuestion(updateData);
        toast.success("Question updated successfully");
      } else {
        const createData = {
          questionBank: bankId,
          ...apiQuestion,
        };
        await questionService.createQuestion(createData);
        toast.success("Question added successfully!");
      }

      const modal = document.getElementById("question_modal");
      if (modal) {
        modal.close();
      }

      fetchBankDetails(bankId);
    } catch (error) {
      console.error("Error saving question:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to save question";
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      setIsUpdating(true);

      if (!questionToDelete || !questionToDelete._id) {
        toast.error("Invalid question selected for deletion");
        return;
      }

      console.log("Deleting question with ID:", questionToDelete._id);

      await questionService.deleteQuestion({
        questionId: questionToDelete._id,
      });

      toast.success("Question deleted successfully");

      const modal = document.getElementById("delete_question_modal");
      if (modal) {
        modal.close();
      }

      fetchBankDetails(bankId);
    } catch (error) {
      console.error("Error deleting question:", error);
      console.log("Full error response:", error.response?.data);

      let errorMsg = "Failed to delete question";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }

      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShowDeleteQuestion = (question) => {
    setQuestionToDelete(question);
    document.getElementById("delete_question_modal").showModal();
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
              View and manage questions in this question bank
            </p>
          </header>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <button
                  onClick={() => navigate("/manage/question-banks")}
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
                  {bankDetails?.questionBankName || bankName || "Question Bank"}
                </h2>
                <p className="text-gray-600 mt-1">
                  {bankDetails?.description || bankDescription || ""}
                </p>
              </div>

              <div className="flex items-center mt-4 md:mt-0">
                {bankDetails && (
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      bankDetails.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    } mr-4`}
                  >
                    {bankDetails.status === "active" ? "Active" : "Inactive"}
                  </span>
                )}
                <button
                  onClick={handleAddQuestion}
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

          <dialog id="question_modal" className="modal backdrop-blur-sm">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">
                {questionFormData.id ? "Edit Question" : "Add Question"}
              </h3>
              <QuestionForm
                initialData={questionFormData}
                onSubmit={handleSubmitQuestion}
                onCancel={() => {
                  const modal = document.getElementById("question_modal");
                  if (modal) modal.close();
                }}
                isProcessing={isUpdating}
              />
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>

          <dialog id="delete_question_modal" className="modal backdrop-blur-sm">
            <div className="modal-box">
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
                  onClick={() => {
                    const modal = document.getElementById(
                      "delete_question_modal"
                    );
                    if (modal) modal.close();
                  }}
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
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        </div>
      </div>
    </div>
  );
}
