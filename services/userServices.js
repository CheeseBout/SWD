const {
  default: AsyncStorage,
} = require("@react-native-async-storage/async-storage");
const { default: apiClient } = require("../configs/axiosConfig");
const { getTokens } = require("../utils/tokenStorage");

const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    console.log("Get user by ID response:", response.data);

    // Tạo cấu trúc userInfo mới từ response
    const userInfo = {
      data: {
        user: response.data.data.user, // Lấy user từ đúng path
        message: response.data.message,
        status: response.data.status,
      },
    };

    console.log("Structured user info:", userInfo);
    await AsyncStorage.setItem("userInfo", JSON.stringify(userInfo));
    return userInfo;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
};

const updateProfile = async (formData) => {
  try {
    const tokens = await getTokens();
    const response = await apiClient.put(`/users/update-profile`, formData, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    // Lấy thông tin user hiện tại từ storage
    const currentUserInfo = await AsyncStorage.getItem("userInfo");
    const parsedUserInfo = JSON.parse(currentUserInfo);

    // Tạo object mới với thông tin user đã cập nhật
    const updatedUserInfo = {
      ...parsedUserInfo,
      data: {
        ...parsedUserInfo.data,
        user: response.data.data.user, // Đảm bảo lấy đúng path của user từ response
      },
    };

    console.log("Updated user info before saving:", updatedUserInfo);
    await AsyncStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

    return updatedUserInfo; // Trả về toàn bộ object đã cập nhật
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

module.exports = {
  getUserById,
  updateProfile,
};
