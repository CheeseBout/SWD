import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default function TopicCard({ topic }) {
  return (
    <Link to={`/topics/${topic._id}`} className="block group h-full">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full transform group-hover:scale-[1.02] flex flex-col">
        <div className="relative">
          <div className="aspect-w-16 aspect-h-9 bg-gray-100">
            <img
              src={topic.imageUrl || "https://placehold.co/400x300"}
              alt={topic.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://placehold.co/400x300";
              }}
            />
          </div>
          
          <div className="absolute top-3 right-3">
            <span className="bg-blue-600/90 backdrop-blur-sm text-white text-xs font-medium py-1 px-2 rounded-full">
              {topic.quiz?.length || 0} {topic.quiz?.length === 1 ? 'Quiz' : 'Quizzes'}
            </span>
          </div>
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex-grow">
            <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
              {topic.name}
            </h3>
            <p className="text-gray-500 text-sm line-clamp-2">
              {topic.description}
            </p>
          </div>
          
          <div className="flex items-center text-blue-600 text-sm font-medium mt-4 pt-2 border-t border-gray-100">
            <span>Explore topic</span>
            <svg 
              className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

TopicCard.propTypes = {
  topic: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    quiz: PropTypes.array,
  }).isRequired,
};
