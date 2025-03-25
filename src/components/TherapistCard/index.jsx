/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

TherapistCard.defaultProps = {
  therapist: {
    _id: "",
    userInfo: {
      fullname: "Unknown",
      address: "Unknown",
    },
    description: "No description available.",
    categoryInfo: [],
    category: "Unknown",
    rating: 0,
    reviewCount: 0,
  },
};

export function TherapistCard({ therapist }) {
  const getCategories = () => {
    if (Array.isArray(therapist.categoryInfo) && therapist.categoryInfo.length > 0) {
      return therapist.categoryInfo.map(cat => {
        // Handle both string and object formats
        return typeof cat === 'string' ? cat : cat?.name || 'Unknown';
      }).join(", ");
    }
    // Fallback to legacy category field
    if (typeof therapist.category === 'object') {
      return therapist.category?.name || 'Unknown';
    }
    return therapist.category || "Unknown";
  };

  return (
    <div className="card bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-lg overflow-hidden">
      {/* Fake Avatar */}
      <figure className="bg-gray-100 p-4 flex justify-center">
        <img
          src={
            therapist.userInfo.photoURL ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              therapist.userInfo.fullname
            )}&background=random&color=fff&size=128`
          }
          alt={therapist.userInfo.fullname}
          className="rounded-full w-24 h-24 object-cover"
        />
      </figure>

      <div className="card-body p-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {therapist.userInfo.fullname}
        </h3>
        <p className="text-sm text-gray-600">{therapist.description}</p>

        <div className="badge badge-primary mt-2 p-2 whitespace-normal text-left h-auto leading-relaxed">
          {getCategories()}
        </div>

        {/* Rating */}
        <div className="flex items-center mt-3">
          <FaStar className="text-yellow-400" />
          <span className="ml-1 font-semibold">{therapist.averageRating}</span>
          <span className="text-sm text-gray-500 ml-2">
            ({therapist.ratingCount} reviews)
          </span>
        </div>

        {/* Address */}
        <p className="text-sm text-gray-500 mt-2">
          <strong>Location:</strong> {therapist.userInfo.address}
        </p>

        {/* Update the button Links to use the correct ID */}
        <div className="card-actions justify-end mt-4">
          <Link
            to={`/therapist/${therapist._id}`}
            className="btn btn-outline btn-primary"
          >
            View Profile
          </Link>
          <Link
            to={`/bookReservation/${therapist._id}`}
            className="btn btn-primary"
          >
            Book Session 
          </Link>
        </div>
      </div>
    </div>
  );
}