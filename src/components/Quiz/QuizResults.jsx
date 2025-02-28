import PropTypes from 'prop-types';

export default function QuizResults({ score }) {
  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white p-6 rounded-xl shadow-sm text-center">
      <div className="py-6">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
        <p className="text-gray-600 mb-6">Thank you for completing the quiz</p>
        <div className="bg-blue-50 py-4 px-6 rounded-lg inline-block">
          <p className="text-gray-700 text-lg mb-1">Your Score</p>
          <p className="text-3xl font-bold text-blue-700">{score}</p>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-gray-600 mb-4">
          Want to try another quiz?
        </p>
        <a 
          href="/quizzes" 
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Browse More Quizzes
        </a>
      </div>
    </div>
  );
}

QuizResults.propTypes = {
  score: PropTypes.string.isRequired
};
