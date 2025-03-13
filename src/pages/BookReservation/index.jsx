import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { therapistService } from "../../services/api";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { reservationService } from "../../services/reservation/reservationService";
import { AuthContext } from "../../contexts/AuthContextObject";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  title: yup.string().required("Vui lòng nhập tiêu đề."),
  content: yup.string().required("Vui lòng nhập nội dung."),
});
export default function BookReservation() {
  const { therapistId } = useParams();
  const [groupedSlots, setGroupedSlots] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [therapistInfo, setTherapistInfo] = useState(null);
  const { user: authUser } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const fetchTherapistReservation = async () => {
      try {
        const response = await therapistService.getAvailability(therapistId);
        const { availability, therapist } = response.data;

        setTherapistInfo(therapist?.userInfo);

        const groupedData = {};
        const addSlotToGroup = (slot, type) => {
          const dateKey = dayjs(slot.startHour).format("YYYY-MM-DD");
          if (!groupedData[dateKey]) {
            groupedData[dateKey] = { available: [], notAvailable: [] };
          }
          groupedData[dateKey][type].push(slot);
        };

        availability.forEach((day) => {
          day.timeAvailable.forEach((slot) => {
            if (slot.isOccupied) {
              addSlotToGroup(slot, "notAvailable");
            } else {
              addSlotToGroup(slot, "available");
            }
          });

          day.notTimeAvailable.forEach((slot) => {
            addSlotToGroup(slot, "notAvailable");
          });
        });

        setGroupedSlots(groupedData);
      } catch (error) {
        console.error("Error fetching therapist reservation:", error);
      }
    };

    fetchTherapistReservation();
  }, [therapistId]);

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
  };

  const handleOpenModal = () => {
    document.getElementById("booking-modal").showModal();
  };

  const handleCloseModal = () => {
    document.getElementById("booking-modal").close();
    reset();
  };

  const onSubmit = async (data) => {
    const payload = {
      title: data.title,
      content: data.content,
      startTime: selectedSlot.startHour,
      endTime: selectedSlot.endHour,
      coupleTherapistID: therapistId,
      userID:
        authUser?.userId || authUser?._id || authUser?.id || authUser?.sub,
    };

    try {
      await reservationService.createReservation(payload);
      toast.success("Đặt lịch thành công!", { position: "top-right" });
      handleCloseModal();
    } catch (error) {
      console.error("Error booking reservation:", error);
      toast.error("Đã có lỗi xảy ra, vui lòng thử lại!", {
        position: "top-right",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Book a Reservation
      </h1>

      {Object.keys(groupedSlots).length > 0 ? (
        Object.entries(groupedSlots).map(([date, slots]) => (
          <div key={date} className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              {dayjs(date).format("DD/MM/YYYY")}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {slots.available.map((slot) => (
                <button
                  key={slot._id}
                  onClick={() => handleSelectSlot(slot)}
                  className={`p-2 border rounded-lg text-sm ${
                    selectedSlot?._id === slot._id
                      ? "bg-green-400 text-white"
                      : "bg-green-100 text-gray-700 hover:bg-green-200"
                  } transition-all`}
                >
                  {dayjs(slot.startHour).format("HH:mm")} -{" "}
                  {dayjs(slot.endHour).format("HH:mm")}
                </button>
              ))}

              {slots.notAvailable.map((slot) => (
                <button
                  key={slot._id}
                  disabled
                  className="p-2 border rounded-lg text-sm bg-gray-300 text-gray-500 cursor-not-allowed"
                >
                  {dayjs(slot.startHour).format("HH:mm")} -{" "}
                  {dayjs(slot.endHour).format("HH:mm")}
                </button>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center">No available slots</p>
      )}

      <button
        onClick={handleOpenModal}
        className={`mt-6 w-full py-3 rounded-lg ${
          selectedSlot
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        } transition-all`}
        disabled={!selectedSlot}
      >
        Book Reservation
      </button>

      {/* Modal DaisyUI */}
      <dialog id="booking-modal" className="modal">
        <div className="modal-box">
          <h2 className="text-xl font-bold mb-4">Confirm Booking</h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <label className="block text-gray-700 text-sm mb-1">Title</label>
            <input
              type="text"
              {...register("title")}
              className="w-full p-2 border rounded mb-2"
              placeholder="Enter session title"
            />
            <p className="text-red-500 text-sm">{errors.title?.message}</p>

            <label className="block text-gray-700 text-sm mb-1">Content</label>
            <textarea
              {...register("content")}
              className="w-full p-2 border rounded mb-2"
              placeholder="Enter session content"
            />
            <p className="text-red-500 text-sm">{errors.content?.message}</p>

            <div className="text-gray-600 text-sm mb-3">
              <div>
                {" "}
                <strong>Therapist:</strong>{" "}
                {therapistInfo?.fullname || "Unknown"}
              </div>
              <div>
                <strong>Email:</strong> {therapistInfo?.email || "Unknown"}
              </div>
              <div>
                <strong>Time:</strong>{" "}
                {dayjs(selectedSlot?.startHour).format("HH:mm")} -{" "}
                {dayjs(selectedSlot?.endHour).format("HH:mm")}{" "}
              </div>
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary ml-3">
                Confirm
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}
