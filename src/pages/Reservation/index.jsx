import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContextObject";
import { reservationService } from "../../services/reservation/reservationService";
import dayjs from "dayjs";
import paymentService from "../../services/payment";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { set } from "lodash";
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
  const handlePayment = async (reservation) => {
    setIsLoading(true);
    const paymentData = {
      reservationID: reservation._id,
      phase: "DEPOSIT",
      totalPrice: reservation.totalPrice / 2,
    };

    try {
      const response = await paymentService.createPayment(paymentData);
      console.log("Payment response:", response);
      if (response?.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        console.log("Payment failed!");
      }
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isCancelled = params.get("cancelled");
    const errorMessage = params.get("message");
    const isSuccessful = params.get("success");

    if (isCancelled === "true" && isSuccessful === "false") {
      toast.warning(errorMessage || "Payment cancelled");
      setTimeout(() => {
        navigate("/your-reservations", { replace: true });
      }, 3000);
    }
    if (isSuccessful === "true") {
      toast.success("Payment successful");
      setTimeout(() => {
        navigate("/your-reservations", { replace: true });
      }, 3000);
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoadingList(true);
      const response = await reservationService.getMemberReservation(
        userID,
        filterStatus,
        currentPage,
        10
      );

      setReservations(response.reservations);
      setTotalPages(response.pages);
      setIsLoadingList(false);
    };
    fetchReservations();
  }, [userID, filterStatus, currentPage, refreshKey]);

  const handleOpenPayment = (reservation) => {
    setSelectedReservation(reservation);
    setShowPaymentModal(true);
  };
  const handleCancel = (id) => {
    setCancelReservationId(id);
    setShowCancelModal(true);
    setRefreshKey((prevKey) => prevKey + 1);
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
  return (
    <div className="max-w mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Reservation List</h2>
      <div className="mb-4">
        <label className="mr-2 font-medium">Filter by status:</label>
        <select
          className="select select-bordered"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1); // Reset to page 1 when changing filter
          }}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="canceled">Canceled</option>
          <option value="denied">Denied</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto h-[600px]">
        <table className="table w-full ">
          <thead>
            <tr className="bg-gray-100 text-left">
              <td></td>
              <th>Therapist</th>
              <th>Title</th>
              <th>Time</th>
              <th>Status</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations?.length > 0 ? (
              reservations.map((reservation) => (
                <tr key={reservation._id}>
                  <td className="p-3">
                    <img
                      src={
                        reservation.userID.avatar ||
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAl-XO5gOKiGi0opK2bSoUtnKkyQuTzgQVhQ&s"
                      }
                      alt="Therapist Avatar"
                      className="w-16 h-16 rounded-full"
                    />
                  </td>
                  <td>{reservation.userID.fullname}</td>
                  <td>{reservation.title}</td>
                  <td className="text-lg">
                    {dayjs(reservation.startTime).format("DD/MM/YYYY HH:mm")} -{" "}
                    {dayjs(reservation.endTime).format("HH:mm")}
                  </td>
                  <td>
                    <span
                      className={`badge font-semibold  h-8 w-28 capitalize ${
                        reservation.status === "confirmed"
                          ? "badge-success"
                          : reservation.status === "pending"
                          ? "badge-warning"
                          : "bg-red-300"
                      }`}
                    >
                      {reservation.status.charAt(0).toUpperCase() +
                        reservation.status.slice(1)}
                    </span>
                  </td>
                  <td className="font-semibold text-lg">
                    {reservation.totalPrice.toLocaleString()} VND
                  </td>
                  <td className="flex gap-2 ">
                    {reservation.status === "pending" && (
                      <button
                        className="btn btn-error btn-md"
                        onClick={() => handleCancel(reservation._id)}
                      >
                        Cancel
                      </button>
                    )}
                    {reservation.status === "confirmed" && (
                      <button
                        className="btn btn-primary btn-md"
                        onClick={() => handleOpenPayment(reservation)}
                      >
                        Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4 text-xl pt-20">
                  No reservations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <button
          className="btn btn-outline"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {currentPage} / {totalPages}
        </span>
        <button
          className="btn btn-outline"
          onClick={() =>
            setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedReservation && (
        <div className="modal modal-open flex items-center justify-center">
          <div className="modal-box max-w-lg p-6 rounded-lg shadow-lg bg-white">
            <h3 className="text-2xl font-semibold flex items-center justify-center gap-2 mb-10">
              Payment Confirmation
            </h3>

            <div className="space-y-3">
              <p className="flex items-center gap-2">
                <i className="fas fa-user-md text-blue-500"></i>
                <strong>Therapist:</strong>{" "}
                {selectedReservation.userID.fullname}
              </p>

              <p className="flex items-center gap-2">
                <i className="fas fa-book text-indigo-500"></i>
                <strong>Title:</strong> {selectedReservation.title}
              </p>

              <p className="flex items-center gap-2">
                <i className="fas fa-calendar-alt text-yellow-500"></i>
                <strong>Time:</strong>
                {dayjs(selectedReservation.startTime).format(
                  "DD/MM/YYYY HH:mm"
                )}{" "}
                -{dayjs(selectedReservation.endTime).format("HH:mm")}
              </p>

              <p className="flex items-center gap-2 text-lg  ">
                <i className="fas fa-money-bill-wave"></i>
                <strong>Deposit:</strong>
                {(selectedReservation.totalPrice / 2).toLocaleString()} VND
                <span className="text-sm text-gray-500">
                  (50% of total price)
                </span>
              </p>
            </div>

            <div className="modal-action flex justify-end mt-4 gap-3">
              <button
                className={`btn btn-success flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => handlePayment(selectedReservation)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-check-circle"></i>
                )}
                Confirm Payment
              </button>
              <button
                className="btn btn-outline flex items-center gap-2 px-4 py-2 rounded-lg"
                onClick={() => setShowPaymentModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showCancelModal && (
        <div className="modal modal-open flex items-center justify-center">
          <div className="modal-box max-w-sm p-6 rounded-lg shadow-lg bg-white">
            <h3 className="text-xl font-semibold text-center mb-4">
              Confirm Cancellation
            </h3>
            <p className="text-center mb-4">
              Are you sure you want to cancel this reservation?
            </p>
            <div className="modal-action flex justify-end gap-3">
              <button className="btn btn-error" onClick={confirmCancel}>
                Yes, Cancel
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setShowCancelModal(false)}
              >
                No, Keep
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
