import { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { toast } from "react-toastify";
import { FaCheck, FaTimes, FaEye, FaCalendarAlt } from "react-icons/fa";
import { format } from "date-fns";
import AdminSideBar from "../../components/SideBar/AdminSidebar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import {
  FilterIcon,
  SearchIcon,
  DocumentTextIcon,
  AcademicCapIcon,
} from "@heroicons/react/outline";

export default function CertificateRequest() {
  const [certificateRequests, setCertificateRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [action, setAction] = useState("");
  const [reason, setReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const requestsPerPage = 8;

  useEffect(() => {
    fetchCertificateRequests();
  }, [refreshTrigger]);

  useEffect(() => {
    let results = certificateRequests;

    if (searchTerm) {
      results = results.filter(
        (request) =>
          (request.userName &&
            request.userName
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (request.courseName &&
            request.courseName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== "all") {
      results = results.filter(
        (request) =>
          request.status &&
          request.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredRequests(results);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, certificateRequests]);

  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredRequests.slice(
    indexOfFirstRequest,
    indexOfLastRequest
  );
  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);

  const fetchCertificateRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getAllCertificateRequests();

      const requestsData = Array.isArray(response)
        ? response
        : response.data && Array.isArray(response.data)
        ? response.data
        : [];

      console.log("Raw certificate requests:", requestsData);

      requestsData.sort((a, b) => {
        const dateA = new Date(
          a.requestDate || a.issuedDate || a.createdAt || new Date()
        );
        const dateB = new Date(
          b.requestDate || b.issuedDate || b.createdAt || new Date()
        );
        return dateB - dateA;
      });

      const mappedRequests = requestsData.map((request) => {
        const mappedRequest = {
          id: request._id,
          _id: request._id,
          userId: request.userId || request.therapistId || request._id,
          userIdRaw: request.userId,
          userName:
            request.userName || request.title || request.name || "Unknown",
          userEmail: request.userEmail || request.email || "",
          courseName:
            request.title ||
            request.courseName ||
            request.category ||
            "Certificate",
          courseId: request.certificateId || request.courseId || request._id,
          courseIdRaw: request.courseId,
          requestDate:
            request.createdAt || request.issuedDate || request.requestDate,
          issuedDate: request.issuedDate,
          status: request.status || "pending",
          documentURL: request.documentURL || request.imageUrl,
          category: request.category,
        };

        return mappedRequest;
      });

      setCertificateRequests(mappedRequests);
      setFilteredRequests(mappedRequests);
    } catch (error) {
      console.error("Error fetching certificate requests:", error);
      setError("Failed to load certificate requests. Please try again later.");
      setCertificateRequests([]);
      setFilteredRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (request, actionType) => {
    setSelectedRequest(request);
    setAction(actionType);

    if (actionType === "approve") {
      confirmAction();
    } else {
      setReason("");
      setShowConfirmDialog(true);
    }
  };

  const confirmAction = async () => {
    try {
      const certificateID = selectedRequest?.id || selectedRequest?._id;

      if (!certificateID) {
        toast.error("Missing required information to process this request");
        console.error("Missing certificate ID:", selectedRequest);
        return;
      }

      if (action === "deny" && !reason.trim()) {
        toast.error("Please provide a reason for denial");
        return;
      }

      console.log("Selected certificate details:", {
        certificateID,
        action,
        reason: action === "deny" ? reason : "",
        selectedRequest,
      });

      const response = await adminService.manageCertificate(
        certificateID,
        action,
        action === "deny" ? reason : ""
      );

      console.log("Certificate management response:", response);

      toast.success(
        `Certificate request ${
          action === "approve" ? "approved" : "denied"
        } successfully`
      );

      setRefreshTrigger((prev) => prev + 1);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error("Error managing certificate:", error);
      let errorMessage = "An unexpected error occurred";

      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`Failed to ${action} certificate request: ${errorMessage}`);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const Pagination = () => {
    return (
      <div className="flex justify-center mt-6">
        <div className="join">
          <button
            className="join-item btn btn-sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            «
          </button>
          <button
            className="join-item btn btn-sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          <button className="join-item btn btn-sm">
            Page {currentPage} of {totalPages}
          </button>
          <button
            className="join-item btn btn-sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            ›
          </button>
          <button
            className="join-item btn btn-sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>
    );
  };

  if (loading && certificateRequests.length === 0)
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <AdminSideBar />
        <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">
              Loading certificate requests...
            </p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <AdminSideBar />
        <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <ErrorMessage error={error} />
            <button
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              className="mt-4 btn btn-primary w-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminSideBar />

      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Certificate Requests
            </h1>
            <p className="text-gray-600">
              Review and approve certification requests from therapists
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="stat bg-white shadow-md rounded-lg p-6 border-l-4 border-blue-500 transition-all hover:shadow-lg">
              <div className="flex justify-between">
                <div>
                  <div className="stat-title text-gray-500 font-medium">
                    Total Requests
                  </div>
                  <div className="stat-value text-3xl font-bold text-gray-800 mt-2">
                    {certificateRequests.length}
                  </div>
                </div>
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="stat bg-white shadow-md rounded-lg p-6 border-l-4 border-yellow-500 transition-all hover:shadow-lg">
              <div className="flex justify-between">
                <div>
                  <div className="stat-title text-gray-500 font-medium">
                    Pending
                  </div>
                  <div className="stat-value text-3xl font-bold text-yellow-600 mt-2">
                    {
                      certificateRequests.filter(
                        (req) => req.status?.toLowerCase() === "pending"
                      ).length
                    }
                  </div>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <FaCalendarAlt className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="stat bg-white shadow-md rounded-lg p-6 border-l-4 border-green-500 transition-all hover:shadow-lg">
              <div className="flex justify-between">
                <div>
                  <div className="stat-title text-gray-500 font-medium">
                    Approved
                  </div>
                  <div className="stat-value text-3xl font-bold text-green-600 mt-2">
                    {
                      certificateRequests.filter(
                        (req) => req.status?.toLowerCase() === "approved"
                      ).length
                    }
                  </div>
                </div>
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <FaCheck className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Search
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="input input-bordered w-full pl-10"
                    placeholder="Search by name or course..."
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Filter by Status
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FilterIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="status"
                    value={statusFilter}
                    onChange={handleStatusFilter}
                    className="select select-bordered w-full pl-10"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="denied">Denied</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center my-8">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {}
          {!loading && filteredRequests.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-8 text-center">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="bg-gray-100 rounded-full p-6 mb-4">
                  <AcademicCapIcon className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-medium text-gray-900 mb-2">
                  No certificate requests found
                </h3>
                {searchTerm || statusFilter !== "all" ? (
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Try adjusting your search or filter criteria to find what
                    you're looking for
                  </p>
                ) : (
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    No therapists have requested certificates yet. New requests
                    will appear here.
                  </p>
                )}
                {(searchTerm || statusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="btn btn-outline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            !loading && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentRequests.map((request, index) => (
                    <div
                      key={request.id || `request-${index}`}
                      className={`bg-white shadow-md rounded-lg overflow-hidden transition-all hover:shadow-lg border-t-4 ${
                        request.status?.toLowerCase() === "pending"
                          ? "border-yellow-400"
                          : request.status?.toLowerCase() === "approved"
                          ? "border-green-400"
                          : "border-red-400"
                      }`}
                    >
                      <div className="p-6">
                        {}
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">
                            {request.courseName ||
                              request.title ||
                              "Certificate"}
                          </h3>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              request.status?.toLowerCase() === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : request.status?.toLowerCase() === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {request.status || "Pending"}
                          </span>
                        </div>

                        {}
                        {request.documentURL && (
                          <div className="mb-4 bg-gray-50 p-1 rounded border border-gray-100">
                            <a
                              href={request.documentURL}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                src={request.documentURL}
                                alt="Certificate"
                                className="w-full h-36 object-contain rounded"
                              />
                            </a>
                          </div>
                        )}

                        {}
                        <div className="flex items-center mb-4">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            {request.userPhoto ? (
                              <img
                                src={request.userPhoto}
                                alt=""
                                className="h-10 w-10 object-cover rounded-full"
                              />
                            ) : (
                              <span className="text-blue-700 font-medium text-sm">
                                {(request.userName ||
                                  request.title ||
                                  "C")[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {request.userName || "Therapist Name"}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <FaCalendarAlt className="mr-1" />
                              {request.requestDate
                                ? format(
                                    new Date(request.requestDate),
                                    "MMM d, yyyy"
                                  )
                                : request.issuedDate
                                ? format(
                                    new Date(request.issuedDate),
                                    "MMM d, yyyy"
                                  )
                                : request.createdAt
                                ? format(
                                    new Date(request.createdAt),
                                    "MMM d, yyyy"
                                  )
                                : "N/A"}
                            </div>
                          </div>
                        </div>

                        {}
                        {request.category && (
                          <div className="mb-4 text-sm">
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                              {request.category}
                            </span>
                          </div>
                        )}

                        {}
                        <div className="flex justify-end space-x-2 mt-4">
                          <a
                            href={request.documentURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline btn-info"
                          >
                            <FaEye className="mr-1" /> View
                          </a>

                          {request.status?.toLowerCase() === "pending" && (
                            <>
                              <button
                                onClick={() => handleAction(request, "approve")}
                                className="btn btn-sm btn-success text-white"
                              >
                                <FaCheck className="mr-1" /> Approve
                              </button>
                              <button
                                onClick={() => handleAction(request, "deny")}
                                className="btn btn-sm btn-error text-white"
                              >
                                <FaTimes className="mr-1" /> Deny
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination />
                  </div>
                )}

                <div className="mt-6 bg-white p-4 rounded-lg shadow text-sm text-gray-500 text-center">
                  Showing {indexOfFirstRequest + 1}-
                  {Math.min(indexOfLastRequest, filteredRequests.length)} of{" "}
                  {filteredRequests.length} requests
                  {(searchTerm || statusFilter !== "all") && (
                    <span>
                      {" "}
                      (filtered from {certificateRequests.length} total)
                    </span>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {showConfirmDialog && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full mx-4">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  {action === "approve" ? "Approve" : "Deny"} Certificate
                  Request
                </h3>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  {action === "approve"
                    ? `Are you sure you want to approve this certificate request for "${
                        selectedRequest?.courseName || "this course"
                      }"?`
                    : `Please provide a reason for denying the certificate request for "${
                        selectedRequest?.courseName || "this course"
                      }".`}
                </p>

                {action === "deny" && (
                  <div className="mb-4">
                    <label
                      htmlFor="reason"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Reason for denial (required)
                    </label>
                    <textarea
                      id="reason"
                      rows="3"
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                      placeholder="Please provide a detailed reason for denying this certificate request"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                )}

                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                      action === "approve"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                    onClick={confirmAction}
                    disabled={action === "deny" && !reason.trim()}
                  >
                    {action === "approve" ? "Approve" : "Deny"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowConfirmDialog(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
