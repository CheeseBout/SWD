const appConfig = {
  // Use IP address instead of localhost for mobile devices
  BASE_API_URL: "http://10.0.2.2:8080/api/v1", // For Android emulator
  // If using a physical device or iOS simulator, use your computer's local IP address
  // BASE_API_URL: "http://192.168.x.x:8080/api/v1", // Replace with your computer's IP
  GOOGLE: {
    WEB_CLIENT_ID:
      "1070734921502-vk4nm2u5fnd0u5ks3i43l2j4tdh6b390.apps.googleusercontent.com",
  },
};

export default appConfig;
