import { FeaturedQuizzes } from "@components/FeaturedQuizzes";
import { FeaturedTherapists } from "@components/FeaturedTherapists";
import { HomeHero } from "@components/Hero/HomeHero";
import GoogleCallback from "../Login/GoogleCallbackHandler";
import { useContext, useEffect, useState } from "react";
import { therapistService } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContextObject";
import { VerificationModal } from "@components/VerificationModal";

export function HomePage() {
  const params = new URLSearchParams(window.location.search);
  const hasGoogleToken =
    params.has("accessToken") && params.has("refreshToken");
  const { user } = useContext(AuthContext);
  const [therapistData, setTherapistData] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    const fetchTherapistData = async () => {
      if (!user?._id) return;

      try {
        const response = await therapistService.getTherapistIdByUserId(
          user._id
        );
        setTherapistData(response.data);
        console.log("Therapist data:", response);

        if (response.data && response.data.isUpdatedInformation === false) {
          setShowVerificationModal(true);
        }
      } catch (error) {
        console.error("Error fetching therapist data:", error);
      }
    };

    fetchTherapistData();
  }, [user]);

  const handleCloseModal = () => {
    setShowVerificationModal(false);
  };

  return (
    <>
      <HomeHero />
      <FeaturedQuizzes />
      <FeaturedTherapists />
      {hasGoogleToken && <GoogleCallback />}

      {showVerificationModal && user && (
        <VerificationModal onClose={handleCloseModal} userId={user._id} />
      )}
    </>
  );
}
