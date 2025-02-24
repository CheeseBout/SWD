import QuizList from "../../components/Quizzes/QuizList";
import TopicList from "../../components/Topics/TopicList";
import { useNavigate } from "react-router-dom";

export default function Quizzes() {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center mt-8">Popular Topics</h2>
      <TopicList limit={5} />
      <div className="flex justify-center">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          onClick={() => navigate("/topics")}
        >
          See All Topics
        </button>
      </div>
      <QuizList />
    </div>
  );
}
