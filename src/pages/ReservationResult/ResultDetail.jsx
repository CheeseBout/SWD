import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { reservationResultService } from "../../services/reservation/reservationResultService";
import { AuthContext } from "../../contexts/AuthContextObject";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { therapistService, userService } from "../../services/api";
import { ratingService } from "../../services/rating/ratingService";

export default function ResultDetail() {
  const { reservationId, therapistId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useContext(AuthContext);
  const userID =
    authUser?.userId || authUser?._id || authUser?.id || authUser?.sub;

  const [result, setResult] = useState(null);
  const [therapist, setTherapist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [resultResponse, therapistResponse] = await Promise.all([
          reservationResultService.getResultByReservationId(reservationId),
          therapistService.getTherapistById(therapistId),
        ]);

        setResult(resultResponse.data);

        // Get additional user data using the userID from therapist response
        const userID = therapistResponse.data.userID._id;
        const userResponse = await userService.getUserById(userID);

        // Combine therapist and user data
        setTherapist({
          ...therapistResponse.data,
          fullName: userResponse.data.user.fullname,
          email: userResponse.data.user.email,
          photoURL: userResponse.data.user.photoURL,
          // Add any other user fields you need
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Could not load your session results");
        // navigate("/profile/your-reservations");
      } finally {
        setIsLoading(false);
      }
    };

    if (reservationId && therapistId) {
      fetchData();
    }
  }, [reservationId, therapistId, navigate]);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.warning("Please provide a comment with your rating");
      return;
    }

    setIsSubmitting(true);

    try {
      const ratingData = {
        userID,
        coupleTherapistID: therapistId,
        rate: rating,
        content,
        reservationID: reservationId,
      };

      await ratingService.createRating(ratingData);
      toast.success("Thank you for your rating!");
      setContent("");
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit your rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!result || !therapist) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center p-8 max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-400 mb-4 mx-auto"
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
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Results Not Available
          </h3>
          <p className="text-gray-600">
            We couldn't find the session results or therapist information you're
            looking for.
          </p>
          <button
            onClick={() => navigate("/profile/your-reservations")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Reservations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-2 bg-blue-100 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Session Results
          </h1>
          <p className="text-gray-600">
            Completed on {dayjs(result.updatedAt).format("MMMM D, YYYY")}
          </p>
        </div>

        {/* Therapist Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="mb-4 md:mb-0 md:mr-6">
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                {therapist.photoURL ? (
                  <img
                    src={therapist.photoURL}
                    alt={therapist.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {therapist.fullName}
              </h2>
              <p className="text-indigo-600 mb-2">Couple Therapist</p>
              <div className="flex items-center mb-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 ${
                        i < Math.round(therapist.averageRating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-1 text-sm text-gray-600">
                  ({therapist.averageRating.toFixed(1)})
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 inline mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {therapist.email}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Session Summary */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-2 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Session Summary
              </h2>
            </div>
            <div className="pl-16">
              <p className="text-gray-700 leading-relaxed">
                {result.sessionSummary}
              </p>
            </div>
          </div>

          {/* Issues Identified */}
          <div className="p-8 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-600"
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
              <h2 className="text-xl font-semibold text-gray-800">
                Issues Identified
              </h2>
            </div>
            <div className="pl-16">
              <ul className="space-y-3">
                {result.issuesIdentified.map((issue, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 h-5 w-5 rounded-full bg-red-200 flex items-center justify-center mt-1 mr-3">
                      <span className="text-xs font-medium text-red-600">
                        {index + 1}
                      </span>
                    </span>
                    <p className="text-gray-700">{issue}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Therapist Recommendations */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Therapist Recommendations
              </h2>
            </div>
            <div className="pl-16">
              <p className="text-gray-700 leading-relaxed">
                {result.therapistRecommendations}
              </p>
            </div>
          </div>

          {/* Homework Assignment */}
          <div className="p-8">
            <div className="flex items-center mb-4">
              <div className="bg-amber-100 p-2 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Homework Assignment
              </h2>
            </div>
            <div className="pl-16">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <p className="text-gray-700 leading-relaxed">
                  {result.homeworkAssignment}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Your Therapist */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Rate Your Therapist
            </h2>
            <form onSubmit={handleRatingSubmit}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5)
                </label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none mr-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-8 w-8 ${
                          star <= rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-2 text-gray-700">{rating}/5</span>
                </div>
              </div>

              <div className="mb-5">
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Review
                </label>
                <textarea
                  id="content"
                  rows="4"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Share your experience with this therapist..."
                ></textarea>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Rating"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Back button */}
        <div className="mt-10 text-center">
          <button
            onClick={() => navigate("/profile/your-reservations")}
            className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
          >
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Reservations
          </button>
        </div>
      </div>
    </div>
  );
}
