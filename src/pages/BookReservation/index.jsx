import { useEffect, useState } from "react";
import { therapistService } from "../../services/api";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";

export default function BookReservation() {
  const { therapistId } = useParams();
  const [availability, setAvailability] = useState([]);
  const [notAvailable, setNotAvailable] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    const fetchTherapistReservation = async () => {
      try {
        const response = await therapistService.getAvailability(therapistId);
        const { timeAvailable, notTimeAvailable } = response.data;

        setAvailability(timeAvailable);
        setNotAvailable(notTimeAvailable);
      } catch (error) {
        console.error("Error fetching therapist reservation:", error);
      }
    };
    fetchTherapistReservation();
  }, [therapistId]);

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Book a Reservation
      </h1>

      <h2 className="text-lg font-semibold text-gray-700">Available Slots</h2>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {availability.length > 0 ? (
          availability.map((slot) => (
            <button
              key={slot._id}
              onClick={() => handleSelectSlot(slot)}
              className={`p-3 border rounded-lg ${
                selectedSlot?._id === slot._id
                  ? "bg-green-400 text-gray-800"
                  : "bg-green-100 text-gray-700 hover:bg-green-200"
              } transition-all`}
            >
              {dayjs(slot.startHour).format("HH:mm")} -{" "}
              {dayjs(slot.endHour).format("HH:mm")}
            </button>
          ))
        ) : (
          <p className="text-gray-500">No available slots</p>
        )}
      </div>


      <button
        className={`mt-6 w-full py-3 rounded-lg ${
          selectedSlot
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        } transition-all`}
        disabled={!selectedSlot}
      >
        Book Reservation
      </button>
    </div>
  );
}
