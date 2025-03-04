import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContextObject";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { userService } from "../../services/api";
import {
  ProfileHeader,
  ProfileInfoCard,
} from "../../components/profile";

export default function ProfilePage() {
  const navigate = useNavigate();
  const {
    user: authUser,
    isAuthenticated,
    isLoading: authLoading,
  } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        console.log("Auth user data available:", authUser);

        const userId =
          authUser?.userId || authUser?._id || authUser?.id || authUser?.sub;

        if (userId) {
          try {
            console.log("Attempting to fetch user with ID:", userId);
            const response = await userService.getUserById(userId);
            console.log("User data response:", response);
            if (response?.data?.user) {
              setProfileData(response.data.user);
            } else {
              setProfileData(authUser);
            }
          } catch (fetchError) {
            console.error("Error fetching user profile:", fetchError);
            setProfileData(authUser);
          }
        } else {
          console.log("No user ID found in auth data, using available data");
          setProfileData(authUser);
        }
      } catch (error) {
        console.error("Error handling profile data:", error);
        setError("An error occurred while loading your profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, authUser, isAuthenticated, authLoading]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (authLoading || isLoading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const user = profileData || authUser;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <ProfileHeader user={user} />
        <div className="p-6">
          <div>
            <ProfileInfoCard user={user} formatDate={formatDate} />
          </div>
        </div>
      </div>
    </div>
  );
}
