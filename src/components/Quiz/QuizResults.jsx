import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function QuizResults({ score, isAuthenticated, onClose }) {
  const modalCheckboxRef = useRef(null);
  const { id } = useParams(); // Get the current quiz ID from URL params
  
  useEffect(() => {
    const checkbox = document.getElementById('quiz_results_modal');
    if (checkbox) {
      checkbox.checked = true;
    }
  }, []);

  return (
    <>
      <label htmlFor="quiz_results_modal" className="hidden">open modal</label>

      <input type="checkbox" id="quiz_results_modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box relative">
          <label 
            htmlFor="quiz_results_modal" 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </label>

          {isAuthenticated ? (
            <div className="py-6 text-center">
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
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-600 mb-4">
                  Want to try another quiz?
                </p>
                <Link 
                  to="/quizzes" 
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Browse More Quizzes
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V4" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Almost there!</h2>
              <p className="text-gray-600 mb-2">Please log in to see your quiz results</p>
              
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 text-left">
                <p className="text-sm text-green-700">
                  <strong>Good news!</strong> Your result has been saved. Log in to view your score and save it to your profile.
                </p>
              </div>
              
              <div className="mt-8 space-y-4">
                <Link 
                  to={`/login?redirect=quizzes/${id}`}
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Log In to See Results
                </Link>
                <p className="text-sm text-gray-500">
                  Don't have an account? <Link to={`/register?redirect=quizzes/${id}`} className="text-blue-600 hover:underline">Sign up</Link>
                </p>
              </div>
            </div>
          )}
        </div>
        <label className="modal-backdrop" htmlFor="quiz_results_modal" onClick={onClose}>Close</label>
      </div>
    </>
  );
}

QuizResults.propTypes = {
  score: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};
