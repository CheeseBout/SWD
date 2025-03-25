import { useEffect, useState, useCallback } from "react";
import { StarIcon, SearchIcon, XCircleIcon, FilterIcon, AdjustmentsIcon } from "@heroicons/react/solid";
import { categoryService, therapistService } from "../../services/api";
import { TherapistCard } from "../../components/TherapistCard";
import debounce from "lodash/debounce";

export default function TherapistList() {
  const [therapists, setTherapists] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    searchName: "",
    category: "",
    minRating: 0,
    maxRating: 5
  });

  const pageSize = 6;

  // Fetch therapists with debounce for search
  const fetchTherapists = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await therapistService.getAllTherapists({
        page: currentPage,
        limit: pageSize,
        ...filters
      });
      
      setTherapists(response.data);
      setTotalPages(response.totalPages || Math.ceil(response.total / pageSize));
      setTotalCount(response.total || response.data.length);
    } catch (error) {
      console.error("Error fetching therapists:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters, pageSize]);

  // Debounced search
  const debouncedFetch = useCallback(
    debounce(() => {
      fetchTherapists();
    }, 500),
    [fetchTherapists]
  );

  useEffect(() => {
    if (filters.searchName) {
      debouncedFetch();
    } else {
      fetchTherapists();
    }
  }, [debouncedFetch, fetchTherapists, filters.searchName]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    
    getCategories();
  }, []);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      searchName: "",
      category: "",
      minRating: 0,
      maxRating: 5
    });
    setCurrentPage(1);
  };

  const handleRatingChange = (type, value) => {
    setFilters(prev => {
      // Ensure min rating doesn't exceed max rating
      if (type === 'minRating' && value > prev.maxRating) {
        return { ...prev, minRating: value, maxRating: value };
      }
      // Ensure max rating isn't less than min rating
      if (type === 'maxRating' && value < prev.minRating) {
        return { ...prev, maxRating: value, minRating: value };
      }
      return { ...prev, [type]: value };
    });
    setCurrentPage(1);
  };

  return (
    <div className="py-16 bg-base-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Featured Therapists
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with our highly qualified and experienced therapists who are
            ready to support you on your journey.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
            <div className="relative w-full md:w-3/5">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search therapists by name..."
                className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={filters.searchName}
                onChange={(e) => handleFilterChange("searchName", e.target.value)}
              />
              {filters.searchName && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => handleFilterChange("searchName", "")}
                >
                  <XCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-all"
            >
              <FilterIcon className="h-5 w-5" />
              {showFilters ? "Hide Filters" : "Show Filters"}
              {(filters.category || filters.minRating > 0 || filters.maxRating < 5) && 
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-600 rounded-full">
                  !
                </span>
              }
            </button>
            
            {(filters.category || filters.minRating > 0 || filters.maxRating < 5) && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-all"
              >
                Clear All Filters
              </button>
            )}
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 p-5 rounded-lg mb-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <AdjustmentsIcon className="h-4 w-4 mr-1" />
                    Category
                  </h3>
                  <select
                    className="w-full px-4 py-2.5 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={filters.category}
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="w-full md:w-2/3">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <StarIcon className="h-4 w-4 mr-1 text-yellow-400" />
                    Rating Range
                  </h3>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Min:</span>
                      <div className="flex">
                        {[0, 1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={`min-${rating}`}
                            onClick={() => handleRatingChange('minRating', rating)}
                            className={`p-1.5 ${filters.minRating === rating ? 'bg-indigo-100 rounded' : ''}`}
                          >
                            {rating === 0 ? (
                              <span className="text-xs text-gray-500">Any</span>
                            ) : (
                              <StarIcon 
                                className={`h-5 w-5 ${rating <= filters.minRating ? 'text-yellow-400' : 'text-gray-300'}`} 
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mx-4 text-gray-400">to</div>
                    
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Max:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={`max-${rating}`}
                            onClick={() => handleRatingChange('maxRating', rating)}
                            className={`p-1.5 ${filters.maxRating === rating ? 'bg-indigo-100 rounded' : ''}`}
                          >
                            <StarIcon 
                              className={`h-5 w-5 ${rating <= filters.maxRating ? 'text-yellow-400' : 'text-gray-300'}`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Showing therapists with ratings from 
                    {filters.minRating === 0 ? ' any' : ` ${filters.minRating}★`} to {filters.maxRating}★
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Active filters summary */}
          {(filters.category || filters.minRating > 0 || filters.maxRating < 5) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {filters.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-50 text-indigo-700">
                  Category: {filters.category}
                  <XCircleIcon 
                    className="h-4 w-4 ml-1 cursor-pointer" 
                    onClick={() => handleFilterChange("category", "")}
                  />
                </span>
              )}
              {(filters.minRating > 0 || filters.maxRating < 5) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-50 text-yellow-700">
                  Rating: {filters.minRating === 0 ? 'Any' : filters.minRating}★ to {filters.maxRating}★
                  <XCircleIcon 
                    className="h-4 w-4 ml-1 cursor-pointer" 
                    onClick={() => {
                      handleFilterChange("minRating", 0);
                      handleFilterChange("maxRating", 5);
                    }}
                  />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Therapist list with loading and empty states */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              <p className="mt-4 text-gray-600">Finding the perfect therapists for you...</p>
            </div>
          </div>
        ) : therapists.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xl font-medium text-gray-700">No therapists found</p>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              We couldn't find any therapists matching your current filters. Try adjusting your search criteria or browse all therapists.
            </p>
            <button 
              onClick={clearFilters}
              className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-300">
            {therapists.map((therapist) => (
              <TherapistCard key={therapist._id} therapist={therapist} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-10 space-x-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || isLoading}
              className={`px-3 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50 border'}`}
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
              className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50 border'}`}
            >
              Previous
            </button>
            
            <div className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-md font-medium">
              Page {currentPage} of {totalPages}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
              className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50 border'}`}
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || isLoading}
              className={`px-3 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50 border'}`}
            >
              Last
            </button>
          </div>
        )}
        
        {totalCount > 0 && (
          <div className="text-center mt-4 text-gray-600">
            Showing {therapists.length} of {totalCount} therapists
          </div>
        )}
      </div>
    </div>
  );
}