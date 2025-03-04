import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";

export const troubleshootGoogleSignIn = async () => {
  try {
    // Check if Google Sign-In is available
    const isSigninAvailable = typeof GoogleSignin.isSignedIn === "function";
    console.log("Is GoogleSignin.isSignedIn available:", isSigninAvailable);

    // Log configured scopes
    const configuredScopes = GoogleSignin._options?.scopes || [];
    console.log("Configured scopes:", configuredScopes);

    // Log web client ID
    const webClientId = GoogleSignin._options?.webClientId || "Not configured";
    console.log("Web Client ID:", webClientId);

    // Check platform-specific configuration
    if (Platform.OS === "android") {
      console.log("Android configuration:");
      console.log("- offlineAccess:", GoogleSignin._options?.offlineAccess);
      console.log(
        "- forceCodeForRefreshToken:",
        GoogleSignin._options?.forceCodeForRefreshToken
      );
    } else if (Platform.OS === "ios") {
      console.log("iOS configuration:");
      console.log("- openIdRealm:", GoogleSignin._options?.openIdRealm);
    }

    return {
      isSigninAvailable,
      webClientId,
      configuredScopes,
      platformSpecificConfig:
        Platform.OS === "android"
          ? {
              offlineAccess: GoogleSignin._options?.offlineAccess,
              forceCodeForRefreshToken:
                GoogleSignin._options?.forceCodeForRefreshToken,
            }
          : { openIdRealm: GoogleSignin._options?.openIdRealm },
    };
  } catch (error) {
    console.error("Error in troubleshooting:", error);
    return { error: error.message };
  }
};
