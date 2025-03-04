const {
  default: AsyncStorage,
} = require("@react-native-async-storage/async-storage");
const { default: apiClient } = require("../configs/axiosConfig");

const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);

    await AsyncStorage.setItem("userInfo", JSON.stringify(response.data));
    console.log("User info saved to storage:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
};

module.exports = {
  getUserById,
};
