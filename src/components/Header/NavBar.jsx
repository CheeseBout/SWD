import { useState } from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img
                className="h-20 w-30"
                src={"KetHon.png"}
                alt="Logo"
              />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              className="menu-button p-2 rounded-md text-gray-600 hover:text-gray-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {/* ...existing SVG code... */}
            </button>
          </div>

          {/* Main Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {["Find a Therapist", "Do Quizzes", "Blogs", "Courses", "About Us"].map(
              (item, index) => (
                <Link
                  key={index}
                  to={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  {item}
                </Link>
              )
            )}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative search-bar">
              <input
                type="text"
                placeholder="Search blogs..."
                className="w-48 px-4 py-1 text-sm text-gray-900 bg-gray-50 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
              />
              <button className="absolute right-2 top-2">
                <svg
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
            <Link
              to="/login"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mobile-menu bg-white border-t border-gray-100 p-4 space-y-2">
          {["Find a Therapist", "Articles", "Advice", "Courses", "Forum"].map(
            (item, index) => (
              <Link
                key={index}
                to={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                {item}
              </Link>
            )
          )}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 text-gray-900 bg-gray-50 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="mt-4 space-y-2">
            <Link
              to="/login"
              className="block w-full text-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;