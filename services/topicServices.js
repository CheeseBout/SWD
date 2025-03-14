import apiClient from "../configs/axiosConfig";

class TopicServices {
  async getAllTopics() {
    try {
      console.log("TopicService - Fetching topics...");
      const response = await apiClient.get("/topics");
      console.log(
        "TopicService - Raw response:",
        response.status,
        response.statusText
      );

      // Log the response structure
      if (response && response.data) {
        console.log(
          "TopicService - Response structure:",
          Object.keys(response.data),
          response.data.status,
          response.data.data
            ? Object.keys(response.data.data)
            : "no data object"
        );
      }

      const originalResponse = response.data;

      if (
        originalResponse &&
        originalResponse.data &&
        originalResponse.data.topics
      ) {
        const allTopics = originalResponse.data.topics;
        console.log(
          `TopicService - Total topics before filtering: ${allTopics.length}`
        );

        // Debug each topic's quiz array
        allTopics.forEach((topic, index) => {
          console.log(`Topic ${index + 1}: ${topic.name}`);
          if (topic.quiz && Array.isArray(topic.quiz)) {
            console.log(`  Has ${topic.quiz.length} quizzes`);
            topic.quiz.forEach((quiz, qIdx) => {
              console.log(
                `  Quiz ${qIdx + 1}: ${quiz.quizName}, status: ${quiz.status}`
              );
            });
          } else {
            console.log("  No quizzes or invalid quiz data");
          }
        });

        // Now filter for active quizzes
        const filteredTopics = allTopics.filter((topic) => {
          const hasActiveQuizzes =
            topic.quiz &&
            Array.isArray(topic.quiz) &&
            topic.quiz.some((quiz) => quiz.status === "active");
          return hasActiveQuizzes;
        });

        console.log(
          `TopicService - Topics after filtering: ${filteredTopics.length}`
        );

        // Additional check - filter the quizzes themselves to only show active ones
        const topicsWithActiveQuizzesOnly = filteredTopics.map((topic) => ({
          ...topic,
          quiz: topic.quiz.filter((quiz) => quiz.status === "active"),
        }));

        console.log("TopicService - Topics with only active quizzes:");
        topicsWithActiveQuizzesOnly.forEach((topic, index) => {
          console.log(
            `Topic ${index + 1}: ${topic.name} has ${
              topic.quiz.length
            } active quizzes`
          );
        });

        const filteredResponse = {
          ...originalResponse,
          data: {
            ...originalResponse.data,
            topics: topicsWithActiveQuizzesOnly, // Return topics with only active quizzes
          },
        };

        return filteredResponse;
      }

      return response.data;
    } catch (error) {
      console.error("TopicService - Error fetching topics:", error);
      throw error;
    }
  }
}

export default new TopicServices();
