import React, { useEffect } from "react";
import axios from "axios";
import TopicCard from "./TopicCard";

export default function TopicList() {
  const [topics, setTopics] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const API = import.meta.env.VITE_API_GET_ALL_TOPICS_ENDPOINT;

  const fetchData = async () => {
    try {
      console.log("Fetching topics...");
      setLoading(true);
      const response = await axios.get(API);
      console.log("Raw response:", response.data);
      
      if (response.data?.data?.topics) {
        setTopics(response.data.data.topics);
        console.log("Topics set:", response.data.data.topics);
      } else {
        setTopics([]);
        console.log("No topics found in response");
      }
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        status: error.response?.status
      });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeTopics = topics.filter(topic => topic.status === 'active');

  if (loading) return <div>Loading...</div>;
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
