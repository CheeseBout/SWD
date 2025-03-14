import PropTypes from 'prop-types';

export default function QuestionCard({ question, index, userAnswer, onAnswerSelect, showWarning }) {
  const isAnswered = !!userAnswer;
  
  return (
    <div 
      className={`bg-white rounded-xl p-6 shadow-sm ${showWarning && !isAnswered ? 'border-2 border-orange-300' : ''}`}
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <span>Question {index + 1}: {question.questionContent}</span>
        {showWarning && !isAnswered && (
          <span className="ml-2 text-orange-500 text-sm font-normal">
            (needs answer)
          </span>
        )}
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
              checked={userAnswer === option._id}
              onChange={() => onAnswerSelect(question._id, option._id)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-3 text-gray-700">{option.optionContent}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

QuestionCard.propTypes = {
  question: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    questionContent: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      optionContent: PropTypes.string.isRequired
    })).isRequired
  }).isRequired,
  index: PropTypes.number.isRequired,
  userAnswer: PropTypes.string,
  onAnswerSelect: PropTypes.func.isRequired,
  showWarning: PropTypes.bool
};
