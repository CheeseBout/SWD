import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuizCard from "../../components/Quizzes/QuizCard";
import axios from "axios";

export default function TopicDetail() {
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_GET_ALL_TOPICS_ENDPOINT;

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const response = await axios.get(`${API}/${id}`);
        if (response.data.status === 200) {
          setTopic(response.data.data.topic);
        }
      } catch (error) {
        console.error('Error fetching topic:', error);
        setTopic(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [id]);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (!topic) return <div className="text-center mt-10">No topic found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-8xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-700"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {topic.name}
          </h1>
          <p className="text-gray-600">{topic.description}</p>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Quizzes in This Topic</h2>

        {topic.quiz && topic.quiz.length > 0 ? (
          <div className="grid grid-cols-2 gap-6">
            {topic.quiz.map((quizItem) => (
              <QuizCard
                key={quizItem._id || `${topic._id}-${quizItem.name}`}
                quiz={{
                  _id: quizItem._id || `${topic._id}-${quizItem.name}`,
                  quizName: quizItem.quizName,
                  quizDescription: quizItem.quizDescription, 
                  questions: quizItem.questions || [],
                  imageUrl: quizItem.imageUrl,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No quizzes available for this topic yet.
          </div>
        )}
      </div>
    </div>
  );
}
