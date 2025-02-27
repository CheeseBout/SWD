import PropTypes from 'prop-types';

export default function QuizHeader({ quiz }) {
  return (
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
  );
}

QuizHeader.propTypes = {
  quiz: PropTypes.shape({
    quizName: PropTypes.string.isRequired,
    quizDescription: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    questions: PropTypes.array
  }).isRequired
};
