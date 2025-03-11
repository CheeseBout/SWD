import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./styles";
import topicServices from "../../services/topicServices";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function QuizList({ navigation }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchTopics();
      return () => {};
    }, [])
  );

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await topicServices.getAllTopics();
      console.log("Topics API Response:", JSON.stringify(response, null, 2));

      // Handle the specific response format we're getting:
      // {"data": {"topics": [...]}, "message": "Success", "status": 200}
      if (response && response.data && response.data.topics) {
        // Direct format from service.js
        setTopics(response.data.topics);
        setError(null);
      } else if (
        response &&
        response.status === 200 &&
        response.data &&
        response.data.topics
      ) {
        // Alternative format
        setTopics(response.data.topics);
        setError(null);
      } else if (
        response &&
        response.data &&
        response.data.data &&
        response.data.data.topics
      ) {
        // Nested format
        setTopics(response.data.data.topics);
        setError(null);
      } else {
        console.error("Invalid response format:", response);
        setError("Failed to load topics");
      }
    } catch (err) {
      console.error("Error fetching topics:", err);
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicId) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  const getQuestionCount = (quiz) => {
    return quiz.questions ? quiz.questions.length : 0;
  };

  const estimateDuration = (questionsCount) => {
    return `${questionsCount} min`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6ee0" />
        <Text style={styles.loadingText}>Loading quizzes...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTopics}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Compatibility Quizzes</Text>
        <Text style={styles.headerSubtitle}>
          Assess your relationship compatibility through our expert-designed
          quizzes
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {topics.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No quizzes available</Text>
          </View>
        ) : (
          topics.map((topic) => {
            // Debug logging
            console.log(
              `Rendering topic: ${topic.name}, quiz data:`,
              topic.quiz
            );

            return (
              <View key={topic._id} style={styles.topicContainer}>
                <TouchableOpacity
                  style={styles.topicHeader}
                  onPress={() => toggleTopic(topic._id)}
                >
                  {topic.imageUrl && (
                    <Image
                      source={{ uri: topic.imageUrl }}
                      style={styles.topicImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.topicTitleContainer}>
                    <Text style={styles.topicTitle}>{topic.name}</Text>
                    <Text
                      style={styles.topicDescription}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {topic.description}
                    </Text>
                  </View>
                  <Ionicons
                    name={
                      expandedTopics[topic._id] ? "chevron-up" : "chevron-down"
                    }
                    size={24}
                    color="#4a6ee0"
                  />
                </TouchableOpacity>

                {expandedTopics[topic._id] &&
                  topic.quiz &&
                  topic.quiz.length > 0 && (
                    <View style={styles.quizListContainer}>
                      {topic.quiz
                        .filter((quiz) => quiz.status === "active")
                        .map((quiz) => {
                          const questionCount = getQuestionCount(quiz);
                          return (
                            <TouchableOpacity
                              key={quiz._id}
                              style={styles.quizItem}
                              onPress={() =>
                                navigation.navigate("QuizDetails", {
                                  quizId: quiz._id,
                                  quizName: quiz.quizName,
                                })
                              }
                            >
                              {quiz.imageUrl && (
                                <Image
                                  source={{ uri: quiz.imageUrl }}
                                  style={styles.quizImage}
                                />
                              )}
                              <View style={styles.quizInfo}>
                                <Text style={styles.quizTitle}>
                                  {quiz.quizName}
                                </Text>
                                <View style={styles.quizMeta}>
                                  <View style={styles.quizMetaItem}>
                                    <Ionicons
                                      name="help-circle-outline"
                                      size={14}
                                      color="#666"
                                    />
                                    <Text style={styles.quizMetaText}>
                                      {questionCount} questions
                                    </Text>
                                  </View>
                                  <View style={styles.quizMetaItem}>
                                    <Ionicons
                                      name="time-outline"
                                      size={14}
                                      color="#666"
                                    />
                                    <Text style={styles.quizMetaText}>
                                      {estimateDuration(questionCount)}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                              <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#999"
                              />
                            </TouchableOpacity>
                          );
                        })}
                    </View>
                  )}

                {expandedTopics[topic._id] &&
                  (!topic.quiz ||
                    topic.quiz.length === 0 ||
                    !topic.quiz.some((q) => q.status === "active")) && (
                    <View style={styles.emptyQuizContainer}>
                      <Text style={styles.emptyQuizText}>
                        No active quizzes in this topic
                      </Text>
                    </View>
                  )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
