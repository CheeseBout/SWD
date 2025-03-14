import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../../contexts/AuthContextObject";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast } from "react-toastify";
import TherapistSidebar from "../../../components/SideBar/TherapistSidebar";
import dayjs from "dayjs";
import "./styles.css";
import { availabilityService } from "../../../services/availability/availabilityService";

export default function TherapistAvailability() {
  const { user } = useContext(AuthContext);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState({
    startTime: "09:00",
    endTime: "10:00",
  });
  const calendarRef = useRef(null);
  const therapistId = localStorage.getItem("therapistId");

  // Fetch existing availability slots
  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching availability for therapist ID:", therapistId);
      const response = await availabilityService.getTherapistAvailability();
      console.log("Response from API:", response);

      // Process the data according to the new data structure
      let formattedSlots = [];

      if (
        response?.data?.data?.availability &&
        Array.isArray(response.data.data.availability)
      ) {
        console.log(
          "Found availability data:",
          response.data.data.availability.length,
          "items in the availability array with nested timeAvailable arrays"
        );

        formattedSlots = response.data.data.availability.flatMap((item) => {
          // Flatten the availability array with nested timeAvailable arrays
          return item.timeAvailable.map((timeSlot) => ({
            id: item._id + "_" + timeSlot._id, // Create unique ID
            title: timeSlot.isOccupied ? "Booked" : "Available",
            start: new Date(timeSlot.startHour),
            end: new Date(timeSlot.endHour),
            backgroundColor: timeSlot.isOccupied
              ? "rgba(239, 68, 68, 0.2)" // Light red for booked slots
              : "rgba(52, 211, 153, 0.2)", // Light green for available slots
            borderColor: timeSlot.isOccupied ? "#ef4444" : "#10b981",
            textColor: timeSlot.isOccupied ? "#b91c1c" : "#065f46",
            borderWidth: 1,
            classNames: ["availability-slot"],
            extendedProps: {
              availabilityId: item._id,
              timeSlotId: timeSlot._id,
              isOccupied: timeSlot.isOccupied,
            },
          }));
        });
        console.log("Formatted events for calendar:", formattedSlots.length);
      } else {
        console.warn("No availability data found or incorrect format");
      }

      setAvailabilitySlots(formattedSlots);
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error("Failed to load availability schedule");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle date click to create new availability slot
  const handleDateClick = (info) => {
    // Set the selected date and open add modal
    setSelectedDate(info.date);
    setSelectedTime({
      startTime: dayjs(info.date).format("HH:mm"),
      endTime: dayjs(info.date).add(1, "hour").format("HH:mm"),
    });
    setShowAddModal(true);
  };

  // Handle event click to open action menu for an availability slot
  const handleEventClick = (info) => {
    // Don't allow updates or deletion of occupied slots
    if (info.event.extendedProps.isOccupied) {
      toast.warning("Cannot modify booked availability slots");
      return;
    }

    setSelectedEvent({
      id: info.event.id,
      availabilityId: info.event.extendedProps.availabilityId,
      timeSlotId: info.event.extendedProps.timeSlotId,
      start: info.event.start,
      end: info.event.end,
    });

    // Set selected date and time for potential update
    setSelectedDate(info.event.start);
    setSelectedTime({
      startTime: dayjs(info.event.start).format("HH:mm"),
      endTime: dayjs(info.event.end).format("HH:mm"),
    });

    // Open action menu modal
    setShowActionMenu(true);
  };

  // Handle updating an availability slot
  const handleUpdateAvailability = async () => {
    if (!selectedEvent) return;

    setIsSubmitting(true);

    const startDateTime = dayjs(selectedDate)
      .hour(parseInt(selectedTime.startTime.split(":")[0]))
      .minute(parseInt(selectedTime.startTime.split(":")[1]))
      .toISOString();

    const endDateTime = dayjs(selectedDate)
      .hour(parseInt(selectedTime.endTime.split(":")[0]))
      .minute(parseInt(selectedTime.endTime.split(":")[1]))
      .toISOString();

    try {
      const response = await availabilityService.updateAvailability(
        selectedEvent.availabilityId,
        {
          timeAvailable: [
            {
              _id: selectedEvent.timeSlotId,
              startHour: startDateTime,
              endHour: endDateTime,
              isOccupied: false,
            },
          ],
        }
      );

      setShowUpdateModal(false);
      toast.success("Availability updated successfully");

      // Refresh the calendar data
      fetchAvailability();
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update availability");
    } finally {
      setIsSubmitting(false);
    }
  };

  // State for action menu
  const [showActionMenu, setShowActionMenu] = useState(false);

  // Handler for "Update" button
  const handleOpenUpdateModal = () => {
    setShowActionMenu(false);
    setShowUpdateModal(true);
  };

  // Handler for "Delete" button
  const handleOpenDeleteModal = () => {
    setShowActionMenu(false);
    setShowDeleteModal(true);
  };

  // Delete availability slot
  const handleDeleteAvailability = async () => {
    if (!selectedEvent) return;

    setIsSubmitting(true);
    try {
      await availabilityService.deleteAvailability(
        selectedEvent.availabilityId
      );

      // Remove the event from the calendar
      setAvailabilitySlots(
        availabilitySlots.filter(
          (slot) => !slot.id.startsWith(selectedEvent.availabilityId)
        )
      );

      setShowDeleteModal(false);
      toast.success("Availability slot deleted successfully");

      // Refresh the calendar data to ensure consistency
      fetchAvailability();
    } catch (error) {
      console.error("Error deleting availability:", error);
      toast.error("Failed to delete availability slot");
    } finally {
      setIsSubmitting(false);
      setSelectedEvent(null);
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
                Manage Your Availability
              </h2>

              <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-emerald-700">Available</span>
                </div>

                <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-red-700">Booked</span>
                </div>

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
                  Add Availability
                </button>
              </div>
            </div>

            <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-100 flex items-start gap-3">
              <div className="flex-shrink-0 text-blue-500 mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-600">
                  <strong>Tip:</strong> Click on any date or time slot to add
                  availability. Click on an available slot to delete it.
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  All times are shown in your local timezone. Only clients who
                  can attend during these times will be able to book sessions
                  with you. Booked slots cannot be deleted.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="calendar-container h-[700px] bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                  }}
                  slotMinTime="07:00:00"
                  slotMaxTime="22:00:00"
                  expandRows={true}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  events={availabilitySlots}
                  dateClick={handleDateClick}
                  eventClick={handleEventClick}
                  height="100%"
                  allDaySlot={false}
                  slotDuration="00:30:00"
                  slotLabelFormat={{
                    hour: "numeric",
                    minute: "2-digit",
                    meridiem: "short",
                  }}
                  eventTimeFormat={{
                    hour: "numeric",
                    minute: "2-digit",
                    meridiem: "short",
                  }}
                  eventContent={(eventInfo) => (
                    <div className="flex items-center p-1 rounded-md">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          eventInfo.event.extendedProps.isOccupied
                            ? "bg-red-500"
                            : "bg-emerald-500"
                        }`}
                      ></div>
                      <div>
                        <div className="text-xs font-medium">
                          {eventInfo.timeText}
                        </div>
                        <div className="text-xs">{eventInfo.event.title}</div>
                      </div>
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Availability Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl transform transition-all">
            <div className="mb-4 pb-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Add Availability Slot
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Set your availability for{" "}
                  {selectedDate && dayjs(selectedDate).format("MMMM D, YYYY")}
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
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

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={
                    selectedDate ? dayjs(selectedDate).format("YYYY-MM-DD") : ""
                  }
                  onChange={(e) => {
                    const newDate = dayjs(e.target.value).toDate();
                    setSelectedDate(newDate);
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedTime.startTime}
                    onChange={(e) =>
                      setSelectedTime({
                        ...selectedTime,
                        startTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedTime.endTime}
                    onChange={(e) =>
                      setSelectedTime({
                        ...selectedTime,
                        endTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {selectedTime.startTime >= selectedTime.endTime && (
                <p className="text-sm text-red-500">
                  End time must be after start time
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150 ${
                  isSubmitting || selectedTime.startTime >= selectedTime.endTime
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={handleCreateAvailability}
                disabled={
                  isSubmitting || selectedTime.startTime >= selectedTime.endTime
                }
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
                    Saving...
                  </div>
                ) : (
                  "Save Availability"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Menu Modal when clicking on an available slot */}
      {showActionMenu && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl transform transition-all">
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Availability Options
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {dayjs(selectedEvent.start).format("MMMM D, YYYY")} from{" "}
                {dayjs(selectedEvent.start).format("h:mm A")} to{" "}
                {dayjs(selectedEvent.end).format("h:mm A")}
              </p>
            </div>

            <div className="space-y-3 py-2">
              <button
                onClick={handleOpenUpdateModal}
                className="w-full flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-3 px-4 rounded-md transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Update Time Slot
              </button>

              <button
                onClick={handleOpenDeleteModal}
                className="w-full flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-800 font-medium py-3 px-4 rounded-md transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Delete Time Slot
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
              <button
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setShowActionMenu(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Availability Modal */}
      {showUpdateModal && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl transform transition-all">
            <div className="mb-4 pb-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Update Availability Slot
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Modify your availability for{" "}
                  {selectedDate && dayjs(selectedDate).format("MMMM D, YYYY")}
                </p>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
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

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={
                    selectedDate ? dayjs(selectedDate).format("YYYY-MM-DD") : ""
                  }
                  onChange={(e) => {
                    const newDate = dayjs(e.target.value).toDate();
                    setSelectedDate(newDate);
                  }}
                  disabled // Keep the same date, only allow time changes
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedTime.startTime}
                    onChange={(e) =>
                      setSelectedTime({
                        ...selectedTime,
                        startTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedTime.endTime}
                    onChange={(e) =>
                      setSelectedTime({
                        ...selectedTime,
                        endTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {selectedTime.startTime >= selectedTime.endTime && (
                <p className="text-sm text-red-500">
                  End time must be after start time
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                onClick={() => setShowUpdateModal(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150 ${
                  isSubmitting || selectedTime.startTime >= selectedTime.endTime
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={handleUpdateAvailability}
                disabled={
                  isSubmitting || selectedTime.startTime >= selectedTime.endTime
                }
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
                    Updating...
                  </div>
                ) : (
                  "Update Availability"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl transform transition-all">
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
              Delete Availability
            </h3>

            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete your availability on{" "}
              {dayjs(selectedEvent.start).format("MMMM D, YYYY")} from{" "}
              {dayjs(selectedEvent.start).format("h:mm A")} to{" "}
              {dayjs(selectedEvent.end).format("h:mm A")}?
            </p>

            <div className="flex justify-center space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-150 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleDeleteAvailability}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Availability"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
