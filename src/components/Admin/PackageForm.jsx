import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { therapistService } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";

const PackageForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  submitButtonText = "Save Package",
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    discount: 0,
    comissionFee: 0,
    coupleTherapistID: "",
  });
  const [errors, setErrors] = useState({});
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    setHasInitialized(false);
  }, [initialData]);

  useEffect(() => {
    if (!hasInitialized) {
      try {
        if (initialData) {
          setFormData({
            name: String(initialData.name || ""),
            description: String(initialData.description || ""),
            price: Number(initialData.price || 0),
            discount: Number(initialData.discount || 0),
            comissionFee: Number(initialData.comissionFee || 0),
            coupleTherapistID:
              typeof initialData.coupleTherapistID === "object" &&
              initialData.coupleTherapistID?._id
                ? initialData.coupleTherapistID._id
                : String(initialData.coupleTherapistID || ""),
          });
        } else {
          setFormData({
            name: "",
            description: "",
            price: 0,
            discount: 0,
            comissionFee: 0,
            coupleTherapistID: "",
          });
        }
        setHasInitialized(true);
      } catch (error) {
        console.error("Error setting form data:", error);
      }
    }
  }, [initialData, hasInitialized]);

  useEffect(() => {
    let isMounted = true;

    const fetchTherapists = async () => {
      if (!isMounted) return;

      setLoading(true);
      setApiError(null);

      try {
        const response = await therapistService.getAllTherapists();
        if (!isMounted) return;

        if (response) {
          const apiTherapists = extractTherapists(response);
          setTherapists(apiTherapists);
        }
      } catch (error) {
        console.error("Error fetching therapists:", error);
        if (isMounted) {
          setApiError(
            "Failed to load therapists. Please try again or contact support."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTherapists();

    return () => {
      isMounted = false;
    };
  }, []);

  const extractTherapists = (response) => {
    try {
      let therapistsData = [];

      if (response?.data && Array.isArray(response.data)) {
        therapistsData = response.data;
      } else if (
        response?.data?.therapists &&
        Array.isArray(response.data.therapists)
      ) {
        therapistsData = response.data.therapists;
      } else if (response?.therapists && Array.isArray(response.therapists)) {
        therapistsData = response.therapists;
      } else if (Array.isArray(response)) {
        therapistsData = response;
      }

      return therapistsData
        .filter((t) => t !== null && t !== undefined)
        .map((t) => ({
          id:
            t._id ||
            t.id ||
            `therapist-${Math.random().toString(36).substr(2, 9)}`,
          fullName: extractName(t),
          expertise: t.category || "",
          email: t.userInfo?.email || t.userID?.email || "",
          photoURL: t.userInfo?.photoURL || t.userID?.photoURL || "",
        }));
    } catch (err) {
      console.error("Error extracting therapists:", err);
      return [];
    }
  };

  const extractName = (therapist) => {
    if (!therapist) return "Unnamed Therapist";

    if (therapist.userInfo?.fullname) return therapist.userInfo.fullname;

    if (therapist.fullName) return therapist.fullName;
    if (therapist.name) return therapist.name;
    if (therapist.userID?.fullname) return therapist.userID.fullname;

    return "Unnamed Therapist";
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData({
        ...formData,
        [name]: value === "" ? "" : Number(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Package name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (formData.discount < 0 || formData.discount > 100) {
      newErrors.discount = "Discount must be between 0 and 100";
    }

    if (formData.comissionFee < 0 || formData.comissionFee > 100) {
      newErrors.comissionFee = "Commission fee must be between 0 and 100";
    }

    if (!formData.coupleTherapistID) {
      newErrors.coupleTherapistID = "Please select a therapist";
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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner size="md" />
        <p className="ml-3 text-gray-600">Loading therapists...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4h2V9H9z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M10 4a1 1 0 011 1v4a1 1 0 11-2 0V5a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Package Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
          }`}
          placeholder="Premium Package"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.description ? "border-red-300 bg-red-50" : "border-gray-300"
          }`}
          placeholder="Complete access to all counseling services"
          disabled={isSubmitting}
        ></textarea>
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Price (VND) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="price"
            name="price"
            min="0"
            step="1000"
            value={formData.price}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.price ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
            placeholder="200000"
            disabled={isSubmitting}
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="discount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Discount (%)
          </label>
          <input
            type="number"
            id="discount"
            name="discount"
            min="0"
            max="100"
            value={formData.discount}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.discount ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
            placeholder="20"
            disabled={isSubmitting}
          />
          {errors.discount && (
            <p className="mt-1 text-sm text-red-600">{errors.discount}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="comissionFee"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Commission Fee (%)
          </label>
          <input
            type="number"
            id="comissionFee"
            name="comissionFee"
            min="0"
            max="100"
            value={formData.comissionFee}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.comissionFee
                ? "border-red-300 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="10"
            disabled={isSubmitting}
          />
          {errors.comissionFee && (
            <p className="mt-1 text-sm text-red-600">{errors.comissionFee}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="coupleTherapistID"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Therapist <span className="text-red-500">*</span>
        </label>
        <select
          id="coupleTherapistID"
          name="coupleTherapistID"
          value={formData.coupleTherapistID || ""}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.coupleTherapistID
              ? "border-red-300 bg-red-50"
              : "border-gray-300"
          }`}
          disabled={isSubmitting || loading}
        >
          <option value="">Select a therapist</option>
          {therapists.length > 0 ? (
            therapists.map((therapist) => (
              <option
                key={therapist.id || `therapist-${Math.random()}`}
                value={therapist.id || ""}
              >
                {therapist.fullName || "Unnamed Therapist"}
                {therapist.expertise ? ` (${therapist.expertise})` : ""}
                {therapist.email ? ` - ${therapist.email}` : ""}
              </option>
            ))
          ) : (
            <option value="" disabled>
              No therapists available
            </option>
          )}
        </select>

        {errors.coupleTherapistID && (
          <p className="mt-1 text-sm text-red-600">
            {errors.coupleTherapistID}
          </p>
        )}

        {!loading && therapists.length === 0 && (
          <p className="mt-1 text-sm text-amber-600">
            No therapists found. Please make sure therapists are registered in
            the system.
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </div>
          ) : (
            submitButtonText
          )}
        </button>
      </div>
    </form>
  );
};

PackageForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitButtonText: PropTypes.string,
  isSubmitting: PropTypes.bool,
};

export default PackageForm;
