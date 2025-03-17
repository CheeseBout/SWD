import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import LoadingSpinner from "../common/LoadingSpinner";

const QuestionForm = ({
  initialData = null,
  questionBanks = [],
  onSubmit,
  isSubmitting = false,
  onCancel,
}) => {
  const emptyQuestion = {
    content: "",
    questionBank: { _id: "", name: "" },
    options: [
      {
        options: [
          { optionContent: "", score: 1, isCorrect: true },
          { optionContent: "", score: 0, isCorrect: false },
          { optionContent: "", score: 0, isCorrect: false },
          { optionContent: "", score: 0, isCorrect: false },
        ],
      },
    ],
    status: "active",
  };

  const [formData, setFormData] = useState(initialData || emptyQuestion);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      const processedData = {
        ...initialData,
        options:
          initialData.options && initialData.options.length > 0
            ? initialData.options
            : [{ options: [{ optionContent: "", score: 1, isCorrect: true }] }],
      };

      if (
        processedData.options &&
        processedData.options[0] &&
        processedData.options[0].options
      ) {
        processedData.options[0].options = processedData.options[0].options.map(
          (opt) => ({
            ...opt,
            isCorrect: opt.score > 0,
          })
        );
      }

      setFormData(processedData);
    }
  }, [initialData]);

  const handleContentChange = (e) => {
    setFormData({ ...formData, content: e.target.value });
    if (errors.content) {
      setErrors({ ...errors, content: null });
    }
  };

  const handleQuestionBankChange = (e) => {
    const selectedBankId = e.target.value;
    const selectedBank =
      questionBanks.find((bank) => bank._id === selectedBankId) || {};

    setFormData({
      ...formData,
      questionBank: {
        _id: selectedBankId,
        name: selectedBank.questionBankName || selectedBank.name || "",
      },
    });

    if (errors.questionBank) {
      setErrors({ ...errors, questionBank: null });
    }
  };

  const handleStatusChange = (e) => {
    setFormData({ ...formData, status: e.target.value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options[0].options];
    newOptions[index] = { ...newOptions[index], optionContent: value };

    const updatedOptions = [...formData.options];
    updatedOptions[0] = { ...updatedOptions[0], options: newOptions };

    setFormData({ ...formData, options: updatedOptions });

    if (errors.options) {
      setErrors({ ...errors, options: null });
    }
  };

  const handleCorrectAnswerChange = (index) => {
    const newOptions = formData.options[0].options.map((option, i) => ({
      ...option,
      score: i === index ? 1 : 0,
      isCorrect: i === index,
    }));

    const updatedOptions = [...formData.options];
    updatedOptions[0] = { ...updatedOptions[0], options: newOptions };

    setFormData({ ...formData, options: updatedOptions });
  };

  const addOption = () => {
    if (formData.options[0].options.length >= 6) {
      toast.warning("Maximum 6 options allowed per question");
      return;
    }

    const newOption = { optionContent: "", score: 0, isCorrect: false };
    const newOptions = [...formData.options[0].options, newOption];

    const updatedOptions = [...formData.options];
    updatedOptions[0] = { ...updatedOptions[0], options: newOptions };

    setFormData({ ...formData, options: updatedOptions });
  };

  const removeOption = (index) => {
    if (formData.options[0].options.length <= 2) {
      toast.warning("At least 2 options are required");
      return;
    }

    const isRemovingCorrect = formData.options[0].options[index].isCorrect;

    const newOptions = formData.options[0].options.filter(
      (_, i) => i !== index
    );

    if (isRemovingCorrect && newOptions.length > 0) {
      newOptions[0] = { ...newOptions[0], score: 1, isCorrect: true };
    }

    const updatedOptions = [...formData.options];
    updatedOptions[0] = { ...updatedOptions[0], options: newOptions };

    setFormData({ ...formData, options: updatedOptions });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.content || formData.content.trim() === "") {
      newErrors.content = "Question content is required";
    }

    if (!formData.questionBank._id) {
      newErrors.questionBank = "Please select a question bank";
    }

    const options = formData.options[0]?.options || [];

    if (options.length < 2) {
      newErrors.options = "At least 2 options are required";
    }

    let hasEmptyOption = false;
    let hasCorrectAnswer = false;

    options.forEach((option) => {
      if (!option.optionContent || option.optionContent.trim() === "") {
        hasEmptyOption = true;
      }
      if (option.score > 0 || option.isCorrect) {
        hasCorrectAnswer = true;
      }
    });

    if (hasEmptyOption) {
      newErrors.options = "All options must have content";
    }

    if (!hasCorrectAnswer) {
      newErrors.correctAnswer = "Please select a correct answer";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    const formattedData = {
      ...formData,
      questionBank: formData.questionBank._id,
      options: formData.options.map((optionGroup) => ({
        ...optionGroup,
        options: optionGroup.options.map((option) => ({
          optionContent: option.optionContent,
          score: option.isCorrect ? 1 : 0,
          _id: option._id || undefined,
        })),
      })),
    };

    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">
            Question Content <span className="text-red-500">*</span>
          </span>
        </label>
        <textarea
          value={formData.content}
          onChange={handleContentChange}
          className={`textarea textarea-bordered h-24 ${
            errors.content ? "textarea-error" : ""
          }`}
          placeholder="Enter your question here..."
        ></textarea>
        {errors.content && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.content}</span>
          </label>
        )}
      </div>

      {}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">
            Question Bank <span className="text-red-500">*</span>
          </span>
        </label>
        <select
          value={formData.questionBank._id}
          onChange={handleQuestionBankChange}
          className={`select select-bordered w-full ${
            errors.questionBank ? "select-error" : ""
          }`}
        >
          <option value="">Select a question bank</option>
          {questionBanks.map((bank) => (
            <option key={bank._id} value={bank._id}>
              {bank.questionBankName || bank.name}
            </option>
          ))}
        </select>
        {errors.questionBank && (
          <label className="label">
            <span className="label-text-alt text-error">
              {errors.questionBank}
            </span>
          </label>
        )}
      </div>

      {}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Status</span>
        </label>
        <select
          value={formData.status}
          onChange={handleStatusChange}
          className="select select-bordered w-full"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">
            Options <span className="text-red-500">*</span>
          </span>
        </label>

        {errors.options && (
          <div className="text-error text-sm mb-2">{errors.options}</div>
        )}
        {errors.correctAnswer && (
          <div className="text-error text-sm mb-2">{errors.correctAnswer}</div>
        )}

        <div className="space-y-4">
          {formData.options[0]?.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={option.isCorrect || option.score > 0}
                    onChange={() => handleCorrectAnswerChange(index)}
                    className="radio radio-primary"
                  />
                  <input
                    type="text"
                    value={option.optionContent}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="btn btn-error btn-sm btn-square"
                disabled={formData.options[0].options.length <= 2}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addOption}
            className="btn btn-outline btn-sm mt-2"
            disabled={formData.options[0]?.options.length >= 6}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add Option
          </button>
        </div>
      </div>

      {}
      <div className="flex justify-end space-x-3 pt-4">
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
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <LoadingSpinner size="sm" />
          ) : initialData?._id ? (
            "Update Question"
          ) : (
            "Create Question"
          )}
        </button>
      </div>
    </form>
  );
};

export default QuestionForm;
