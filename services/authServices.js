import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import appConfig from "../configs/app.config";
import apiClient from "../configs/axiosConfig";
import { Platform } from "react-native";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: appConfig.GOOGLE.WEB_CLIENT_ID,
  offlineAccess: true,
});

const signInWithGoogle = async () => {
  try {
    console.log("Starting Google Sign-In process");
    console.log("Using Web Client ID:", appConfig.GOOGLE.WEB_CLIENT_ID);

    // Check Play Services for Android
    if (Platform.OS === "android") {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      console.log("Play Services check passed");
    }

    // Perform sign in
    const userInfo = await GoogleSignin.signIn();
    console.log("Google Sign-In successful");
    console.log("User Info:", userInfo);
    console.log("ID Token:", userInfo.data.idToken);

    if (!userInfo.data.idToken) {
      console.warn("No ID token received from Google Sign-In");
      return userInfo; // Return user info even without sending to backend
    }

    try {
      // Attempt to send token to backend
      const apiUrl = `${appConfig.BASE_API_URL}/auth/google-login`;
      console.log("Sending ID token to backend:", apiUrl);

      const response = await apiClient.post("/auth/google-login", {
        idToken: userInfo.data.idToken,
      });

      console.log("Backend response:", response.data);

      // Return complete response
      return {
        googleUser: userInfo,
        backendResponse: response.data, // Contains {data: {accessToken, refreshToken, user}, message, status}
      };
    } catch (apiError) {
      console.error("Backend communication error:", apiError);

      // Return user info even if backend request fails
      return {
        googleUser: userInfo,
        backendError: apiError.message,
      };
    }
  } catch (error) {
    console.error("Google Sign-In Error:", error);

    // Handle specific Google Sign-In errors
    if (error.code) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          throw new Error("Sign in was cancelled");
        case statusCodes.IN_PROGRESS:
          throw new Error("Sign in already in progress");
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          throw new Error("Play services not available or outdated");
        case 10: // DEVELOPER_ERROR
          throw new Error(
            "Developer error: Check configuration and credentials"
          );
        default:
          throw new Error(`Sign in failed with code: ${error.code}`);
      }
    }

    throw error;
  }
};

// Function to check if user is currently signed in
const isSignedIn = async () => {
  try {
    const isUserSignedIn = await GoogleSignin.isSignedIn();
    return isUserSignedIn;
  } catch (error) {
    console.error("Error checking sign-in status:", error);
    return false;
  }
};

// Function to get current user if signed in
const getCurrentUser = async () => {
  try {
    const currentUser = await GoogleSignin.getCurrentUser();
    return currentUser;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Function to sign out
const signOut = async () => {
  try {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export { signInWithGoogle, isSignedIn, getCurrentUser, signOut };
