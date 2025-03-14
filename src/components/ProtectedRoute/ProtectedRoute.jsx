import { useContext } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import PropTypes from "prop-types";
import { Spinner } from "@material-tailwind/react";
import { AuthContext } from "../../contexts/AuthContextObject";

/**
 * ProtectedRoute component for role-based access control with React Router v6
 * This component should be used as the element prop of a Route component
 */
const ProtectedRoute = ({ allowedRoles, redirectPath = "/login" }) => {
  const location = useLocation();
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner color="blue" size="large" />
      </div>
    );
  }

  // Check if user exists and has the required role
  const isAuthorized =
    user &&
    (Array.isArray(allowedRoles)
      ? allowedRoles.includes(user.role)
      : user.role === allowedRoles);

  if (!isAuthorized) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
  redirectPath: PropTypes.string,
};

export default ProtectedRoute;
