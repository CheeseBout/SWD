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
            try {
              const userData = { ...decodedToken, _id: userId };

              const response = await userService.getUserById(userId);
              if (response?.data?.user) {
                setUser(response.data.user);
              } else {
                setUser(userData);
              }
            } catch (fetchError) {
              console.error("Error fetching user data:", fetchError);
              setUser({ ...decodedToken, _id: userId });
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
    console.log(
      "Login called with token:",
      token ? "Token exists" : "No token"
    );
    localStorage.setItem("accessToken", token);
    try {
      const decodedToken = jwtDecode(token);
      console.log("Decoded token:", decodedToken);
      setUser(decodedToken);
      setIsAuthenticated(true);

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
          console.log("Fetching user details for ID:", userId);
          const response = await userService.getUserById(userId);
          console.log("User data response:", response);
          if (response?.data?.user) {
            console.log("Setting user data from API response");
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
