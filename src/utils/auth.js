import { jwtDecode } from "jwt-decode";

export const checkAuth = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return false;
  }
  
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem("accessToken");
      return false;
    }
    
    return decodedToken;
  } catch (error) {
    console.error("Error decoding token:", error);
    localStorage.removeItem("accessToken");
    return false;
  }
};

export const getUserId = () => {
  const decodedToken = checkAuth();
  if (!decodedToken) {
    return null;
  }
  
  return decodedToken.userId || decodedToken.sub;
};
