import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { therapistService, userService } from "../../services/api";

export default function TherapistDetail() {
  const { therapistId } = useParams();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [therapistInfor, setTherapistInfor] = useState(null);

  useEffect(() => {
    const fetchTherapistDetail = async () => {
      try {
        const response = await therapistService.getTherapistById(therapistId);
        const info = await userService.getUserById(response.data.userID);
        setTherapistInfor(info.data.user);
        setTherapist(response.data);
      } catch (err) {
        setError("Failed to fetch therapist details");
      } finally {
        setLoading(false);
      }
    };
    fetchTherapistDetail();
  }, [therapistId]);

  if (loading)
    return <div className="text-center text-lg text-gray-600">Loading...</div>;
  if (error)
    return (
      <div className="text-center text-red-500 font-semibold">{error}</div>
    );

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-10">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6">
        Therapist Details
      </h1>

      <div className="space-y-2">
        <p className="text-lg text-gray-700">
          <span className="font-semibold">Fullname:</span>{" "}
          {therapistInfor?.fullname}
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-semibold">Email:</span> {therapistInfor?.email}
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-semibold">Gender:</span>{" "}
          {therapistInfor?.gender}
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-semibold">Rating:</span> {therapist?.rating} ⭐
          ({therapist?.reviewCount} reviews)
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed">
          {therapist?.description}
        </p>
      </div>

      {/* Certificates Section */}
      <h2 className="mt-8 text-2xl font-bold text-gray-800">Certificates</h2>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {therapist?.certificates?.length > 0 ? (
          therapist.certificates.map((cert) => (
            <div
              key={cert._id}
              className="flex items-center p-4 border border-gray-300 rounded-xl bg-gray-50 shadow-md"
            >
              <img
                src={cert.documentURL}
                alt={cert.title}
                className="w-24 h-24 object-cover rounded-lg border border-gray-400"
              />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  {cert.title}
                </h3>
                <p className="text-sm text-gray-500">
                  Category: {cert.category}
                </p>
                <p
                  className={`text-sm font-semibold mt-1 ${
                    cert.status === "approved"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {cert.status.toUpperCase()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-lg">No certificates available</p>
        )}
      </div>

      <button
        onClick={() => navigate(`/bookReservation/${therapistId}`)}
        className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all text-lg font-semibold shadow-md"
      >
        Book Reservation
      </button>
    </div>
  );
}
