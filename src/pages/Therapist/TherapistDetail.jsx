import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { therapistService } from "../../services/api";

export default function TherapistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTherapistDetail = async () => {
      try {
        const response = await therapistService.getTherapistById(id);
        console.log(response);

        setTherapist(response.data);
      } catch (err) {
        setError("Failed to fetch therapist details");
      } finally {
        setLoading(false);
      }
    };
    fetchTherapistDetail();
  }, [id]);

  if (loading) return <div className="text-center text-lg">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-3xl font-bold text-gray-800">Therapist Details</h1>
      <p className="mt-2 text-gray-600">Category: {therapist.category}</p>
      <p className="mt-2 text-gray-600">
        Rating: {therapist.rating} ({therapist.reviewCount} reviews)
      </p>
      <p className="mt-4 text-gray-700">{therapist.description}</p>

      {/* Certificates Section */}
      <h2 className="mt-6 text-xl font-semibold text-gray-800">Certificates</h2>
      <div className="mt-4 space-y-4">
        {therapist?.certificates?.length > 0 ? (
          therapist.certificates.map((cert) => (
            <div
              key={cert._id}
              className="flex items-center p-4 border rounded-lg"
            >
              <img
                src={cert.documentURL}
                alt={cert.title}
                className="w-20 h-20 rounded-md"
              />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-700">
                  {cert.title}
                </h3>
                <p className="text-sm text-gray-500">
                  Category: {cert.category}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No certificates available</p>
        )}
      </div>

      {/* Create Reservation Button */}
      <button
        onClick={() => navigate(`/reservation/${id}`)}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all"
      >
        Create Reservation
      </button>
    </div>
  );
}
