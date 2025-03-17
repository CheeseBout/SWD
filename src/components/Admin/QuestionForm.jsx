import { useState, useEffect } from "react";

const QuestionForm = ({
  initialData = {
    question: "",
    options: ["", "", "", ""],
    optionScores: [1, 2, 3, 4],
  },
  onSubmit,
  onCancel,
  isProcessing = false,
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;

    setFormData({ ...formData, options: newOptions });

    if (errors.options && newOptions.every((option) => option.trim())) {
      setErrors({
        ...errors,
        options: "",
      });
    }
  };

  const handleScoreChange = (index, score) => {
    const newScores = [...(formData.optionScores || [1, 2, 3, 4])];
    newScores[index] = parseInt(score, 10) || 1;

    setFormData({ ...formData, optionScores: newScores });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.question.trim()) {
      newErrors.question = "Question text is required";
    }

    if (formData.options.some((option) => !option.trim())) {
      newErrors.options = "All options must be filled";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="question"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Question <span className="text-red-500">*</span>
        </label>
        <textarea
          id="question"
          name="question"
          rows="2"
          value={formData.question}
          onChange={handleChange}
          className={`w-full border rounded-md p-2 ${
            errors.question ? "border-red-300 bg-red-50" : "border-gray-300"
          }`}
          disabled={isProcessing}
        ></textarea>
        {errors.question && (
          <p className="mt-1 text-sm text-red-600">{errors.question}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Options <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center">
              <div className="flex-shrink-0 mr-2">
                <select
                  value={formData.optionScores?.[index] || index + 1}
                  onChange={(e) => handleScoreChange(index, e.target.value)}
                  className="h-8 w-12 text-sm border-gray-300 rounded"
                  disabled={isProcessing}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
              <div className="flex-grow">
                <div className="flex items-center">
                  <span className="mr-2 font-semibold">
                    {String.fromCharCode(65 + index)}:
                  </span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className={`flex-grow border rounded-md p-2 ${
                      errors.options
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {errors.options && (
          <p className="mt-1 text-sm text-red-600">{errors.options}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          Select a score (1-4) for each option
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isProcessing}
        >
          {isProcessing ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default QuestionForm;
