import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useState } from 'react';

export function BlogCard({ blog }) {
  const { title, category, author, coverPhoto, slug } = blog;
  const [imageError, setImageError] = useState(false);
  
  const defaultAvatar = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
  const defaultCoverPhoto = "https://www.beautylabinternational.com/wp-content/uploads/2020/03/Hero-Banner-Placeholder-Light-1024x480-1.png";
  
  return (
    <div className="group overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] flex flex-col h-full">
      <Link to={`/blogs/${slug}`} className="block overflow-hidden">
        <div className="relative h-52 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent z-10"></div>
          
          <img 
            src={coverPhoto || defaultCoverPhoto} 
            alt={title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              setImageError(true);
              e.target.src = defaultCoverPhoto;
            }}
          />
          
          <div className="absolute top-4 left-4 z-20">
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-blue-600/80 backdrop-blur-sm rounded-full">
              {category}
            </span>
          </div>
        </div>
      </Link>
      
      <div className="flex flex-col flex-grow p-5">
        <Link to={`/blogs/${slug}`} className="flex-grow">
          <h3 className="mb-3 text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
        </Link>
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={author?.avatar?.url || defaultAvatar}
              alt={author?.name || "Author"}
              className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
              onError={(e) => {e.target.src = defaultAvatar}}
            />
            <div className="ml-3">
              <span className="block text-sm font-medium text-gray-800">
                {author?.name || "Unknown Author"}
              </span>
              <span className="block text-xs text-gray-500">
                {blog.postDate ? new Date(blog.postDate).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : ""}
              </span>
            </div>
          </div>
          
          <Link to={`/blogs/${slug}`} className="inline-flex items-center text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors group">
            <span className="mr-1">Read</span>
            <svg 
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

BlogCard.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    postDate: PropTypes.string,
    slug: PropTypes.string.isRequired,
    category: PropTypes.string,
    author: PropTypes.shape({
      name: PropTypes.string,
      avatar: PropTypes.shape({
        id: PropTypes.string,
        url: PropTypes.string
      })
    }),
    coverPhoto: PropTypes.string
  }).isRequired
};
