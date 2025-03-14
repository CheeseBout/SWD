import { useState, useEffect, useContext } from "react";
import TherapistSidebar from "../../../components/SideBar/TherapistSidebar";
import { AuthContext } from "../../../contexts/AuthContextObject";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { api } from "../../../services/apiConfig";
import { reservationService } from "../../../services/reservation/reservationService";

export default function TherapistReservations() {
  const { user } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingURL, setMeetingURL] = useState("");
  const therapistId = localStorage.getItem("therapistId");

  useEffect(() => {
    fetchReservations();
  }, [filterStatus, currentPage]);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const response = await reservationService.getTherapistReservation(
        therapistId,
        filterStatus,
        currentPage,
        10
      );
      if (response?.reservations) {
        setReservations(response.reservations);
        setTotalPages(response?.pages || 1);
      } else {
        setReservations([]);
        setTotalPages(1);
        console.warn("No reservations found in response");
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Failed to load reservations");
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = async (id, newStatus, price) => {
    try {
      setIsUpdating(true);
      await reservationService.approveReservation(id, price);
      toast.success(`Reservation ${newStatus} successfully`);
      fetchReservations();
      setShowDetailsModal(false);
    } catch (error) {
      console.error("Error updating reservation status:", error);
      toast.error("Failed to update reservation");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!selectedReservation || !cancelReason) return;

    try {
      setIsUpdating(true);
      await reservationService.denyReservation(
        selectedReservation._id,
        cancelReason
      );
      toast.success("Reservation cancelled successfully");
      fetchReservations();
      setShowCancelModal(false);
      setShowDetailsModal(false);
      setCancelReason("");
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      toast.error("Failed to cancel reservation");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddMeeting = async () => {
    if (!selectedReservation || !meetingURL) return;

    try {
      setIsUpdating(true);
      await api.put(
        `/api/v1/coupletherapist/reservation/${selectedReservation._id}`,
        {
          meetingURL: meetingURL,
        }
      );
      toast.success("Meeting link added successfully");
      fetchReservations();
      setShowMeetingModal(false);
      setShowDetailsModal(false);
      setMeetingURL("");
    } catch (error) {
      console.error("Error adding meeting URL:", error);
      toast.error("Failed to add meeting link");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-gray-200 text-gray-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "canceled":
      case "denied":
        return "bg-red-100 text-red-800";
      case "deposited":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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
                Manage Reservations
              </h2>

              {/* Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-gray-600 font-medium">Status:</label>
                <select
                  className="select select-bordered bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Reservations</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                  <option value="denied">Denied</option>
                  <option value="deposited">Deposited</option>
                </select>
              </div>
            </div>

            {/* Debug - display reservation count */}
            <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded text-blue-800">
              <strong>Found {reservations.length} reservations</strong>
            </div>

            {/* Reservations Table */}
            {isLoading ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-lg">
                {reservations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
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
                      No reservations found
                    </h3>
                    <p className="text-gray-500 mt-1">
                      You don't have any reservations with this filter.
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Session Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reservations.map((reservation) => (
                        <tr
                          key={reservation._id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {reservation.userID?.fullname || "Unknown User"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {reservation.title || "No Title"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {dayjs(reservation.startTime).format(
                                "MMM DD, YYYY"
                              )}
                              <div className="text-sm text-gray-500">
                                {dayjs(reservation.startTime).format("HH:mm")} -{" "}
                                {dayjs(reservation.endTime).format("HH:mm")}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusBadgeClass(
                                reservation.status
                              )}`}
                            >
                              {reservation.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.totalPrice?.toLocaleString() || 0}{" "}
                              VND
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewDetails(reservation)}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-4 sm:px-6 mt-4">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page{" "}
                      <span className="font-medium">{currentPage}</span> of{" "}
                      <span className="font-medium">{totalPages}</span> pages
                    </p>
                  </div>
                  <div>
                    <nav
                      className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                      aria-label="Pagination"
                    >
                      <button
                        className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-900 hover:bg-gray-50"
                        } ring-1 ring-inset ring-gray-300`}
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Previous
                      </button>
                      <button
                        className={`relative inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold ${
                          currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-900 hover:bg-gray-50"
                        } ring-1 ring-inset ring-gray-300`}
                        onClick={() =>
                          setCurrentPage((prev) =>
                            prev < totalPages ? prev + 1 : prev
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reservation Details Modal */}
      {showDetailsModal && selectedReservation && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 shadow-xl transform transition-all">
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
              <h3 className="text-2xl font-bold text-gray-800">
                Reservation Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-medium text-gray-700 mb-3">
                  Session Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Title</p>
                    <p className="font-medium">{selectedReservation.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium">
                      {dayjs(selectedReservation.startTime).format(
                        "MMMM D, YYYY"
                      )}
                      <br />
                      {dayjs(selectedReservation.startTime).format(
                        "h:mm A"
                      )} - {dayjs(selectedReservation.endTime).format("h:mm A")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusBadgeClass(
                        selectedReservation.status
                      )}`}
                    >
                      {selectedReservation.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium">
                      {selectedReservation.totalPrice.toLocaleString()} VND
                    </p>
                  </div>
                  {selectedReservation.packageID && (
                    <div>
                      <p className="text-sm text-gray-500">Package</p>
                      <p className="font-medium">
                        {selectedReservation.packageID.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-700 mb-3">
                  Client Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">
                      {selectedReservation.userID.fullname}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Session Content</p>
                    <p className="font-medium">{selectedReservation.content}</p>
                  </div>
                  {selectedReservation.reason && (
                    <div className="bg-red-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500">
                        Cancellation Reason
                      </p>
                      <p className="text-red-600">
                        {selectedReservation.reason}
                      </p>
                    </div>
                  )}
                  {selectedReservation.meetingURL && (
                    <div>
                      <p className="text-sm text-gray-500">Meeting Link</p>
                      <a
                        href={selectedReservation.meetingURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedReservation.meetingURL}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-gray-200">
              {/* Action Buttons */}
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>

              {selectedReservation.status === "pending" && (
                <>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    onClick={() => {
                      setShowCancelModal(true);
                      setShowDetailsModal(false);
                    }}
                  >
                    Deny
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    onClick={() =>
                      handleUpdateStatus(
                        selectedReservation._id,
                        "confirmed",
                        selectedReservation.totalPrice
                      )
                    }
                  >
                    Confirm
                  </button>
                </>
              )}

              {selectedReservation.status === "confirmed" && (
                <>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      setMeetingURL(selectedReservation.meetingURL || "");
                      setShowMeetingModal(true);
                      setShowDetailsModal(false);
                    }}
                  >
                    {selectedReservation.meetingURL
                      ? "Update Meeting Link"
                      : "Add Meeting Link"}
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    onClick={() =>
                      handleUpdateStatus(selectedReservation._id, "completed")
                    }
                  >
                    Mark as Completed
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Reservation Modal */}
      {showCancelModal && selectedReservation && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Cancel Reservation</h3>
            <p className="mb-4 text-gray-600">
              Please provide a reason for denying this reservation:
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              rows={3}
              placeholder="Reason for cancellation"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setShowCancelModal(false);
                  setShowDetailsModal(true);
                }}
              >
                Back
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                onClick={handleCancelReservation}
                disabled={!cancelReason.trim() || isUpdating}
              >
                {isUpdating ? "Processing..." : "Confirm Denial"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting URL Modal */}
      {showMeetingModal && selectedReservation && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">
              {selectedReservation.meetingURL
                ? "Update Meeting Link"
                : "Add Meeting Link"}
            </h3>
            <p className="mb-4 text-gray-600">
              Please provide the URL for the meeting:
            </p>
            <input
              type="url"
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              placeholder="https://zoom.us/j/123456789"
              value={meetingURL}
              onChange={(e) => setMeetingURL(e.target.value)}
            />
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setShowMeetingModal(false);
                  setShowDetailsModal(true);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                onClick={handleAddMeeting}
                disabled={!meetingURL.trim() || isUpdating}
              >
                {isUpdating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
