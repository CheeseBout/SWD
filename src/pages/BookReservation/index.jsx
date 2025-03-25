import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContextObject";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { availabilityService } from "../../services/availability/availabilityService";
import { api } from "../../services/apiConfig";
import { userService } from "../../services/api";
import { reservationService } from "../../services/reservation/reservationService";
import { packageService } from "../../services/package/packageService";

const BookReservation = () => {
  const { therapistId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [therapist, setTherapist] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [packageOptions, setPackageOptions] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to book a reservation");
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [therapistResponse, packagesResponse, availabilityResponse] =
          await Promise.all([
            api.get(`/api/v1/coupletherapist/${therapistId}`),
            packageService.getTherapistPackages(therapistId),
            availabilityService.getAvailabilityByTherapistId(therapistId),
          ]);

        if (therapistResponse.data?.data) {
          await userService
            .getUserById(therapistResponse.data.data.userID._id)
            .then((response) => {
              setTherapist({
                ...therapistResponse.data.data,
                userInfo: response.data.user,
              });
            });
        }

        // Set package options using the new data structure
        if (packagesResponse?.data) {
          console.log("Setting packages:", packagesResponse.data);
          setPackageOptions(packagesResponse.data);
        }

        // Process availability slots
        if (availabilityResponse.data?.data?.availability) {
          const slots = processAvailabilitySlots(
            availabilityResponse.data.data.availability
          );
          setAvailableSlots(slots);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load therapist information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [therapistId, navigate, isAuthenticated]);

  // Process availability data into a flattened array of slots
  const processAvailabilitySlots = (availabilityData) => {
    if (!Array.isArray(availabilityData)) return [];

    // Filter out only non-occupied slots and flatten the structure
    const availableSlots = availabilityData
      .flatMap((item) => {
        return item.timeAvailable
          .filter((slot) => !slot.isOccupied)
          .map((slot) => ({
            id: item._id + "_" + slot._id,
            availabilityId: item._id,
            timeSlotId: slot._id,
            startTime: slot.startHour,
            endTime: slot.endHour,
            formattedDate: dayjs(slot.startHour).format("dddd, MMMM D, YYYY"),
            formattedTime: `${dayjs(slot.startHour).format("h:mm A")} - ${dayjs(
              slot.endHour
            ).format("h:mm A")}`,
          }));
      })
      // Sort by start time
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    console.log("Processed available slots:", availableSlots);
    return availableSlots;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot);
  };

  const handlePackageSelection = (packageItem) => {
    setSelectedPackage(packageItem);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }

    if (!selectedPackage) {
      toast.error("Please select a package to continue");
      return;
    }

    setIsSubmitting(true);
    try {
      const reservationData = {
        userID: user._id || user.userId || user.sub,
        coupleTherapistID: therapistId,
        title: formData.title,
        content: formData.content,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        totalPrice: selectedPackage.price,
        packageID: selectedPackage._id,
      };

      console.log("Submitting reservation data:", reservationData);

      const response = await reservationService.createReservation(
        reservationData
      );

      toast.success("Reservation request submitted successfully");
      navigate("/profile/your-reservations");
    } catch (error) {
      console.error("Error creating reservation:", error);
      toast.error(
        error.response?.data?.message || "Failed to create reservation"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group slots by date for better display
  const groupedSlots = availableSlots.reduce((acc, slot) => {
    const date = slot.formattedDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600">
            Therapist Not Found
          </h2>
          <p className="mt-2 text-gray-600">
            The therapist you are looking for could not be found.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => navigate("/find-a-therapist")}
          >
            Return to Therapist List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Therapist Info Section */}
          <div className="md:w-1/3 bg-blue-50 p-6">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                <img
                  src={
                    therapist.userInfo?.photoURL ||
                    "https://via.placeholder.com/150"
                  }
                  alt={therapist.userInfo?.fullname || "Therapist"}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                {therapist.userInfo?.fullname || "Therapist Name"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {therapist.specialization || "Couple Therapist"}
              </p>

              <div className="mt-6 w-full">
                <h3 className="text-md font-medium text-gray-700 mb-2">
                  About
                </h3>
                <p className="text-gray-600 text-sm">
                  {therapist.description || "No description available."}
                </p>
              </div>

              <div className="mt-6 w-full">
                <h3 className="text-md font-medium text-gray-700 mb-2">
                  Contact
                </h3>
                <p className="text-gray-600 text-sm">
                  {therapist.userInfo?.email || "Email not available"}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Form Section */}
          <div className="md:w-2/3 p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Book a Session
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Session Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What's the main topic you'd like to discuss"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please provide some details about what you'd like to discuss in the session"
                  required
                ></textarea>
              </div>

              {/* Packages Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Select a Package <span className="text-red-500">*</span>
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  You must select a package to proceed with the booking
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packageOptions.length > 0 ? (
                    packageOptions.map((packageItem) => (
                      <div
                        key={packageItem._id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPackage?._id === packageItem._id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => handlePackageSelection(packageItem)}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-800">
                            {packageItem.name}
                          </h4>
                          {packageItem.discount > 0 && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              {packageItem.discount}% OFF
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {packageItem.description}
                        </p>
                        <div className="mt-2">
                          <p className="text-blue-600 font-medium">
                            {packageItem.price?.toLocaleString()} VND
                          </p>
                          {packageItem.discount > 0 && (
                            <p className="text-xs text-gray-500">
                              Original:{" "}
                              {(
                                (packageItem.price * 100) /
                                (100 - packageItem.discount)
                              )
                                .toFixed(0)
                                .toLocaleString()}{" "}
                              VND
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="col-span-2 text-gray-500 italic">
                      No packages available
                    </p>
                  )}
                </div>
                {!selectedPackage && (
                  <p className="mt-2 text-sm text-red-600">
                    Please select a package to continue
                  </p>
                )}
              </div>

              {/* Time Slots */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Select a Time Slot <span className="text-red-500">*</span>
                </h3>

                {Object.keys(groupedSlots).length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-yellow-700">
                      No available time slots. Please check back later or
                      contact the therapist directly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedSlots).map(([date, slots]) => (
                      <div
                        key={date}
                        className="border border-gray-200 rounded-md overflow-hidden"
                      >
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <h4 className="font-medium text-gray-700">{date}</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-3">
                          {slots.map((slot) => (
                            <div
                              key={slot.id}
                              className={`px-3 py-2 text-center text-sm rounded-md cursor-pointer transition-colors ${
                                selectedSlot?.id === slot.id
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                              }`}
                              onClick={() => handleSlotSelection(slot)}
                            >
                              {dayjs(slot.startTime).format("h:mm A")}
                              {" - "}
                              {dayjs(slot.endTime).format("h:mm A")}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Booking Summary */}
              {selectedSlot && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2">
                    Booking Summary
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Date:</span>{" "}
                      {selectedSlot.formattedDate}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Time:</span>{" "}
                      {selectedSlot.formattedTime}
                    </p>
                    {selectedPackage && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Package:</span>{" "}
                        {selectedPackage.name} (
                        {selectedPackage.price?.toLocaleString()} VND)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedSlot || !selectedPackage}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                    isSubmitting || !selectedSlot || !selectedPackage
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
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
                    </span>
                  ) : (
                    "Book Session"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookReservation;
