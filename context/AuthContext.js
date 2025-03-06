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
      const storedUser = await AsyncStorage.getItem("userInfo");
      if (storedUser) {
        setUserInfo(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error loading auth info:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      await AsyncStorage.setItem("userInfo", JSON.stringify(userData));
      setUserInfo(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error saving auth info:", error);
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
