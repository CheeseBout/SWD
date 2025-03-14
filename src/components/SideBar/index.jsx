import { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { AuthContext } from "../../contexts/AuthContextObject";
import {
  ClipboardCheckIcon,
  ChartSquareBarIcon,
  MenuAlt2Icon,
  XIcon,
  UserIcon,
  UserCircleIcon,
  KeyIcon,
} from "@heroicons/react/outline";

const SideBar = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  const [key, setKey] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setKey((prevKey) => prevKey + 1);

    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);

    // Check for screen size and set collapsed state for initial load
    const checkScreenSize = () => {
      setIsCollapsed(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [user, isAuthenticated, location]);

  if (!user) {
    return null;
  }

  const isActive = (path) => {
    if (path === "/profile") {
      return location.pathname === "/profile";
    }
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
          active
            ? "bg-blue-100 text-blue-700 font-medium border-r-4 border-blue-600"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <Icon className={`h-5 w-5 ${active ? "text-blue-600" : ""}`} />
        {(!isCollapsed || (isCollapsed && isMobileMenuOpen)) && (
          <span>{label}</span>
        )}
      </Link>
    );
  };

  NavItem.propTypes = {
    to: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div
      key={key}
      className="bg-white w-64 min-h-screen shadow-md py-8 px-4 flex flex-col"
    >
      <h2 className="text-xl font-bold px-4 mb-6 text-gray-800">My Account</h2>

      <nav className="space-y-2">
        <NavItem to="/profile" icon={UserCircleIcon} label="Profile" />
        <NavItem
          to="/profile/update-profile"
          icon={UserIcon}
          label="Update Profile"
        />
        <NavItem
          to="/profile/change-password"
          icon={KeyIcon}
          label="Change Password"
        />
        {user?.role === "member" && (
          <NavItem
            to="/profile/your-reservations"
            icon={ClipboardCheckIcon}
            label="Your Reservations"
          />
        )}
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

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default SideBar;
