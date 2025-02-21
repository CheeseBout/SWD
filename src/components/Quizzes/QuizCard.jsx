import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default function QuizCard({ quiz }) {
  return (
    <Link to={`/quizzes/${quiz._id}`} className="block h-full">
      <div className="flex bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full mb-4">
        <div className="w-1/3 min-w-[180px]">
          <img
            src={quiz.imageUrl || "https://placehold.co/400x300"}
            alt={quiz.quizName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://placehold.co/400x300";
            }}
          />
        </div>
        <div className="w-2/3 p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            {quiz.quizName}
          </h2>
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <span>{quiz.questions.length} Questions</span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2">{quiz.quizDescription}</p>
        </div>
      </div>
    </Link>
  );
}

QuizCard.propTypes = {
  quiz: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    quizName: PropTypes.string.isRequired,
    quizDescription: PropTypes.string.isRequired,
    questions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    imageUrl: PropTypes.string,
  }).isRequired,
};
