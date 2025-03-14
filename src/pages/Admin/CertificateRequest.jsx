import { useState, useEffect } from "react";
import { adminService } from "../../services/admin/adminService";
import { toast } from "react-toastify";
import dayjs from "dayjs";

export default function CertificateRequest() {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getCertificateRequests();
      setCertificates(response.data);
    } catch (error) {
      toast.error("Failed to load certificate requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (certificate) => {
    try {
      await adminService.manageCertificate(
        certificate.therapistId,
        "approve",
        certificate._id
      );
      toast.success("Certificate approved successfully");
      fetchCertificates();
    } catch (error) {
      toast.error("Failed to approve certificate");
    }
  };

  const handleReject = async () => {
    try {
      await adminService.manageCertificate(
        selectedCertificate.therapistId,
        "reject",
        selectedCertificate._id,
        rejectReason
      );
      toast.success("Certificate rejected");
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedCertificate(null);
      fetchCertificates();
    } catch (error) {
      toast.error("Failed to reject certificate");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Certificate Requests</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certificates.map((certificate) => (
          <div key={certificate._id} className="bg-white rounded-lg shadow-md p-4">
            <div className="h-48 mb-4">
              <img
                src={certificate.documentURL}
                alt={certificate.title}
                className="w-full h-full object-cover rounded"
              />
            </div>
            
            <h3 className="font-semibold text-lg mb-2">{certificate.title}</h3>
            <p className="text-sm text-gray-600 mb-2">
              Category: {certificate.category}
            </p>
            
            <div className="text-sm text-gray-600 mb-4">
              <p>Issued: {dayjs(certificate.issuedDate).format("MMM D, YYYY")}</p>
              <p>Expires: {dayjs(certificate.expiryDate).format("MMM D, YYYY")}</p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleApprove(certificate)}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  setSelectedCertificate(certificate);
                  setShowRejectModal(true);
                }}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Reject Certificate</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full p-2 border rounded mb-4"
              rows="3"
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setSelectedCertificate(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                disabled={!rejectReason.trim()}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
