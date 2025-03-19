import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { removeTokens } from "../utils/tokenStorage";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      console.log("Loading stored authentication data");
      const storedUser = await AsyncStorage.getItem("userInfo");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log(
          "Found stored user info:",
          parsedUser?.data?.user?.fullname || "Unknown user"
        );

        setUserInfo(parsedUser);
        setIsAuthenticated(true);
        console.log("User authenticated from stored data");
      } else {
        console.log("No stored user info found");
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error loading auth info:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      console.log(
        "Attempting to login with user data:",
        JSON.stringify(userData, null, 2)
      );

      // Đảm bảo userInfo được lưu đúng cấu trúc
      await AsyncStorage.setItem("userInfo", JSON.stringify(userData));
      console.log("User info saved to AsyncStorage");

      // Cập nhật state
      setUserInfo(userData);
      setIsAuthenticated(true);

      console.log("Authentication state updated: isAuthenticated = true");
      return true;
    } catch (error) {
      console.error("Error during login process:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userInfo");
      await removeTokens(); // Xóa cả tokens
      setUserInfo(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error removing auth info:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userInfo,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
