import { useState, useEffect, useContext } from "react";
import TherapistSidebar from "../../../components/SideBar/TherapistSidebar";
import { toast } from "react-toastify";
import { certificateServices } from "../../../services/certificate/certificateServices";
import { AuthContext } from "../../../contexts/AuthContextObject";
import dayjs from "dayjs";

export default function TherapistCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    issuedDate: "",
    expiryDate: "",
    documentURL: "",
    category: "General",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useContext(AuthContext);
  const therapistId = localStorage.getItem("therapistId");

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setIsLoading(true);
        const response = await certificateServices.getCertificateByTherapistId(
          therapistId
        );
        console.log("Certificates response:", response);

        if (response?.data?.certificates) {
          setCertificates(response.data.certificates);
        }
      } catch (error) {
        console.error("Error fetching certificates:", error);
        toast.error("Failed to load certificates");
      } finally {
        setIsLoading(false);
      }
    };

    if (therapistId) {
      fetchCertificates();
    }
  }, [therapistId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (
        !formData.title ||
        !formData.issuedDate ||
        !formData.expiryDate ||
        !formData.documentURL
      ) {
        toast.error("Please fill all required fields");
        return;
      }
      const issuedDate = dayjs(formData.issuedDate);
      const expiryDate = dayjs(formData.expiryDate);

      if (issuedDate.isAfter(expiryDate) || issuedDate.isSame(expiryDate)) {
        toast.error("Issue date must be before expiry date");
        setIsSubmitting(false);
        return;
      }
      // Format dates for API
      const payload = {
        ...formData,
        issuedDate: dayjs(formData.issuedDate).toISOString(),
        expiryDate: dayjs(formData.expiryDate).toISOString(),
      };

      await certificateServices.createCertificate(payload);
      toast.success("Certificate submitted for verification");

      // Refresh certificates list
      const response = await certificateServices.getCertificateByTherapistId(
        therapistId
      );
      if (response?.data?.certificates) {
        setCertificates(response.data.certificates);
      }

      setShowAddModal(false);
      setFormData({
        title: "",
        issuedDate: "",
        expiryDate: "",
        documentURL: "",
        category: "General",
      });
    } catch (error) {
      console.error("Error submitting certificate:", error);
      toast.error("Failed to submit certificate");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get status badge styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
      case "denied":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="sticky top-0 h-screen">
          <TherapistSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                Manage Certificates
              </h2>

              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center shadow-sm"
                onClick={() => setShowAddModal(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Certificate
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg">
                {certificates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900">
                      No certificates added yet
                    </h3>
                    <p className="text-gray-500 mt-1">
                      Get started by adding your professional certificates.
                    </p>
                    <button
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
                      onClick={() => setShowAddModal(true)}
                    >
                      Add Your First Certificate
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((certificate) => (
                      <div
                        key={certificate._id}
                        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="h-48 overflow-hidden border-b">
                          <img
                            src={certificate.documentURL}
                            alt={certificate.title}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold text-lg text-gray-800 mr-2 line-clamp-2">
                              {certificate.title}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full capitalize font-medium border ${getStatusBadgeClass(
                                certificate.status
                              )}`}
                            >
                              {certificate.status}
                            </span>
                          </div>

                          <p className="text-sm text-gray-500 mb-3">
                            {certificate.category}
                          </p>

                          <div className="flex justify-between text-xs text-gray-600">
                            <div>
                              <p className="font-medium mb-1">Issued Date:</p>
                              <p>
                                {dayjs(certificate.issuedDate).format(
                                  "MMM D, YYYY"
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium mb-1">Expiry Date:</p>
                              <p>
                                {dayjs(certificate.expiryDate).format(
                                  "MMM D, YYYY"
                                )}
                              </p>
                            </div>
                          </div>

                          {(certificate.reason || certificate.denialReason) && (
                            <div className="mt-3 p-2 bg-red-50 text-red-700 text-xs rounded">
                              <p className="font-medium">Rejection reason:</p>
                              <p>
                                {certificate.denialReason || certificate.reason}
                              </p>
                            </div>
                          )}

                          <div className="mt-4 pt-3 border-t border-gray-100">
                            {certificate.isCertificateVerified ||
                            certificate.status === "approved" ? (
                              <div className="flex items-center text-green-600">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span className="text-xs font-medium">
                                  Verified
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center text-gray-500">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span className="text-xs">
                                  Awaiting verification
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Certificate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl transform transition-all">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Add New Certificate
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Title*
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="E.g., Professional Counseling Certification"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issued Date*
                  </label>
                  <input
                    type="date"
                    name="issuedDate"
                    value={formData.issuedDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date*
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Category*
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="General">General</option>
                  <option value="Family & Marriage">Family & Marriage</option>
                  <option value="Relationship">Relationship</option>
                  <option value="Communication">Communication</option>
                  <option value="Conflict Resolution">
                    Conflict Resolution
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Image URL*
                </label>
                <input
                  type="url"
                  name="documentURL"
                  value={formData.documentURL}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/your-certificate-image.jpg"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Please provide a direct link to your certificate image.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none flex items-center"
                >
                  {isSubmitting ? (
                    <>
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
                      Submitting...
                    </>
                  ) : (
                    "Submit Certificate"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
