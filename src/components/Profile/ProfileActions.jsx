import { useNavigate } from "react-router-dom";

const ProfileActions = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-6 flex justify-center space-x-4">
      <button
        onClick={() => navigate("/profile/edit")}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Edit Profile
      </button>
    </div>
  );
};

export default ProfileActions;
