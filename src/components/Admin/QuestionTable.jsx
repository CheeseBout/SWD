import { useState } from "react";
import LoadingSpinner from "@components/common/LoadingSpinner";
import {
  PencilAltIcon,
  TrashIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/outline";

const QuestionTable = ({
  questions = [],
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleQuestionExpand = (questionId) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <LoadingSpinner />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No questions yet</h3>
        <p className="mt-1 text-gray-500">
          Get started by creating a new question.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              #
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Question
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Options
            </th>
            <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {questions.map((question, index) => (
            <tr 
              key={question._id} 
              className={`hover:bg-gray-50 ${expandedQuestions[question._id] ? "bg-blue-50" : ""}`}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {index + 1}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 cursor-pointer" onClick={() => toggleQuestionExpand(question._id)}>
                <div className="max-w-md">
                  {expandedQuestions[question._id] ? (
                    question.question
                  ) : (
                    <div className="truncate">{question.question}</div>
                  )}
                </div>
                {question.explanation && expandedQuestions[question._id] && (
                  <div className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
                    <span className="font-semibold">Explanation:</span> {question.explanation}
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="max-w-sm">
                  {expandedQuestions[question._id] ? (
                    <div className="space-y-1">
                      {question.options.map((option, idx) => (
                        <div 
                          key={idx} 
                          className="rounded p-1 border border-gray-100"
                        >
                          <span className="font-medium mr-1">{String.fromCharCode(65 + idx)}:</span>
                          <span>{option}</span>
                          <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            Score: {question.optionScores?.[idx] || idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {question.options.map((_, idx) => (
                        <div 
                          key={idx} 
                          className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                        >
                          {String.fromCharCode(65 + idx)} ({question.optionScores?.[idx] || idx + 1})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  question.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {question.status || "Unknown"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => onEdit(question)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit Question"
                  >
                    <PencilAltIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(question)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete Question"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuestionTable;
