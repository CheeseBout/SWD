import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/api';
import QuizHeader from '../../components/Quiz/QuizHeader';
import QuestionCard from '../../components/Questions/QuestionCard';
import WarningMessage from '../../components/Quiz/WarningMessage';
import QuizResults from '../../components/Quiz/QuizResults';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function QuizDetail() {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await quizService.getQuizById(id);
        if (response.status === 200 && response.data.quiz) {
          setQuiz(response.data.quiz);
          const initialAnswers = {};
          response.data.quiz.questions.forEach(q => {
            initialAnswers[q._id] = '';
          });
          setUserAnswers(initialAnswers);
        } else {
          throw new Error("Quiz not found");
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Failed to load quiz. Please try again later.');
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
    if (!isFormComplete()) {
      setShowWarning(true);
      setTimeout(() => {
        document.getElementById('warning-message')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
      return;
    }
    
    let score = 0;
    let totalPossibleScore = 0;

    quiz.questions.forEach(question => {
      const selectedOptionId = userAnswers[question._id];
      const selectedOption = question.options.find(opt => opt._id === selectedOptionId);
      
      if (selectedOption) {
        score += selectedOption.score;
      }
      
      const maxScore = Math.max(...question.options.map(opt => opt.score));
      totalPossibleScore += maxScore;
    });

    setTotalScore(`${score}/${totalPossibleScore}`);
    setSubmitted(true);
    setShowWarning(false);
  };

  const isFormComplete = () => {
    return quiz?.questions.every(q => userAnswers[q._id]);
  };

  const getUnansweredCount = () => {
    if (!quiz?.questions) return 0;
    return quiz.questions.filter(q => !userAnswers[q._id]).length;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onBack={() => navigate('/quizzes')} />;
  if (!quiz) return <ErrorMessage message="Quiz not found" onBack={() => navigate('/quizzes')} />;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <QuizHeader quiz={quiz} />

        {showWarning && (
          <WarningMessage 
            count={getUnansweredCount()} 
          />
        )}

        <div className="max-w-4xl mx-auto mt-8 space-y-6">
          {quiz.questions?.map((question, index) => (
            <QuestionCard
              key={question._id}
              question={question}
              index={index}
              userAnswer={userAnswers[question._id]}
              onAnswerSelect={handleAnswerSelect}
              showWarning={showWarning}
            />
          ))}
        </div>

        {quiz.questions?.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8 flex justify-between items-center">
            <div>
              {!isFormComplete() && (
                <span className="text-sm text-gray-500">
                  {getUnansweredCount()} {getUnansweredCount() === 1 ? 'question' : 'questions'} left to answer
                </span>
              )}
            </div>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Quiz
            </button>
          </div>
        )}

        {submitted && <QuizResults score={totalScore} />}
      </div>
    </div>
  );
}
