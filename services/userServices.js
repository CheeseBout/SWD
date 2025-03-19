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

const changeAvatar = async (formData) => {
  try {
    const tokens = await getTokens();

    console.log(
      "Sending request to change avatar with token:",
      tokens.accessToken
    );

    // Make sure API endpoint is correct and includes the full URL
    const response = await apiClient.patch(`/users/change-avatar`, formData, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
      // Add timeout to avoid hanging requests
      timeout: 30000,
    });

    console.log("Avatar update raw response:", response);
    console.log("Avatar update response data:", response.data);

    // Check if the response is valid
    if (!response || !response.data) {
      throw new Error("Invalid response from server");
    }

    // Lấy thông tin user hiện tại từ storage
    const currentUserInfo = await AsyncStorage.getItem("userInfo");
    const parsedUserInfo = JSON.parse(currentUserInfo);

    // Extract photoURL from response based on different possible structures
    let photoURL = null;

    if (response.data) {
      if (response.data.data) {
        if (response.data.data.photoURL) {
          photoURL = response.data.data.photoURL;
        } else if (
          response.data.data.user &&
          response.data.data.user.photoURL
        ) {
          photoURL = response.data.data.user.photoURL;
        }
      } else if (response.data.photoURL) {
        photoURL = response.data.photoURL;
      } else if (response.data.user && response.data.user.photoURL) {
        photoURL = response.data.user.photoURL;
      }
    }

    console.log("New photoURL extracted:", photoURL);

    // If we couldn't find the photoURL in the response, keep the existing one
    const updatedUserInfo = {
      ...parsedUserInfo,
      data: {
        ...parsedUserInfo.data,
        user: {
          ...parsedUserInfo.data.user,
          photoURL: photoURL || parsedUserInfo.data.user.photoURL,
        },
      },
    };

    console.log("Updated userInfo being saved:", updatedUserInfo);

    // Lưu thông tin đã cập nhật vào storage
    await AsyncStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

    return updatedUserInfo;
  } catch (error) {
    console.error("Error updating avatar:", error.message);
    console.error("Error details:", error);

    // Re-throw with more details to help debugging
    throw new Error(`Avatar update failed: ${error.message}`);
  }
};

module.exports = {
  getUserById,
  updateProfile,
  changeAvatar,
};
