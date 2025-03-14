import { useState, useEffect } from 'react';
import { BlogCard } from '../../components/BlogCard';
import { blogService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

export function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const blogsPerPage = 9;

  useEffect(() => {
    async function fetchBlogs() {
      try {
        setLoading(true);
        const data = await blogService.getAllBlogs();
        
        if (data && Array.isArray(data)) {
          setBlogs(data);
          setTotalPages(Math.ceil(data.length / blogsPerPage));
          setError(null);
        } else if (data && data.data && Array.isArray(data.data)) {
          setBlogs(data.data);
          setTotalPages(Math.ceil(data.data.length / blogsPerPage));
          setError(null);
        } else {
          console.warn('Received unexpected data format:', data);
          setError('Received unexpected data format from the server.');
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Failed to load blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
  };

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const Pagination = () => {
    const pageNumbers = [];
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    if (currentPage <= 3) {
      endPage = Math.min(5, totalPages);
    } else if (currentPage >= totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex justify-center items-center space-x-1 my-8">
        <button 
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md ${
            currentPage === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 hover:bg-blue-50'
          } border border-gray-300`}
          aria-label="Previous page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {startPage > 1 && (
          <>
            <button 
              onClick={() => paginate(1)} 
              className={`px-3 py-1 rounded-md ${
                currentPage === 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'
              } border border-gray-300`}
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 py-1 text-gray-500">...</span>}
          </>
        )}
        
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`px-3 py-1 rounded-md ${
              currentPage === number ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'
            } border border-gray-300`}
          >
            {number}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 py-1 text-gray-500">...</span>}
            <button 
              onClick={() => paginate(totalPages)} 
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'
              } border border-gray-300`}
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button 
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md ${
            currentPage === totalPages 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 hover:bg-blue-50'
          } border border-gray-300`}
          aria-label="Next page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ErrorMessage message={error} />
        <button 
          onClick={handleRetry}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-8">Blog Posts</h1>
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-600 text-lg">No blog posts available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Latest Blog Posts</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our collection of articles on pre-marital counseling, relationship advice, and mental wellness
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentBlogs.map(blog => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
        
        {blogs.length > blogsPerPage && <Pagination />}
        
        <div className="text-center text-gray-500 text-sm mt-4">
          Showing {indexOfFirstBlog + 1}-{Math.min(indexOfLastBlog, blogs.length)} of {blogs.length} blog posts
        </div>
      </div>
    </div>
  );
}

export default BlogsPage;
