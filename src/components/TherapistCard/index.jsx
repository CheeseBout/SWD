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
    category: "Unknown",
    rating: 0,
    reviewCount: 0,
  },
};

export function TherapistCard({ therapist }) {
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

        <div className="badge badge-primary mt-2">{therapist.category}</div>

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

        {/* Buttons */}
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