import { createContext, useContext, useState } from "react";

// Tạo context để lưu trạng thái đăng nhập
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tiện ích để truy cập AuthContext
export const useAuth = () => useContext(AuthContext);
