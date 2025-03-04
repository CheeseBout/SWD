import PropTypes from "prop-types";

const ProfileInfoCard = ({ user, formatDate }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
        Basic Information
      </h2>
      <div className="space-y-4">
        <div className="flex items-center text-gray-700">
          <svg
            className="h-5 w-5 text-blue-500 mr-3"
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
          <span className="font-medium w-36">Full Name:</span>
          <span>{user?.fullname || "Not provided"}</span>
        </div>

        <div className="flex items-center text-gray-700">
          <svg
            className="h-5 w-5 text-blue-500 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
            />
          </svg>
          <span className="font-medium w-36">Username:</span>
          <span>{user?.username || "Not provided"}</span>
        </div>

        <div className="flex items-center text-gray-700">
          <svg
            className="h-5 w-5 text-blue-500 mr-3"
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
          <span className="font-medium w-36">Email:</span>
          <span>{user?.email || "Not provided"}</span>
        </div>

        <div className="flex items-center text-gray-700">
          <svg
            className="h-5 w-5 text-blue-500 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="font-medium w-36">Date of Birth:</span>
          <span>
            {user?.dob ? formatDate(user.dob) : "Not provided"}
          </span>
        </div>

        <div className="flex items-center text-gray-700">
          <svg
            className="h-5 w-5 text-blue-500 mr-3"
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
          <span className="font-medium w-36">Gender:</span>
          <span>{user?.gender || "Not provided"}</span>
        </div>
      </div>
    </div>
  );
};

ProfileInfoCard.propTypes = {
  user: PropTypes.shape({
    fullname: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    dob: PropTypes.string,
    gender: PropTypes.string
  }),
  formatDate: PropTypes.func.isRequired
};

export default ProfileInfoCard;
