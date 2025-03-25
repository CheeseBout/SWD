import { Link } from "react-router-dom";
import { StarIcon } from "@heroicons/react/solid";
import { useEffect, useState } from "react";
import { therapistService } from "../../services/therapist/therapistService";

export function FeaturedTherapists() {
  const [therapists, setTherapists] = useState([]);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const response = await therapistService.getAllTherapists();
        console.log("Therapists response:", response);
        if (response?.data) {
          setTherapists(response.data);
        }
      } catch (error) {
        console.error("Error fetching therapists:", error);
      }
    };
    fetchTherapists();
  }, []);

  const getCategories = (therapist) => {
    if (Array.isArray(therapist.categoryInfo) && therapist.categoryInfo.length > 0) {
      return therapist.categoryInfo.map(cat => {
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
    <section className="py-16 bg-base-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Featured Therapists
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with our highly qualified and experienced therapists who are
            ready to support you on your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {therapists.map((therapist) => (
            <div
              key={therapist._id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300"
            >
              <figure className="px-4 pt-4">
                <img
                  src={
                    therapist.userInfo?.photoURL ||
                    "https://via.placeholder.com/150"
                  }
                  alt={therapist.userInfo?.fullname || "Therapist"}
                  className="rounded-xl w-full h-48 object-cover"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title text-xl font-semibold">
                  {therapist.userInfo?.fullname || "Unnamed Therapist"}
                </h3>

                <div className="badge badge-primary p-2 whitespace-normal text-left h-auto break-words max-w-full leading-relaxed">
                  {getCategories(therapist)}
                </div>

                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                    <span className="ml-1 font-semibold">
                      {therapist.averageRating || 0}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    ({therapist.ratingCount || 0} reviews)
                  </span>
                </div>

                <div className="mt-2">
                  <span className="text-sm font-medium text-green-600">
                    {therapist.availability && therapist.availability.length > 0
                      ? "Available"
                      : "Contact for availability"}
                  </span>
                </div>

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
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/find-therapist" className="btn btn-primary btn-lg">
            View All Therapists
          </Link>
        </div>
      </div>
    </section>
  );
}
