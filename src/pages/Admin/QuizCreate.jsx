import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminSidebar from "../../components/SideBar/AdminSidebar";
import QuizForm from "../../components/Admin/QuizForm";
import { quizService } from "../../services/api";
import { ArrowLeftIcon } from "@heroicons/react/outline";

export default function QuizCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);

      await quizService.createQuiz(formData);

      toast.success("Quiz created successfully!");
      navigate("/admin/quizzes");
    } catch (err) {
      console.error("Error creating quiz:", err);
      toast.error("Failed to create quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/quizzes");
  };

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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Create New Quiz
            </h1>
            <p className="text-gray-600">
              Create a new quiz by selecting a topic and adding questions.
            </p>
          </div>
        </div>

        <QuizForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitButtonText="Create Quiz"
          isSubmitting={submitting}
        />
      </div>
    </div>
  );
}
