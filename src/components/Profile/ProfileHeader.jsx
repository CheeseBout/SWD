import PropTypes from "prop-types";
import { useContext, useRef, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../services/apiConfig";
import { userService } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContextObject";

const ProfileHeader = ({ user, onUpdateUser }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [localPhotoURL, setLocalPhotoURL] = useState(user?.photoURL);
  const fileInputRef = useRef(null);
  const {
    user: authUser,
    isAuthenticated,
    isLoading: authLoading,
    updateUser,
    refreshUser,
  } = useContext(AuthContext);

  const getInitials = () => {
    if (user?.fullname) return user.fullname.charAt(0);
    if (user?.username) return user.username.charAt(0);
    return "U";
  };

  const handleAvatarClick = () => {
    fileInputRef?.current?.click();
  };

  const fetchUserData = async () => {
    try {
      const userId =
        authUser?.userId || authUser?._id || authUser?.id || authUser?.sub;
      if (!userId) {
        console.warn("No user ID found in auth data");
        return;
      }

      const response = await userService.getUserById(userId);
      if (response?.data?.user?.photoURL) {
        setLocalPhotoURL(response.data.user.photoURL);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to refresh user data");
    }
  };

  const handleUpload = async (file) => {
    if (!file) {
      toast.error("Please select an image to upload.");
      return;
    }

    const previousPhotoURL = localPhotoURL;

    try {
      const previewURL = URL.createObjectURL(file);
      setLocalPhotoURL(previewURL);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const formData = new FormData();
      formData.append("image", file);

      const response = await api.patch(
        "/api/v1/users/change-avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Avatar upload response:", response);

      let newPhotoURL = null;

      if (response.data?.user?.photoURL) {
        newPhotoURL = response.data.user.photoURL;
      } else if (response.data?.photoURL) {
        newPhotoURL = response.data.photoURL;
      } else if (response.data?.data?.photoURL) {
        newPhotoURL = response.data.data.photoURL;
      } else if (response.data?.user?.data?.photoURL) {
        newPhotoURL = response.data.user.data.photoURL;
      } else if (response.data?.url) {
        newPhotoURL = response.data.url;
      } else if (
        typeof response.data === "string" &&
        response.data.startsWith("http")
      ) {
        newPhotoURL = response.data;
      }

      if (!newPhotoURL && response.status >= 200 && response.status < 300) {
        toast.success("Avatar updated. Refresh to see changes.");

        if (refreshUser) {
          await refreshUser();
        }

        URL.revokeObjectURL(previewURL);
        return;
      }

      if (newPhotoURL) {
        setLocalPhotoURL(newPhotoURL);

        if (onUpdateUser) {
          onUpdateUser({ ...user, photoURL: newPhotoURL });
        }

        if (updateUser) {
          await updateUser({ ...authUser, photoURL: newPhotoURL });
        }

        if (refreshUser) {
          await refreshUser();
        }

        toast.success("Avatar updated successfully");
      } else {
        toast.info(
          "Avatar uploaded, but couldn't retrieve the image URL. Refresh to see changes."
        );

        if (refreshUser) {
          await refreshUser();
        }
      }

      URL.revokeObjectURL(previewURL);
    } catch (error) {
      console.error("Upload error:", error);

      setLocalPhotoURL(previousPhotoURL);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update avatar";

      toast.error(errorMessage);

      URL.revokeObjectURL(previewURL);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await handleUpload(file);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-12">
      <div className="flex flex-col items-center">
        {localPhotoURL ? (
          <div
            className="relative cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={handleAvatarClick}
          >
            <img
              src={localPhotoURL}
              alt={user?.fullname || user?.username || "User"}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div
              className={`absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent rounded-full transition-opacity duration-300 ease-in-out flex items-center justify-center ${
                isHovering ? "opacity-80" : "opacity-0"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="white"
                className={`size-10 transition-transform duration-300 ${
                  isHovering ? "scale-100" : "scale-75 opacity-0"
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                />
              </svg>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg"
              style={{ display: "none" }}
            />
          </div>
        ) : (
          <div
            className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-blue-600 text-4xl font-bold shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={handleAvatarClick}
          >
            {getInitials()}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg"
              style={{ display: "none" }}
            />
          </div>
        )}
        <h1 className="text-3xl font-bold text-white mt-4">
          {user?.fullname || user?.username || "User"}
        </h1>
        <p className="text-blue-100">{user?.email || "No email available"}</p>
        {user?.username && (
          <p className="text-blue-200 mt-1">@{user.username}</p>
        )}
      </div>
    </div>
  );
};

ProfileHeader.propTypes = {
  user: PropTypes.shape({
    fullname: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    photoURL: PropTypes.string,
  }),
  onUpdateUser: PropTypes.func,
};

export default ProfileHeader;
