import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default function TopicCard({ topic }) {
  return (
    <Link to={`/topics/${topic._id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={topic.imageUrl || "https://placehold.co/400x300"}
            alt={topic.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{topic.name}</h3>
          <p className="text-gray-600 text-sm">{topic.description}</p>
          <div className="mt-2 text-sm text-gray-500">
            {topic.quiz?.length || 0} Quizzes
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
