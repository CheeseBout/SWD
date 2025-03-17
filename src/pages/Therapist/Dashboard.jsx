import React, { useContext, useEffect } from "react";
import TherapistAvailability from "./Availability";
import { AuthContext } from "../../contexts/AuthContextObject";
import { therapistService } from "../../services/api";

function Dashboard() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const getTherapistId = async () => {
      try {
        const response = await therapistService.getTherapistIdByUserId(
          user._id
        );
        localStorage.setItem("therapistId", response._id);
      } catch (error) {
        console.error("Error fetching therapist ID:", error);
      }
    };
    getTherapistId();
  }, [user]);

  return (
    <div>
      <TherapistAvailability />
    </div>
  );
}

export default Dashboard;
