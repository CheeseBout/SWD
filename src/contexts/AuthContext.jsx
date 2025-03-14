import { useState, useEffect, createContext } from "react";
import PropTypes from "prop-types";
import { jwtDecode } from "jwt-decode";
import { userService } from "../services/api";

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: () => {},
  logout: () => {},
  refreshUser: () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded token contents:", decodedToken);

        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem("accessToken");
          setIsAuthenticated(false);
          setUser(null);
        } else {
          setIsAuthenticated(true);

          const userId =
            decodedToken.userId ||
            decodedToken._id ||
            decodedToken.id ||
            decodedToken.sub;

          if (userId) {
            console.log("Found user ID:", userId);
            try {
              const userData = { ...decodedToken, _id };

              const response = await userService.getUserById(userId);
              if (response?.data?.user) {
                setUser(response.data.user);
              } else {
                setUser(userData);
              }
            } catch (fetchError) {
              console.error("Error fetching user data:", fetchError);
              setUser({ ...decodedToken, _id });
            }
          } else {
            console.log(
              "No user ID found in token, using token data",
              decodedToken
            );
            setUser(decodedToken);
          }
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("accessToken");
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const logout = () => {
    localStorage.removeItem("accessToken");
    setIsAuthenticated(false);
    setUser(null);
  };

  const login = async (token) => {
    console.log("Login function called with token:", token?.substring(0, 15) + "...");
    localStorage.setItem("accessToken", token);
    try {
      console.log("Attempting to decode token");
      const decodedToken = jwtDecode(token);
      console.log("Decoded token:", decodedToken);
      setUser(decodedToken);
      setIsAuthenticated(true);
      console.log("Authentication state set to true");

      if (
        decodedToken.userId ||
        decodedToken._id ||
        decodedToken.id ||
        decodedToken.sub
      ) {
        const userId =
          decodedToken.userId ||
          decodedToken._id ||
          decodedToken.id ||
          decodedToken.sub;
        console.log("User ID found in token:", userId);
        try {
          console.log("Fetching additional user details");
          const response = await userService.getUserById(userId);
          console.log("User details response:", response);
          if (response?.data?.user) {
            console.log("Setting user with additional details");
            setUser((prevUser) => ({
              ...prevUser,
              ...response.data.user,
            }));
          }
        } catch (error) {
          console.error("Error fetching user details after login:", error);
        }
      } else {
        console.log("No user ID found in token");
      }
    } catch (error) {
      console.error("Error decoding login token:", error);
      console.log("Calling logout due to token decode error");
      logout();
    }
  };

  const refreshUser = async () => {
    if (!isAuthenticated || !user) return;

    const userId = user._id || user.id || user.sub;
    if (!userId) {
      console.error("Cannot refresh user: No user ID available");
      return;
    }

    try {
      setIsLoading(true);
      const response = await userService.getUserById(userId);
      setUser(response.data.user);
    } catch (error) {
      console.error("Error refreshing user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUserData) => {
    if (!updatedUserData) return;

    setUser((prevUser) => {
      if (!prevUser) return updatedUserData;

      const newUser = { ...prevUser, ...updatedUserData };
      return newUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
