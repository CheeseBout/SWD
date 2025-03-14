import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { therapistService } from "../../services/api";
import { debounce } from "lodash";

export function TherapistHero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const response = await therapistService.searchTherapistsByName(
          query.trim()
        );
        setSuggestions(response.data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    }, 500), // Delay
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchSuggestions(value);
  };

 

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative h-[600px] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/TherapistSearch.jpg")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Find Your Perfect Match in
            <span className="block mt-2 text-blue-400">Mental Health Care</span>
          </h1>
          <p className="text-xl text-white mb-12 opacity-90 leading-relaxed max-w-2xl mx-auto drop-shadow">
            Connect with licensed therapists who understand your unique needs
          </p>

          <div ref={searchRef} className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search therapists by name..."
              value={searchQuery}
              onChange={handleInputChange}
              className="w-full px-6 py-3.5 text-gray-700 bg-white rounded-full focus:outline-none text-base shadow-lg"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
            >
              <svg
                className="w-5 h-5"
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

            {/* Suggest list */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-2 max-h-60 overflow-y-auto z-50">
                {suggestions.map((therapist) => (
                  <div
                    key={therapist.id}
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => navigate(`/therapist/${therapist._id}`)}
                  >
                    <img
                      src={therapist.userInfo.photoURL || "/default-avatar.png"}
                      alt={therapist.userInfo.fullname}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="text-gray-700 font-medium">
                      {therapist.userInfo.fullname}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 📊 Thông tin thống kê */}
          <div className="flex justify-center gap-16 text-white mt-8">
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold mb-1">100+</div>
              <div className="text-sm opacity-80 font-medium uppercase tracking-wider">
                Verified Therapists
              </div>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold mb-1">4.8/5</div>
              <div className="text-sm opacity-80 font-medium uppercase tracking-wider">
                Average Rating
              </div>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold mb-1">24/7</div>
              <div className="text-sm opacity-80 font-medium uppercase tracking-wider">
                Support
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
