import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContextObject";
import { reservationService } from "../../services/reservation/reservationService";
import dayjs from "dayjs";
import paymentService from "../../services/payment";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import SideBar from "../../components/SideBar";
import { reservationResultService } from "../../services/reservation/reservationResultService";

export default function YourReservation() {
  const { user: authUser } = useContext(AuthContext);
  const userID =
    authUser?.userId || authUser?._id || authUser?.id || authUser?.sub;

  const [reservations, setReservations] = useState([]);
  const [filterStatus, setFilterStatus] = useState(""); // Default: Show all
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReservationId, setCancelReservationId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isPayingFull, setIsPayingFull] = useState(false);

  const handleUnifiedPayment = async (reservation, paymentPhase) => {
    // Show appropriate loading state
    if (paymentPhase === "DEPOSIT") {
      setIsLoading(true);
    } else {
      setIsPayingFull(true);
    }

    const paymentData = {
      reservationID: reservation._id,
      phase: paymentPhase,
      totalPrice: reservation.totalPrice,
    };

    try {
      sessionStorage.setItem("paymentPhase", paymentPhase);
      const response = await paymentService.createPayment(paymentData);
      if (response?.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        console.log("Payment failed!");
        toast.error("Unable to process payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment processing error");
    } finally {
      // Reset appropriate loading state
      if (paymentPhase === "DEPOSIT") {
        setIsLoading(false);
      } else {
        setIsPayingFull(false);
      }
    }
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetailsModal(true);
  };
  const navigateToResults = (reservationId, therapistId) => {
    console.log("Navigating to results for reservation:", therapistId);

    navigate(`/reservation-results/${reservationId}/${therapistId}`);
  };

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoadingList(true);
      const response = await reservationService.getMemberReservation(
        userID,
        filterStatus,
        currentPage,
        20
      );

      setReservations(response.reservations);
      setTotalPages(response.pages);
      setIsLoadingList(false);
    };
    fetchReservations();
  }, [userID, filterStatus, currentPage, refreshKey]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isCancelled = params.get("cancelled");
    const errorMessage = params.get("message");
    const isSuccessful = params.get("success");
    const storedPaymentPhase = sessionStorage.getItem("paymentPhase");

    if (isCancelled === "true" && isSuccessful === "false") {
      toast.warning(errorMessage || "Payment cancelled");
      sessionStorage.removeItem("paymentPhase");
      setTimeout(() => {
        navigate("/profile/your-reservations", { replace: true });
      }, 3000);
    }

    if (isSuccessful === "true") {
      toast.success("Payment successful");
      // If this was a FINAL payment, update the reservation results
      if (storedPaymentPhase === "FINAL") {
        const updateResults = async () => {
          try {
            await reservationResultService.getAllReservationResultByUserId(
              userID
            );
            // Refresh the reservations data
            setRefreshKey((prev) => prev + 1);
          } catch (error) {
            console.error("Error fetching updated results:", error);
          }
        };
        updateResults();
      }
      sessionStorage.removeItem("paymentPhase");
      setTimeout(() => {
        navigate("/profile/your-reservations", { replace: true });
      }, 3000);
    }
  }, [location, navigate, userID]);

  const handleOpenPayment = (reservation) => {
    setSelectedReservation(reservation);
    setShowPaymentModal(true);
    // No change to actual payment until user confirms in modal
  };
  const handleCancel = (id) => {
    setCancelReservationId(id);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    try {
      await reservationService.cancelReservation(cancelReservationId);
      toast.success("Reservation cancelled successfully");
      setRefreshKey((prevKey) => prevKey + 1);
    } catch (error) {
      toast.error("Failed to cancel reservation");
    } finally {
      setShowCancelModal(false);
    }
  };

  const filteredReservations = reservations.filter(
    (reservation) => reservation.status !== "canceled"
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="sticky top-0 h-screen">
          <SideBar />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                Your Reservations
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
                  {/* <option value="canceled">Canceled</option> */}
                  <option value="deposited">Deposited</option>
                  <option value="denied">Denied</option>
                </select>
              </div>
            </div>

            {/* Reservations Table */}
            <div className="overflow-x-auto bg-white rounded-lg">
              {isLoadingList ? (
                <div className="flex justify-center items-center h-60">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Therapist
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
                    {filteredReservations?.length > 0 ? (
                      filteredReservations.map((reservation) => (
                        <tr
                          key={reservation._id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <img
                                  className="h-12 w-12 rounded-full object-cover"
                                  src={
                                    reservation.coupleTherapistID.photoURL ||
                                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAl-XO5gOKiGi0opK2bSoUtnKkyQuTzgQVhQ&s"
                                  }
                                  alt="Therapist"
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {reservation.coupleTherapistID.fullname}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {reservation.title}
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
                              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full capitalize ${
                                reservation.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : reservation.status === "pending"
                                  ? "bg-gray-200 text-gray-800"
                                  : reservation.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : reservation.status === "deposited"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {reservation.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.totalPrice.toLocaleString()} VND
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              {/* View Details button for all statuses */}
                              <button
                                className="text-blue-600 hover:text-blue-900 mr-2"
                                onClick={() => handleViewDetails(reservation)}
                              >
                                View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-16 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-12 w-12 text-gray-400 mb-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <p className="text-lg font-medium">
                              No reservations found
                            </p>
                            <p className="text-sm mt-1">
                              Try changing your filter or make a new reservation
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-4 sm:px-6">
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

      {/* Payment Modal */}
      {showPaymentModal && selectedReservation && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl transform transition-all">
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Complete Your Deposit
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                50% of the total payment is required as deposit
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Therapist</span>
                <span className="font-medium">
                  {selectedReservation.coupleTherapistID.fullname}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Session</span>
                <span className="font-medium">{selectedReservation.title}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">
                  {dayjs(selectedReservation.startTime).format("MMM DD, YYYY")}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Time</span>
                <span className="font-medium">
                  {dayjs(selectedReservation.startTime).format("HH:mm")} -{" "}
                  {dayjs(selectedReservation.endTime).format("HH:mm")}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-gray-800 font-medium">
                  Deposit Amount (50%)
                </span>
                <span className="text-xl font-bold text-blue-600">
                  {(selectedReservation.totalPrice / 2).toLocaleString()} VND
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150 ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
                onClick={() =>
                  handleUnifiedPayment(selectedReservation, "DEPOSIT")
                }
                disabled={isLoading}
              >
                {isLoading ? (
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
                  "Proceed to Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-bold text-center mb-2">
              Cancel Reservation
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to cancel this reservation? This action
              cannot be undone.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Reservation
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-150"
                onClick={confirmCancel}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedReservation && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl transform transition-all">
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  Reservation Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
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
            </div>

            <div className="space-y-4 mb-6">
              {/* Therapist Info */}
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 h-16 w-16">
                  <img
                    className="h-16 w-16 rounded-full object-cover"
                    src={
                      selectedReservation.coupleTherapistID.photoURL ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAl-XO5gOKiGi0opK2bSoUtnKkyQuTzgQVhQ&s"
                    }
                    alt="Therapist"
                  />
                </div>
                <div className="ml-4">
                  <div className="text-lg font-medium text-gray-900">
                    {selectedReservation.coupleTherapistID.fullname}
                  </div>
                  <div className="text-sm text-gray-500">Couple Therapist</div>
                </div>
              </div>

              {/* Session Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">
                  Session Information
                </h4>

                <div className="grid grid-cols-2 gap-y-3">
                  <div className="text-sm text-gray-600">Title:</div>
                  <div className="text-sm font-medium">
                    {selectedReservation.title}
                  </div>

                  <div className="text-sm text-gray-600">Date:</div>
                  <div className="text-sm font-medium">
                    {dayjs(selectedReservation.startTime).format(
                      "MMM DD, YYYY"
                    )}
                  </div>

                  <div className="text-sm text-gray-600">Time:</div>
                  <div className="text-sm font-medium">
                    {dayjs(selectedReservation.startTime).format("HH:mm")} -{" "}
                    {dayjs(selectedReservation.endTime).format("HH:mm")}
                  </div>

                  <div className="text-sm text-gray-600">Status:</div>
                  <div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        selectedReservation.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : selectedReservation.status === "pending"
                          ? "bg-gray-200 text-gray-800"
                          : selectedReservation.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : selectedReservation.status === "deposited"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedReservation.status}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">Price:</div>
                  <div className="text-sm font-medium">
                    {selectedReservation.totalPrice.toLocaleString()} VND
                  </div>
                </div>
              </div>

              {/* Denial reason if status is denied */}
              {selectedReservation.status === "denied" && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Reason for Denial
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>
                          {selectedReservation.reason || "No reason provided."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              {selectedReservation.status === "confirmed" && (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleOpenPayment(selectedReservation);
                  }}
                >
                  Pay Deposit
                </button>
              )}

              {selectedReservation.status === "deposited" && (
                <>
                  {/* Case 1: Deposited with null result  */}
                  {!selectedReservation.reservationResult && (
                    <a
                      href={
                        selectedReservation.meetingURL ||
                        "https://meet.google.com/landing"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-150"
                    >
                      Join Meeting
                    </a>
                  )}

                  {/* Case 2: Deposited with final_completed result  */}
                  {/* {selectedReservation.reservationResult?.status ===
                    "final_completed" && (
                    <button
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-150"
                      onClick={() => {
                        setShowDetailsModal(false);

                        navigateToResults(selectedReservation._id);
                      }}
                    >
                      View Results
                    </button>
                  )} */}

                  {/* Case 3: Deposited with pending result  */}
                  {selectedReservation.reservationResult?.status ===
                    "pending" && (
                    <div className="flex flex-col space-y-2">
                      <button
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md hover:from-green-600 hover:to-emerald-700 transition-all duration-150 flex items-center justify-center shadow-md"
                        onClick={() => {
                          setShowDetailsModal(false);
                          handleUnifiedPayment(selectedReservation, "FINAL");
                        }}
                        disabled={isPayingFull}
                      >
                        {isPayingFull ? (
                          <div className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                              />
                            </svg>
                            Pay Remaining Balance
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}

              {selectedReservation.status === "completed" && (
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-150"
                  onClick={() => {
                    setShowDetailsModal(false);
                    navigateToResults(
                      selectedReservation._id,
                      selectedReservation.coupleTherapistID._id
                    );
                  }}
                >
                  View Results
                </button>
              )}

              {selectedReservation.status === "pending" && (
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-150"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleCancel(selectedReservation._id);
                  }}
                >
                  Cancel Reservation
                </button>
              )}

              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
            {selectedReservation.status === "deposited" &&
              selectedReservation.reservationResult?.status === "pending" && (
                <div className="flex flex-col space-y-2">
                  <p className="text-md text-amber-600 font-medium text-center mt-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline-block h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Complete payment to access your results
                  </p>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
