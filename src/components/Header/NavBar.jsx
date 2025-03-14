import { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContextObject";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

  const getInitials = () => {
    if (!user) return "U";
    if (user.fullname) return user.fullname.charAt(0);
    if (user.username) return user.username.charAt(0);
    return user.email?.charAt(0).toUpperCase() || "U";
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }

      if (
        isMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleNavigation = (path) => {
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    setTimeout(() => {
      navigate(path);
    }, 10);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  const getDashboardPath = () => {
    if (user?.role === "admin") {
      return "/admin/dashboard";
    } else if (user?.role === "couple_therapist") {
      return "/therapist/dashboard";
    }
    return "/dashboard";
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
            <Link to="/" className="flex items-center space-x-2">
              <img className="h-14 w-auto" src="/logo.png" alt="Logo" />
              <span className="font-semibold text-xl text-gray-800 hidden sm:block">
                Marriage Counseling
              </span>
            </Link>
          </div>

          <div className="flex md:hidden">
            <button
              ref={mobileMenuButtonRef}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-6">
            {[
              "Find a Therapist",
              "Quizzes",
              "Blogs",
              "Courses",
              "About Us",
            ].map((item, index) => (
              <button
                key={index}
                onClick={() =>
                  handleNavigation(
                    `/${item.toLowerCase().replace(/\s+/g, "-")}`
                  )
                }
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <div className="relative ml-3" ref={dropdownRef}>
                <div>
                  <button
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform hover:scale-105"
                    popoverTarget="user-dropdown"
                    style={{ anchorName: "--user-dropdown-anchor" }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-expanded={isDropdownOpen}
                  >
                    <span className="sr-only">Open user menu</span>
                    {user?.photoURL ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover border-2 border-blue-100 shadow-sm"
                        src={user.photoURL}
                        alt="User profile"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-sm">
                        {getInitials()}
                      </div>
                    )}
                  </button>
                </div>

                <div
                  className={`dropdown menu w-56 rounded-lg bg-white shadow-lg z-10 overflow-hidden border border-gray-100 ${
                    !isDropdownOpen && "hidden"
                  }`}
                  popover="auto"
                  id="user-dropdown"
                  style={{ positionAnchor: "--user-dropdown-anchor" }}
                >
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {user?.fullname || user?.username || user?.email}
                      </p>
                    </div>
                    <button
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                      onClick={() => handleNavigation("/profile")}
                    >
                      Your Profile
                    </button>
                    {(user?.role === "admin" ||
                      user?.role === "couple_therapist") && (
                      <>
                        <button
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                          onClick={() => handleNavigation(getDashboardPath())}
                        >
                          Dashboard
                        </button>
                      </>
                    )}
                    <button
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                      onClick={handleLogout}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium border border-gray-200 hover:border-blue-300 rounded-md transition-colors duration-200 shadow-sm hover:shadow"
                  onClick={() => handleNavigation("/login")}
                >
                  Login
                </button>
                <button
                  className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-md text-sm font-medium hover:from-blue-600 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  onClick={() => handleNavigation("/register")}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden mobile-menu bg-white border-t border-gray-100 p-4 space-y-2 shadow-lg"
        >
          {["Find a Therapist", "Quizzes", "Blogs", "About Us"].map(
            (item, index) => (
              <button
                key={index}
                onClick={() =>
                  handleNavigation(
                    `/${item.toLowerCase().replace(/\s+/g, "-")}`
                  )
                }
                className="block w-full text-left px-3 py-2.5 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                {item}
              </button>
            )
          )}
          <div className="mt-5 space-y-3 pt-4 border-t border-gray-100">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
                  {user?.photoURL ? (
                    <img
                      className="h-12 w-12 rounded-full object-cover border-2 border-blue-100 shadow-sm"
                      src={user.photoURL}
                      alt="User profile"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-sm">
                      {getInitials()}
                    </div>
                  )}
                  <span className="font-semibold text-gray-800">
                    {user?.fullname || user?.username || "User"}
                  </span>
                </div>
                {(user?.role === "admin" ||
                  user?.role === "couple_therapist") && (
                  <button
                    className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    onClick={() => handleNavigation(getDashboardPath())}
                  >
                    Dashboard
                  </button>
                )}
                <button
                  className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  onClick={() => handleNavigation("/profile")}
                >
                  Your Profile
                </button>
                <button
                  className="w-full text-left block px-3 py-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  className="block w-full text-center px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200"
                  onClick={() => handleNavigation("/login")}
                >
                  Login
                </button>
                <button
                  className="block w-full text-center px-4 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 rounded-lg shadow-md transition-all duration-200"
                  onClick={() => handleNavigation("/register")}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
