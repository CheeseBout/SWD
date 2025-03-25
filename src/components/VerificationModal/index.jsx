import { useState, useEffect, useRef } from "react";
import "./styles.css";
import { therapistService } from "../../services/api";
import { categoryService } from "../../services/category/categoryService";
import { toast } from "react-toastify";

export function VerificationModal({ onClose, userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const [verificationForm, setVerificationForm] = useState({
    description: "",
    category: "",
  });

  const categoriesFetchedRef = useRef(false);

  useEffect(() => {
    if (categoriesFetchedRef.current || categories.length > 0) return;

    const fetchCategories = async () => {
      try {
        categoriesFetchedRef.current = true;
        const response = await categoryService.getAllCategories();
        console.log("Categories API response:", response);

        if (response && response.data && Array.isArray(response.data)) {
          setCategories(response.data);
          console.log("Categories set to state:", response.data);
        } else {
          console.error("Unexpected categories data format:", response);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
    console.log("VerificationModal mounted with userId:", userId);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  const handleAnimatedClose = () => {
    setIsOpen(false);

    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVerificationForm({
      ...verificationForm,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await therapistService.updateTherapistProfile(userId, {
        description: verificationForm.description,
        category: verificationForm.category,
      });
      console.log("Verification response:", response);

      handleAnimatedClose();
      toast.success("Basic information updated successfully!");
    } catch (error) {
      console.error("Error updating information:", error);
      toast.error("Failed to update information");
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-auto transition-all duration-300 ease-in-out
        ${
          isOpen
            ? "backdrop-blur-sm bg-white/30"
            : "backdrop-blur-none bg-transparent"
        }`}
      onClick={handleAnimatedClose}
    >
      <div
        className={`relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 my-8 transition-all duration-300 transform
          ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            Complete Your Basic Information
          </h3>
          <button
            onClick={handleAnimatedClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none transform hover:rotate-90 transition-transform duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {}
            <div className="mb-4 transition-all duration-300 hover:shadow-md p-2 rounded-lg">
              <label
                htmlFor="description"
                className="block font-medium text-gray-700 mb-1"
              >
                Professional Description
              </label>
              <textarea
                id="description"
                name="description"
                value={verificationForm.description}
                onChange={handleInputChange}
                placeholder="Describe your expertise and experience"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                rows="3"
                required
              ></textarea>
            </div>

            {}
            <div className="mb-6 transition-all duration-300 hover:shadow-md p-2 rounded-lg">
              <label
                htmlFor="category"
                className="block font-medium text-gray-700 mb-1"
              >
                Specialization Category
              </label>
              <select
                id="category"
                name="category"
                value={verificationForm.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                required
              >
                <option value="">Select a category</option>
                {categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading categories...</option>
                )}
              </select>
            </div>

            <p className="text-blue-600 mb-4">
              Please complete your basic information. You can add certificates
              later in your profile.
            </p>
          </div>

          {}
          <div className="flex justify-end gap-2 p-4 border-t">
            <button
              type="button"
              onClick={handleAnimatedClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 transition-colors duration-200 transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 transform hover:scale-105"
            >
              Save Information
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
