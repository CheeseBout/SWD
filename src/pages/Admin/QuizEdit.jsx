import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AdminSidebar from "../../components/SideBar/AdminSidebar";
import QuizForm from "../../components/Admin/QuizForm";
import { quizService, questionService } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { ArrowLeftIcon } from "@heroicons/react/outline";

export default function QuizEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await quizService.getQuizById(id);
        const quizData = response?.data?.quiz || response?.quiz || response;
        if (!quizData) throw new Error("Quiz not found");
        const formattedQuiz = {
          name: quizData.quizName || "",
          description: quizData.quizDescription || "",
          topicId: quizData.topicID || "",
          isPublished: quizData.status === "active",
          imageUrl: quizData.imageUrl || "",
          selectedQuestions: [],
          shuffleQuestions: quizData.shuffleQuestions || false,
          showAnswers: quizData.showAnswers || false,
        };

        if (quizData.questions && quizData.questions.length > 0) {
          formattedQuiz.selectedQuestions = quizData.questions.map((q) => ({
            _id: q._id,
            questionText: q.questionContent || q.question || "Unknown question",
            options: q.options || [],
            type: q.type || "multiple-choice",
          }));
        }
        setQuiz(formattedQuiz);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to load quiz. Please try again later.");
        toast.error("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuiz();
    }
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);

      const updatePayload = {
        quizId: id,
        quizName: formData.quizName || formData.name,
        quizDescription: formData.quizDescription || formData.description,
        questions:
          formData.questions || formData.selectedQuestions.map((q) => q._id),
        status:
          formData.status || (formData.isPublished ? "active" : "inactive"),
        imageUrl: formData.imageUrl,
        topicID: formData.topicID || formData.topicId,
        shuffleQuestions: formData.shuffleQuestions,
        showAnswers: formData.showAnswers,
      };

      await quizService.updateQuiz(updatePayload);

      toast.success("Quiz updated successfully!");
      navigate("/admin/quizzes");
    } catch (err) {
      console.error("Error updating quiz:", err);
      toast.error("Failed to update quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/quizzes");
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Quiz not found"}</p>
            <button
              onClick={() => navigate("/admin/quizzes")}
              className="btn btn-primary"
            >
              Return to Quiz Management
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/admin/quizzes")}
            className="btn btn-ghost btn-sm mr-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Quizzes
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Quiz</h1>
            <p className="text-gray-600">Update quiz details and questions</p>
          </div>
        </div>

        <QuizForm
          initialData={quiz}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitButtonText="Update Quiz"
          isSubmitting={submitting}
        />
      </div>
    </div>
  );
}
