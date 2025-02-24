import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function TherapistHero() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/therapists/search?name=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative h-[600px] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/TherapistSearch.jpg")',
        }}
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

          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-16">
            <div className="relative">
              <input
                type="text"
                placeholder="Search therapists by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-3.5 text-gray-700 bg-white rounded-full focus:outline-none text-base shadow-lg"
              />
              <button
                type="submit"
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
            </div>
          </form>

          <div className="flex justify-center gap-16 text-white">
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold mb-1">100+</div>
              <div className="text-sm opacity-80 font-medium uppercase tracking-wider">Verified Therapists</div>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold mb-1">4.8/5</div>
              <div className="text-sm opacity-80 font-medium uppercase tracking-wider">Average Rating</div>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold mb-1">24/7</div>
              <div className="text-sm opacity-80 font-medium uppercase tracking-wider">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
