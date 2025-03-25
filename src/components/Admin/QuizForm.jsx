import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  PlusIcon,
  SearchIcon,
  MinusCircleIcon,
} from "@heroicons/react/outline";
import PropTypes from "prop-types";
import { topicService, questionService, utilsService } from "../../services/api";

const QuizForm = ({
  initialData = {
    name: "",
    description: "",
    isPublished: false,
    shuffleQuestions: true,
    showAnswers: true,
    topicId: "",
    selectedQuestions: [],
    imageUrl: "",
  },
  onSubmit,
  onCancel,
  submitButtonText = "Create Quiz",
  isSubmitting = false,
}) => {
  const [quizData, setQuizData] = useState(initialData);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(initialData.topicId || "");
  const [questionBank, setQuestionBank] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState(
    initialData.selectedQuestions || []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [initialSelectedQuestions, setInitialSelectedQuestions] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    setQuizData(initialData);

    if (initialData.topicId) {
      setSelectedTopic(initialData.topicId);
    }

    if (initialData.selectedQuestions?.length > 0) {
      setSelectedQuestions(initialData.selectedQuestions);
      setInitialSelectedQuestions(initialData.selectedQuestions);
    }
  }, [initialData]);

  useEffect(() => {}, [selectedTopic]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const response = await topicService.getAllTopics();

        let topicsData = [];
        if (response?.data?.topics) {
          topicsData = response.data.topics;
        } else if (Array.isArray(response)) {
          topicsData = response;
        } else {
          throw new Error("Invalid topics data format");
        }

        const activeTopics = topicsData.filter(
          (topic) => topic.status === "active"
        );
        setTopics(activeTopics);
      } catch (err) {
        console.error("Error fetching topics:", err);
        setError("Failed to load topics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      loadQuestionsForTopic(selectedTopic);
    }
  }, [selectedTopic]);

  const loadQuestionsForTopic = async (topicId) => {
    if (!topicId) return;

    try {
      setLoadingQuestions(true);
      const response = await questionService.getQuestionsByTopic(topicId);

      let questionsData = [];
      if (response?.data?.questions) {
        questionsData = response.data.questions;
      } else if (Array.isArray(response)) {
        questionsData = response;
      } else {
        throw new Error("Invalid questions data format");
      }

      setQuestionBank(questionsData);
      setFilteredQuestions(questionsData);
    } catch (err) {
      console.error("Error fetching questions:", err);
      toast.error("Failed to load questions for this topic");
      setQuestionBank([]);
      setFilteredQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleTopicChange = async (e) => {
    const topicId = e.target.value;
    setSelectedTopic(topicId);

    setQuizData((prev) => ({ ...prev, topicId }));

    if (initialSelectedQuestions.length === 0 && topicId !== selectedTopic) {
      setSelectedQuestions([]);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredQuestions(questionBank);
      return;
    }

    const filtered = questionBank.filter((question) =>
      question.questionText.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredQuestions(filtered);
  }, [searchTerm, questionBank]);

  const handleQuizInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddQuestion = (question) => {
    if (selectedQuestions.find((q) => q._id === question._id)) {
      toast.info("This question is already added to the quiz");
      return;
    }
    setSelectedQuestions((prev) => [...prev, question]);
  };

  const handleRemoveQuestion = (questionId) => {
    setSelectedQuestions((prev) => prev.filter((q) => q._id !== questionId));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large. Please choose an image under 10MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setQuizData(prev => ({ ...prev, imageUrl: previewUrl }));

    try {
      const result = await utilsService.uploadImage(file);
      const imageUrl = result?.data;
      
      if (imageUrl) {
        setQuizData(prev => ({ ...prev, imageUrl }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setImagePreview(null);
      setQuizData(prev => ({ ...prev, imageUrl: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!quizData.name.trim()) {
      toast.error("Quiz name is required");
      return;
    }

    if (!selectedTopic) {
      toast.error("Please select a topic for this quiz");
      return;
    }

    if (!quizData.description.trim()) {
      toast.error("Quiz description is required");
      return;
    }

    if (!quizData.imageUrl.trim()) {
      toast.error("Image URL is required");
      return;
    }

    if (selectedQuestions.length === 0) {
      toast.error("Please add at least one question to the quiz");
      return;
    }

    const formattedPayload = {
      quizName: quizData.name,
      quizDescription: quizData.description,
      topicID: selectedTopic,
      questions: selectedQuestions.map((q) => q._id),
      status: quizData.isPublished ? "active" : "inactive",
      imageUrl: quizData.imageUrl,
      shuffleQuestions: quizData.shuffleQuestions,
      showAnswers: quizData.showAnswers,
      _selectedQuestions: selectedQuestions,
    };

    console.log("Submitting with topic ID:", selectedTopic);
    onSubmit(formattedPayload);
  };

  if (loading && topics.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-gray-600">Loading topics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-800">
        {error}
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Quiz Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quiz Name*
            </label>
            <input
              type="text"
              name="name"
              value={quizData.name}
              onChange={handleQuizInputChange}
              className="input input-bordered w-full"
              placeholder="Enter quiz name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic*
            </label>
            <select
              name="topic"
              value={selectedTopic}
              onChange={handleTopicChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">Select a topic</option>
              {topics.map((topic) => (
                <option
                  key={topic._id}
                  value={topic._id}
                  data-selected={topic._id === selectedTopic ? "true" : "false"}
                >
                  {topic.name} {topic._id === selectedTopic ? "(Current)" : ""}
                </option>
              ))}
            </select>
            {}
            <div className="text-xs text-gray-400 mt-1">
              Selected topic ID: {selectedTopic || "none"}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              name="description"
              value={quizData.description}
              onChange={handleQuizInputChange}
              className="textarea textarea-bordered w-full"
              rows="3"
              placeholder="Enter quiz description"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL*
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input w-full mb-2"
            />
            {(imagePreview || quizData.imageUrl) && (
              <div className="mt-2 border border-gray-200 rounded-md p-2 bg-gray-50">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <img
                  src={imagePreview || quizData.imageUrl}
                  alt="Quiz preview"
                  className="h-40 w-full object-contain rounded-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/300x150?text=Invalid+Image+URL";
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {}
        {selectedTopic ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              <span>Question Bank</span>
              {loadingQuestions && <LoadingSpinner size="sm" />}
            </h2>

            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pl-10"
                placeholder="Search questions..."
              />
            </div>

            <div className="overflow-y-auto max-h-96 border rounded-md">
              {filteredQuestions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {loadingQuestions
                    ? "Loading questions..."
                    : "No questions found for this topic. Please create questions first."}
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredQuestions.map((question) => (
                    <li key={question._id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {question.questionText}
                          </p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {question.type === "multiple-choice"
                              ? "Multiple Choice"
                              : question.type === "true-false"
                              ? "True/False"
                              : "Short Answer"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddQuestion(question)}
                          className="flex-shrink-0 btn btn-sm btn-circle btn-primary"
                          title="Add to quiz"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Question Bank</h2>
            <div className="p-4 text-center text-gray-500 border rounded-md">
              Please select a topic to view available questions.
            </div>
          </div>
        )}

        {}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Selected Questions ({selectedQuestions.length})
          </h2>

          {selectedQuestions.length === 0 ? (
            <div className="p-4 text-center text-gray-500 border rounded-md">
              No questions selected yet. Add questions from the question bank.
            </div>
          ) : (
            <>
              <div className="overflow-y-auto max-h-96 border rounded-md mb-4">
                <ul className="divide-y divide-gray-200">
                  {selectedQuestions.map((question, index) => (
                    <li key={question._id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center mb-1">
                            <span className="bg-gray-100 text-gray-700 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium mr-2">
                              {index + 1}
                            </span>
                            <p className="text-sm font-medium text-gray-900">
                              {question.questionText}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(question._id)}
                          className="flex-shrink-0 btn btn-sm btn-circle btn-error"
                          title="Remove from quiz"
                        >
                          <MinusCircleIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between text-sm font-medium">
                <span>Total Questions: {selectedQuestions.length}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || selectedQuestions.length === 0}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Processing...</span>
            </>
          ) : (
            submitButtonText
          )}
        </button>
      </div>
    </form>
  );
};

QuizForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitButtonText: PropTypes.string,
  isSubmitting: PropTypes.bool,
};

export default QuizForm;
