import React, { useEffect } from "react";
import TopicCard from "./TopicCard";
import { topicService } from "../../services/api";
import PropTypes from 'prop-types';
import LoadingSpinner from "../common/LoadingSpinner";

export default function TopicList({ limit }) {
  const [topics, setTopics] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await topicService.getAllTopics();
      
      if (response?.data?.topics) {
        setTopics(response.data.topics);
      } else {
        setTopics([]);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeTopics = topics
    .filter(topic => topic.status === 'active')
    .slice(0, limit);

  if (loading) return <div><LoadingSpinner/></div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {activeTopics.length > 0 ? (
          activeTopics.map((topic) => (
            <TopicCard key={topic._id} topic={topic} />
          ))
        ) : (
          <div className="text-center text-gray-500">No active topics found</div>
        )}
      </div>
    </div>
  );
}

TopicList.propTypes = {
  limit: PropTypes.number
};

TopicList.defaultProps = {
  limit: Infinity
};
