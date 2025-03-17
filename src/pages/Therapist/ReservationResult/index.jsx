import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { reservationService } from "../../../services/reservation/reservationService";
import { toast } from "react-toastify";
import { reservationResultService } from "../../../services/reservation/reservationResultService";

export default function ReservationResult() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [reservationData, setReservationData] = useState(null);
  const [resultData, setResultData] = useState(null);

  // Updated state to match the API requirements
  const [sessionSummary, setSessionSummary] = useState("");
  const [issuesIdentified, setIssuesIdentified] = useState([""]);
  const [therapistRecommendations, setTherapistRecommendations] = useState("");
  const [homeworkAssignment, setHomeworkAssignment] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchReservationData();
  }, [reservationId]);

  const fetchReservationData = async () => {
    setIsLoading(true);
    try {
      // First get the reservation details
      const reservation = await reservationService.getReservationById(
        reservationId
      );
      setReservationData(reservation);

      // Try to get any existing result data
      try {
        const result = await reservationResultService.getResultByReservationId(
          reservationId
        );
        setResultData(result.data);

        // Set state with existing result data
        setSessionSummary(result.data.sessionSummary || "");
        setIssuesIdentified(
          result.data.issuesIdentified?.length
            ? result.data.issuesIdentified
            : [""]
        );
        setTherapistRecommendations(result.data.therapistRecommendations || "");
        setHomeworkAssignment(result.data.homeworkAssignment || "");
      } catch (error) {
        // No result exists yet, initialize with default values
        setSessionSummary("");
        setIssuesIdentified([""]);
        setTherapistRecommendations("");
        setHomeworkAssignment("");
      }
    } catch (error) {
      toast.error("Failed to load reservation data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIssue = () => {
    setIssuesIdentified([...issuesIdentified, ""]);
  };

  const handleIssueChange = (index, value) => {
    const updatedIssues = [...issuesIdentified];
    updatedIssues[index] = value;
    setIssuesIdentified(updatedIssues);
  };

  const handleRemoveIssue = (index) => {
    if (issuesIdentified.length <= 1) {
      toast.warning("At least one issue must be identified");
      return;
    }

    const updatedIssues = [...issuesIdentified];
    updatedIssues.splice(index, 1);
    setIssuesIdentified(updatedIssues);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!sessionSummary.trim()) {
      toast.error("Please provide a session summary");
      return;
    }

    if (issuesIdentified.some((issue) => !issue.trim())) {
      toast.error("Please fill out all identified issues or remove empty ones");
      return;
    }

    if (!therapistRecommendations.trim()) {
      toast.error("Please provide therapist recommendations");
      return;
    }

    if (!homeworkAssignment.trim()) {
      toast.error("Please provide homework assignment");
      return;
    }

    setIsSaving(true);
    try {
      // Clean up issues array - remove empty items
      const filteredIssues = issuesIdentified.filter((issue) => issue.trim());

      const payload = {
        reservationID: reservationId,
        sessionSummary,
        issuesIdentified: filteredIssues,
        therapistRecommendations,
        homeworkAssignment,
      };

      if (resultData) {
        // Update existing result
        await reservationResultService.updateReservationResult(resultData._id, {
          sessionSummary,
          issuesIdentified: filteredIssues,
          therapistRecommendations,
          homeworkAssignment,
        });
        toast.success("Session results updated successfully");
      } else {
        // Create new result
        await reservationResultService.createReservationResult(payload);
        toast.success("Session results saved successfully");
      }

      // Refresh data to get the updated result
      fetchReservationData();
    } catch (error) {
      toast.error("Failed to save session results");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Reservations
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Session Results</h1>
          {reservationData && (
            <p className="text-gray-600">
              {new Date(reservationData.startTime).toLocaleDateString()} ·
              {new Date(reservationData.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -
              {new Date(reservationData.endTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center`}
        >
          {isSaving ? (
            <>
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
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h1a2 2 0 012 2v7a2 2 0 01-2 2H8a2 2 0 01-2-2v-7a2 2 0 012-2h1v5.586l-1.293-1.293z" />
              </svg>
              Save Results
            </>
          )}
        </button>
      </div>

      {/* Client Information Card */}
      {reservationData && (
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            Client Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Name</p>
              <p className="font-medium">
                {reservationData?.userID?.fullname || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="font-medium">
                {reservationData?.userID?.email || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Session Notes - Updated to match new API requirements */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Session Summary
        </h2>
        <textarea
          value={sessionSummary}
          onChange={(e) => setSessionSummary(e.target.value)}
          placeholder="Provide a detailed summary of the therapy session..."
          rows="4"
          className="w-full p-3 border border-gray-300 rounded-md mb-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
        />
      </div>

      {/* Issues Identified */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Issues Identified
          </h2>
          <button
            onClick={handleAddIssue}
            className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Issue
          </button>
        </div>

        <div className="space-y-3">
          {issuesIdentified.map((issue, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={issue}
                onChange={(e) => handleIssueChange(index, e.target.value)}
                placeholder="E.g., Communication barriers"
                className="flex-grow p-2 border border-gray-300 rounded-md"
              />
              <button
                onClick={() => handleRemoveIssue(index)}
                className="p-2 text-red-500 hover:text-red-700"
                title="Remove issue"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Therapist Recommendations */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Therapist Recommendations
        </h2>
        <textarea
          value={therapistRecommendations}
          onChange={(e) => setTherapistRecommendations(e.target.value)}
          placeholder="Provide professional recommendations based on the session..."
          rows="4"
          className="w-full p-3 border border-gray-300 rounded-md mb-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
        />
      </div>

      {/* Homework Assignment */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Homework Assignment
        </h2>
        <textarea
          value={homeworkAssignment}
          onChange={(e) => setHomeworkAssignment(e.target.value)}
          placeholder="Describe exercises or activities for the client to complete before the next session..."
          rows="4"
          className="w-full p-3 border border-gray-300 rounded-md mb-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
        />
      </div>
    </div>
  );
}
