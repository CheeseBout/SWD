import { Platform } from "react-native";
import Constants from "expo-constants";

// Access environment variables with a fallback mechanism
const ENV = {
  // Default value if environment variable is not set
  BASE_API_URL: process.env.BASE_API_URL || "http://10.0.2.2:8080/api/v1",
};

const appConfig = {
  // Use environment variable for BASE_API_URL
  BASE_API_URL: ENV.BASE_API_URL,
  // For comments: Android emulator uses 10.0.2.2, physical devices should use local IP
  // If using a physical device or iOS simulator, use your computer's local IP address
  // Example: "http://192.168.x.x:8080/api/v1"
  GOOGLE: {
    WEB_CLIENT_ID:
      "1070734921502-vk4nm2u5fnd0u5ks3i43l2j4tdh6b390.apps.googleusercontent.com",
  },
};

export default appConfig;
