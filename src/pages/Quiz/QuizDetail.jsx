import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { quizService } from '../../services/api';

export default function QuizDetail() {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const { id } = useParams();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizService.getQuizById(id);
        if (response.status === 200) {
          setQuiz(response.data.quizzes[0]);
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleAnswerSelect = (questionId, optionId) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = () => {
    console.log('User answers:', userAnswers);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!quiz) return <div className="text-center py-8">Quiz not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/5">
              <img
                src={quiz.imageUrl || "https://placehold.co/400x300"}
                alt={quiz.quizName}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.src = "https://placehold.co/400x300";
                }}
              />
            </div>
            <div className="p-6 md:w-3/5">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{quiz.quizName}</h1>
              <p className="text-gray-600 mb-4">{quiz.quizDescription}</p>
              <div className="text-sm text-gray-500">{quiz.questions?.length || 0} Questions</div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-8 space-y-6">
          {quiz.questions?.map((question, index) => (
            <div key={question._id} className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Question {index + 1}: {question.questionContent}
              </h3>
              <div className="space-y-3">
                {question.options.map((option) => (
                  <label
                    key={option._id}
                    className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name={`question-${question._id}`}
                      value={option._id}
                      checked={userAnswers[question._id] === option._id}
                      onChange={() => handleAnswerSelect(question._id, option._id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700">{option.optionContent}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {quiz.questions?.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
