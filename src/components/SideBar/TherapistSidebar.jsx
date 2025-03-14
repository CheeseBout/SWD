import { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { AuthContext } from "../../contexts/AuthContextObject";
import {
  ClipboardCheckIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserCircleIcon,
  MenuAlt2Icon,
  XIcon,
  AcademicCapIcon,
  PencilAltIcon,
} from "@heroicons/react/outline";

const TherapistSidebar = () => {
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
    if (path === "/therapist" && location.pathname === "/therapist") {
      return true;
    }
    return location.pathname.includes(path);
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
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-20">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-white shadow-md text-gray-700 hover:bg-gray-100"
        >
          {isMobileMenuOpen ? (
            <XIcon className="h-6 w-6" />
          ) : (
            <MenuAlt2Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        key={key}
        className={`bg-white shadow-md py-8 transition-all duration-300 z-20 ${
          isCollapsed ? "w-16" : "w-64"
        } ${
          isMobileMenuOpen
            ? "fixed left-0 top-0 h-full"
            : "sticky top-0 hidden lg:block h-screen"
        }`}
      >
        <div className="flex items-center justify-between px-4 mb-8">
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-gray-800">
              Therapist Portal
            </h2>
          )}

          <button
            onClick={toggleSidebar}
            className="hidden lg:block rounded-full p-1 hover:bg-gray-100"
          >
            <MenuAlt2Icon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className={`mb-6 ${isCollapsed ? "px-2" : "px-4"}`}>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Management
            </h3>
          )}
          <nav className="space-y-1">
            <NavItem
              to="/therapist/reservations"
              icon={ClipboardCheckIcon}
              label="Reservations"
            />
            <NavItem
              to="/therapist/availability"
              icon={CalendarIcon}
              label="Availability"
            />
            <NavItem
              to="/therapist/certificates"
              icon={AcademicCapIcon}
              label="Certificates"
            />
            <NavItem to="/manage/blogs" icon={PencilAltIcon} label="Blogs" />
          </nav>
        </div>

        <div className={`mb-6 ${isCollapsed ? "px-2" : "px-4"}`}>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Account
            </h3>
          )}
          <nav className="space-y-1">
            <NavItem to="/profile" icon={UserCircleIcon} label="My Profile" />
          </nav>
        </div>

        {/* User info at bottom */}
        {!isCollapsed && (
          <div className="mt-auto pt-8 px-4 border-t border-gray-200 mx-2 mt-8">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-700 font-medium text-sm">
                  {user?.fullname?.[0] || user?.username?.[0] || "T"}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">
                  {user?.fullname || user?.username || "Therapist"}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role || "Couple Therapist"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TherapistSidebar;
