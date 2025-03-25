import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { therapistService } from "../../services/therapist/therapistService";
import { userService } from "../../services/user/userService";
import {
  CalendarIcon,
  LocationMarkerIcon,
  AcademicCapIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
  DocumentTextIcon,
} from "@heroicons/react/outline";
import { StarIcon } from "@heroicons/react/solid";
import { format } from "date-fns";
import { ratingService } from "@/services/rating/ratingService";

export default function TherapistDetail() {
  const { therapistId } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const [availabilities, setAvailabilities] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch therapist data
        const therapistResponse = await therapistService.getTherapistById(
          therapistId
        );
        setTherapist(therapistResponse.data);
        // Get reviews
        const reviewsResponse = await ratingService.getRatingByTherapistId(
          therapistId
        );
        setReviews(reviewsResponse.data);

        // Fetch user data using userID from therapist data
        const userResponse = await userService.getUserById(
          therapistResponse.data.userID
        );
        setUser(userResponse.data.user);

        // Fetch availability
        try {
          const availabilityResponse = await therapistService.getAvailability(
            therapistId
          );
          if (
            availabilityResponse.data &&
            availabilityResponse.data.availability
          ) {
            setAvailabilities(availabilityResponse.data.availability);
          } else {
            setAvailabilities([]);
          }
        } catch (availabilityError) {
          setAvailabilities([]);
        }
      } catch (err) {
        setError("Failed to load therapist details. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [therapistId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-24 h-24 rounded-full border-4 border-t-blue-500 border-b-blue-700 border-l-blue-300 border-r-blue-300 animate-spin"></div>
        <p className="text-blue-700 font-medium mt-4">Loading profile...</p>
      </div>
    );
  }

  if (error || !therapist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <XCircleIcon className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-800">
            {error || "Therapist not found"}
          </h1>
          <p className="text-gray-600 mb-8">
            We couldn't find the therapist you're looking for. Please try again
            later.
          </p>
          <Link to="/find-therapist" className="btn btn-primary w-full">
            Find Other Therapists
          </Link>
        </div>
      </div>
    );
  }

  // Extract data
  const verifiedCertificates = therapist.certificates.filter(
    (cert) => cert.status === "approved"
  );

  const displayCertificates = showAllCertificates
    ? verifiedCertificates
    : verifiedCertificates.slice(0, 2);

  // Calculate age from DOB
  const dob = new Date(user.dob);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();

  // Helper function to get available time slots
  const getValidTimeSlots = () => {
    if (!availabilities || availabilities.length === 0) {
      return [];
    }

    const validSlots = [];
    availabilities.forEach((availability) => {
      if (
        !availability.timeAvailable ||
        availability.timeAvailable.length === 0
      ) {
        return;
      }

      availability.timeAvailable.forEach((slot) => {
        if (!slot.isOccupied) {
          validSlots.push({
            _id: slot._id,
            startHour: slot.startHour,
            endHour: slot.endHour,
            date: new Date(slot.startHour).toISOString().split("T")[0],
            availabilityId: availability._id,
          });
        }
      });
    });

    return validSlots.sort(
      (a, b) => new Date(a.startHour) - new Date(b.startHour)
    );
  };

  const renderAvailabilitySection = () => {
    const validSlots = getValidTimeSlots();

    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <CalendarIcon className="h-6 w-6 text-blue-500 mr-2" />
          Availability Schedule
        </h2>

        {validSlots.length > 0 ? (
          <div className="space-y-6">
            {/* Group slots by date */}
            {Object.entries(
              validSlots.reduce((acc, slot) => {
                const date = format(new Date(slot.startHour), "yyyy-MM-dd");
                if (!acc[date]) acc[date] = [];
                acc[date].push(slot);
                return acc;
              }, {})
            ).map(([date, slots]) => (
              <div key={date} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
                  {format(new Date(date), "EEEE, MMMM dd, yyyy")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slots.map((slot) => (
                    <div
                      key={slot._id}
                      className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 hover:shadow-md group"
                    >
                      <div className="flex items-center text-gray-800">
                        <div className="p-2 bg-blue-100 rounded-full text-blue-600 mr-3 group-hover:bg-blue-200 transition-colors">
                          <ClockIcon className="h-5 w-5" />
                        </div>
                        <span>
                          {format(new Date(slot.startHour), "h:mm a")} -{" "}
                          {format(new Date(slot.endHour), "h:mm a")}
                        </span>
                      </div>
                      <div className="mt-4 text-right">
                        <Link
                          to={`/bookReservation/${therapist._id}?date=${format(
                            new Date(slot.startHour),
                            "yyyy-MM-dd"
                          )}&start=${format(
                            new Date(slot.startHour),
                            "HH:mm"
                          )}&end=${format(new Date(slot.endHour), "HH:mm")}`}
                          className="btn btn-primary btn-sm"
                        >
                          Book this slot
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-blue-50 border rounded-xl p-6 text-gray-800 flex">
            <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-gray-800">
                No availability schedule set
              </h3>
              <p className="mt-1 text-gray-600">
                This therapist hasn't set up their availability calendar yet.
                Please check back later or contact the therapist directly to
                discuss scheduling options.
              </p>
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            Don't see a time that works for you?
          </h3>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Contact {user.fullname} directly to discuss alternate scheduling
            options or request a custom appointment time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="btn btn-primary"
              onClick={() => setActiveTab("about")}
            >
              <UserIcon className="h-5 w-5 mr-2" />
              View Therapist Profile
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Top section with profile info */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          {/* Cover area with gradient */}
          <div className="relative h-80">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
              <div className="absolute inset-0 opacity-20">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0,0 L100,0 L100,100 L0,100 Z"
                    fill="url(#pattern)"
                  />
                </svg>
                <defs>
                  <pattern
                    id="pattern"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="20" cy="20" r="1" fill="white" />
                  </pattern>
                </defs>
              </div>
            </div>

            {/* Profile content */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
              <div className="flex flex-col md:flex-row items-start md:items-end space-y-6 md:space-y-0">
                {/* Profile image */}
                <div className="relative">
                  <div className="w-36 h-36 rounded-2xl border-4 border-white shadow-lg overflow-hidden">
                    <img
                      src={user.photoURL}
                      alt={user.fullname}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {verifiedCertificates.length > 0 && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 border-2 border-white shadow">
                      <ShieldCheckIcon className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>

                {/* Name and details */}
                <div className="md:ml-6 flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {user.fullname}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
                      {therapist.category} Therapist
                    </span>
                    {verifiedCertificates.length > 0 && (
                      <span className="bg-green-500/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium flex items-center">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Verified Professional
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA button for larger screens */}
                <div className="hidden md:block">
                  <Link
                    to={`/bookReservation/${therapist._id}`}
                    className="btn btn-primary btn-lg gap-2 shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                  >
                    <CalendarIcon className="h-5 w-5" />
                    Book Session
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and tabs section */}
          <div className="px-8 py-6">
            {/* Stats row */}
            <div className="flex flex-wrap items-center justify-between mb-6">
              <div className="flex flex-wrap gap-6">
                {/* Rating stat */}
                <div className="flex items-center bg-yellow-50 px-4 py-2 rounded-xl">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(therapist.averageRating || 0)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 font-semibold text-gray-800">
                    {therapist.rating || "New"}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">
                    ({therapist?.ratingCount} reviews)
                  </span>
                </div>

                {/* Age stat */}
                <div className="flex items-center bg-blue-50 px-4 py-2 rounded-xl">
                  <UserIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-800">{age} years</span>
                </div>

                {/* Certificates stat */}
                <div className="flex items-center bg-green-50 px-4 py-2 rounded-xl">
                  <AcademicCapIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-800">
                    {verifiedCertificates.length} verified certificates
                  </span>
                </div>

                {/* Location stat */}
                <div className="flex items-center bg-purple-50 px-4 py-2 rounded-xl">
                  <LocationMarkerIcon className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-gray-800">{user.address}</span>
                </div>
              </div>

              {/* Mobile CTA button */}
              <div className="w-full md:hidden mt-4">
                <Link
                  to={`/book/${therapist._id}`}
                  className="btn btn-primary w-full gap-2"
                >
                  <CalendarIcon className="h-5 w-5" />
                  Book Session
                </Link>
              </div>
            </div>

            {/* Navigation tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("about")}
                  className={`${
                    activeTab === "about"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium flex items-center transition-colors duration-200`}
                >
                  <UserIcon
                    className={`h-5 w-5 mr-2 ${
                      activeTab === "about" ? "text-blue-500" : "text-gray-400"
                    }`}
                  />
                  About
                </button>
                <button
                  onClick={() => setActiveTab("certificates")}
                  className={`${
                    activeTab === "certificates"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium flex items-center transition-colors duration-200`}
                >
                  <DocumentTextIcon
                    className={`h-5 w-5 mr-2 ${
                      activeTab === "certificates"
                        ? "text-blue-500"
                        : "text-gray-400"
                    }`}
                  />
                  Certifications
                </button>
                <button
                  onClick={() => setActiveTab("availability")}
                  className={`${
                    activeTab === "availability"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium flex items-center transition-colors duration-200`}
                >
                  <CalendarIcon
                    className={`h-5 w-5 mr-2 ${
                      activeTab === "availability"
                        ? "text-blue-500"
                        : "text-gray-400"
                    }`}
                  />
                  Availability
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Content based on tab */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          {activeTab === "about" && (
            <div className="space-y-8">
              {/* About section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <UserIcon className="h-6 w-6 text-blue-500 mr-2" />
                  About Me
                </h2>
                {therapist.description ? (
                  <div className="prose max-w-none text-gray-700">
                    <p className="text-lg leading-relaxed">
                      {therapist.description}
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-5 rounded-r-lg">
                    <p className="text-blue-700">
                      This therapist hasn't provided a description yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Personal information */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                  <BriefcaseIcon className="h-6 w-6 text-blue-500 mr-2" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-xl hover:shadow-md transition-shadow duration-300">
                    <div className="text-sm font-medium text-blue-500 uppercase tracking-wider mb-1">
                      Full Name
                    </div>
                    <div className="text-lg font-medium text-gray-800">
                      {user.fullname}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-xl hover:shadow-md transition-shadow duration-300">
                    <div className="text-sm font-medium text-blue-500 uppercase tracking-wider mb-1">
                      Gender
                    </div>
                    <div className="text-lg font-medium text-gray-800 capitalize">
                      {user.gender}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-xl hover:shadow-md transition-shadow duration-300">
                    <div className="text-sm font-medium text-blue-500 uppercase tracking-wider mb-1">
                      Date of Birth
                    </div>
                    <div className="text-lg font-medium text-gray-800">
                      {format(new Date(user.dob), "MMMM dd, yyyy")}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-xl hover:shadow-md transition-shadow duration-300">
                    <div className="text-sm font-medium text-blue-500 uppercase tracking-wider mb-1">
                      Location
                    </div>
                    <div className="text-lg font-medium text-gray-800">
                      {user.address}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-xl hover:shadow-md transition-shadow duration-300">
                    <div className="text-sm font-medium text-blue-500 uppercase tracking-wider mb-1">
                      Specialty
                    </div>
                    <div className="text-lg font-medium text-gray-800">
                      {therapist.category}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-xl hover:shadow-md transition-shadow duration-300">
                    <div className="text-sm font-medium text-blue-500 uppercase tracking-wider mb-1">
                      Experience
                    </div>
                    <div className="text-lg font-medium text-gray-800">
                      {verifiedCertificates.length > 0
                        ? `${verifiedCertificates.length} certified specialties`
                        : "New therapist"}
                    </div>
                  </div>
                </div>
                {reviews.length > 0 && (
                  <div className="bg-gray-50 p-5 rounded-xl hover:shadow-md transition-shadow duration-300">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <div className="text-sm font-medium text-blue-500 uppercase tracking-wider mb-1">
                          Reviews
                        </div>
                        <div className="text-lg font-medium text-gray-800">
                          {reviews.length}{" "}
                          {reviews.length === 1 ? "review" : "reviews"}
                        </div>
                      </div>
                      {reviews.length > 2 && (
                        <button
                          onClick={() => setShowAllReviews(!showAllReviews)}
                          className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center"
                        >
                          {showAllReviews ? "Show Less" : "View All"}
                          <ChevronDownIcon
                            className={`h-4 w-4 ml-1 transform transition-transform ${
                              showAllReviews ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4 mt-4">
                      {(showAllReviews ? reviews : reviews.slice(0, 2)).map(
                        (review) => (
                          <div
                            key={review._id}
                            className="bg-white p-4 rounded-lg shadow-sm"
                          >
                            <div className="flex items-center mb-3">
                              <img
                                src={review.userID.photoURL}
                                alt={review.userID.fullname}
                                className="w-10 h-10 rounded-full object-cover mr-3"
                              />
                              <div>
                                <div className="font-medium text-gray-800">
                                  {review.userID.fullname}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {format(
                                    new Date(review.createdAt),
                                    "MMM dd, yyyy"
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex mb-2">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`h-5 w-5 ${
                                    i < review.rate
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>

                            <p className="text-gray-700">{review.content}</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact CTA */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-between items-center bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                <div>
                  <h3 className="text-xl font-bold">
                    Ready to start your session?
                  </h3>
                  <p className="mt-1 text-blue-100">
                    Schedule an appointment with {user.fullname}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    to={`/bookReservation/${therapist._id}`}
                    className="btn bg-white text-blue-600 hover:bg-blue-50"
                  >
                    <CalendarIcon className="h-5 w-5 mr-1" />
                    Book Session
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === "certificates" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <DocumentTextIcon className="h-6 w-6 text-blue-500 mr-2" />
                Professional Certifications
              </h2>

              {verifiedCertificates.length > 0 ? (
                <>
                  <div className="space-y-6">
                    {displayCertificates.map((certificate) => (
                      <div
                        key={certificate._id}
                        className="border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/3 bg-gray-50 p-4 flex items-center justify-center">
                            <div className="relative rounded-lg overflow-hidden shadow-md w-full h-48">
                              <img
                                src={certificate.documentURL}
                                alt={certificate.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute top-2 right-2">
                                <span className="flex items-center text-white bg-green-500 px-3 py-1 rounded-full text-sm shadow-md">
                                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                                  Verified
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="md:w-2/3 p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                              {certificate.title}
                            </h3>

                            <div className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
                              {certificate.category}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 text-gray-800">
                              <div>
                                <span className="block text-sm font-medium text-gray-500 mb-1">
                                  Issued Date
                                </span>
                                <div className="flex items-center">
                                  <CalendarIcon className="h-5 w-5 text-blue-500 mr-1" />
                                  {format(
                                    new Date(certificate.issuedDate),
                                    "MMM dd, yyyy"
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="block text-sm font-medium text-gray-500 mb-1">
                                  Expiry Date
                                </span>
                                <div className="flex items-center">
                                  <CalendarIcon className="h-5 w-5 text-blue-500 mr-1" />
                                  {format(
                                    new Date(certificate.expiryDate),
                                    "MMM dd, yyyy"
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {verifiedCertificates.length > 2 && (
                    <button
                      onClick={() =>
                        setShowAllCertificates(!showAllCertificates)
                      }
                      className="mt-8 mx-auto flex items-center justify-center px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm hover:shadow"
                    >
                      {showAllCertificates
                        ? "Show Less"
                        : `Show All Certificates (${verifiedCertificates.length})`}
                      <ChevronDownIcon
                        className={`h-5 w-5 ml-2 transform transition-transform ${
                          showAllCertificates ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </>
              ) : (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-r-lg">
                  <p className="text-yellow-800">
                    This therapist has no verified certificates yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "availability" && renderAvailabilitySection()}
        </div>
      </div>
    </div>
  );
}
