import { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { AuthContext } from "../../contexts/AuthContextObject";
import {
  ClipboardCheckIcon,
  ChartSquareBarIcon,
} from "@heroicons/react/outline";

const SideBar = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [user, isAuthenticated]);

  if (!user) {
    return null;
  }

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };
  const NavItem = ({ to, icon: Icon, label }) => {
    return (
      <Link
        to={to}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
          isActive(to)
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </Link>
    );
  };

  NavItem.propTypes = {
    to: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
  };

  return (
    <div
      key={key}
      className="bg-white w-64 min-h-screen shadow-md py-8 px-4 flex flex-col"
    >
      <h2 className="text-xl font-bold px-4 mb-6 text-gray-800">My Account</h2>

      <nav className="space-y-2">
        <NavItem to="/profile" icon={ChartSquareBarIcon} label="Profile" />
      </nav>

      <div className="mt-auto pt-8 px-4">
        <div className="text-sm text-gray-500">
          Logged in as:
          <div className="font-semibold text-gray-700">
            {user?.fullname || user?.username || "User"}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {user?.role || "Member"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
