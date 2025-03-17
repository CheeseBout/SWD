import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const TopicForm = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitButtonText,
  formSubmitSuccess = false
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        imageUrl: initialData.imageUrl || ""
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (formSubmitSuccess && !initialData) {
      setFormData({
        name: "",
        description: "",
        imageUrl: ""
      });
    }
  }, [formSubmitSuccess, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        ></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          type="text"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        {formData.imageUrl && (
          <div className="mt-2 border border-gray-200 rounded-md p-2 bg-gray-50">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <img
              src={formData.imageUrl}
              alt="Topic preview"
              className="h-40 object-cover rounded-md mx-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/300x150?text=Invalid+Image+URL";
              }}
            />
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : submitButtonText || "Submit"}
        </button>
      </div>
    </form>
  );
};

TopicForm.propTypes = {
  initialData: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    imageUrl: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  submitButtonText: PropTypes.string,
  formSubmitSuccess: PropTypes.bool
};

export default TopicForm;
