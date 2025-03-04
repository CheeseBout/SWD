import { createContext } from 'react';

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: () => {},
  logout: () => {},
  refreshUser: () => {}
});

export default AuthContext;