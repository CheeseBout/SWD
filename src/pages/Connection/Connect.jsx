import React, { useState, useEffect, useContext } from "react";
import SideBar from "../../components/SideBar";
import { authService } from "../../services/auth/authService";
import { FaGoogle } from "react-icons/fa";
import { userService } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContextObject";

function Connect() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Check if user is already connected and check for success parameter
    const checkConnectionStatus = async () => {
      try {
        const userData = await userService.getUserById(user._id);
        if (
          userData &&
          userData.data &&
          userData.data.user &&
          userData.data.user.isGoogleUser
        ) {
          setIsConnected(true);
        }
      } catch (err) {
        console.error("Error checking user connection status:", err);
      } finally {
        setLoading(false);
      }
    };

    // Check URL for success parameter
    const urlParams = new URLSearchParams(window.location.search);
    const googleConnectSuccess = urlParams.get("googleConnectSuccess");

    if (googleConnectSuccess === "true") {
      setIsConnected(true);
      setSuccessMessage("Google account connected successfully!");
      setLoading(false);

      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Only check user status if not redirected with success parameter
      checkConnectionStatus();
    }
  }, []);

  const connectGoogleAccount = async (code) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.linkGoogleAccount(code);
      setIsConnected(true);
      setSuccessMessage("Google account connected successfully!");

      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      setError("Failed to connect Google account. Please try again.");
      console.error("Google connection error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectClick = async () => {
    setLoading(true);
    setError(null);

    try {
      // This will redirect to Google auth page
      await authService.linkGoogleAccount();
      // Note: The page will redirect, so we won't reach this point
    } catch (err) {
      setError("Failed to initiate Google connection. Please try again.");
      console.error("Google connection initiation error:", err);
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await authService.disconnectGoogleAccount();
      setIsConnected(false);
      setSuccessMessage("Google account disconnected successfully!");
    } catch (err) {
      setError("Failed to disconnect Google account. Please try again.");
      console.error("Google disconnection error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <SideBar />
      <div className="flex-1 p-8">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-600 text-white px-6 py-4">
              <h4 className="text-xl font-semibold m-0">
                Connect Google Calendar
              </h4>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {successMessage}
                </div>
              )}

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">
                    Checking connection status...
                  </p>
                </div>
              ) : (
                <div className="text-center mb-4">
                  {isConnected ? (
                    <div>
                      <div className="mb-3">
                        <FaGoogle
                          className="text-green-500 mx-auto"
                          size={50}
                        />
                      </div>
                      <h5 className="text-green-600 text-lg font-medium">
                        Google Calendar is connected!
                      </h5>
                      <p className="text-gray-600 mb-4">
                        Your appointments will be synchronized with your Google
                        Calendar.
                      </p>
                      <button
                        className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-100 transition"
                        onClick={handleDisconnect}
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-3">
                        <FaGoogle className="text-gray-400 mx-auto" size={50} />
                      </div>
                      <h5 className="text-lg font-medium">
                        Connect to Google Calendar
                      </h5>
                      <p className="text-gray-600 mb-4">
                        Connect your Google Calendar to automatically sync
                        appointments and manage your schedule more efficiently.
                      </p>
                      <button
                        className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium transition ${
                          loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={handleConnectClick}
                        disabled={loading}
                      >
                        {loading ? "Connecting..." : "Connect with Google"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Connect;
