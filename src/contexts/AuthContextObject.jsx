import { useState, useEffect, createContext } from 'react';
import PropTypes from 'prop-types';
import { jwtDecode } from 'jwt-decode';
import { userService } from '../services/api';

// Create the context directly in this file (remove the import)
export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: () => {},
  logout: () => {},
  refreshUser: () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('accessToken');
      
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
          // Token is expired, handle logout
          localStorage.removeItem('accessToken');
          setIsAuthenticated(false);
          setUser(null);
        } else {
          // Set authenticated from token first
          setIsAuthenticated(true);
          
          // Check for userId in different possible fields
          const userId = decodedToken.userId || decodedToken._id || decodedToken.id || decodedToken.sub;
          
          if (userId) {
            console.log("Found user ID:", userId);
            try {
              // Add the userId to the token data
              const userData = { ...decodedToken, _id: userId };
              
              // Try to fetch more user data
              const response = await userService.getUserById(userId);
              if (response?.data?.user) {
                setUser(response.data.user);
              } else {
                // If API call doesn't return user data, use token data
                setUser(userData);
              }
            } catch (fetchError) {
              console.error("Error fetching user data:", fetchError);
              // Fallback to using token data with the ID added
              setUser({ ...decodedToken, _id: userId });
            }
          } else {
            // If no ID in token, just use token data
            console.log("No user ID found in token, using token data", decodedToken);
            setUser(decodedToken);
          }
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('accessToken');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  const logout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  const login = (token) => {
    localStorage.setItem('accessToken', token);
    try {
      const decodedToken = jwtDecode(token);
      setUser(decodedToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error decoding login token:', error);
      logout();
    }
  };

  const refreshUser = async () => {
    if (!isAuthenticated || !user) return;
    
    const userId = user._id || user.id || user.sub;
    if (!userId) {
      console.error('Cannot refresh user: No user ID available');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await userService.getUserById(userId);
      setUser(response.data.user);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      login, 
      logout,
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};