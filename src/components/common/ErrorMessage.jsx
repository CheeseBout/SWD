import PropTypes from 'prop-types';

export default function ErrorMessage({ error, message, onBack }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center bg-red-50 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
        <p className="text-gray-700">{error || message}</p>
        {onBack && (
          <button 
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back to Quizzes
          </button>
        )}
      </div>
    </div>
  );
}

ErrorMessage.propTypes = {
  error: PropTypes.string,
  message: PropTypes.string,
  onBack: PropTypes.func
};
