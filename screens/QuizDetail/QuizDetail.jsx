import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { styles } from "./styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../../context/AuthContext";
import quizServices from "../../services/quizServices";
import questionServices from "../../services/questionServices";
import { LinearGradient } from "expo-linear-gradient";

export default function QuizDetail({ route, navigation }) {
  const { quizId, quizName } = route.params;
  const { userInfo } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    fetchQuizDetails();

    return () => {
      // Clean up to prevent state updates after unmounting
      setIsMounted(false);
    };
  }, []);

  const fetchQuizDetails = async () => {
    if (!isMounted) return;

    try {
      setLoading(true);
      const response = await quizServices.getQuizById(quizId);

      if (!isMounted) return;

      if (response.data && response.data.status === 200) {
        const quizData = response.data.data.quiz;
        setQuiz(quizData);

        // Check if the quiz has complete question objects
        if (
          quizData.questions &&
          Array.isArray(quizData.questions) &&
          quizData.questions.length > 0 &&
          quizData.questions[0].questionContent &&
          quizData.questions[0].options
        ) {
          setQuestions(quizData.questions);
        } else if (quizData.questions && quizData.questions.length > 0) {
          // Fetch questions if needed
          await fetchQuestionsDirectly(quizData.questions);
        } else {
          setError("This quiz has no questions");
        }
      } else {
        setError("Failed to load quiz details");
      }
    } catch (err) {
      console.error("Error fetching quiz details:", err);
      if (isMounted) {
        setError("Network error. Please try again later.");
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  // Simplified question fetching
  const fetchQuestionsDirectly = async (questionsList) => {
    if (!isMounted) return;

    try {
      // First try: fetch questions for the specific quiz
      try {
        const quizQuestionsResponse = await questionServices.getQuizQuestions(
          quizId
        );

        if (quizQuestionsResponse.data?.status === 200) {
          const responseData = quizQuestionsResponse.data.data;
          let fetchedQuestions;

          if (Array.isArray(responseData)) {
            fetchedQuestions = responseData;
          } else if (
            responseData.questions &&
            Array.isArray(responseData.questions)
          ) {
            fetchedQuestions = responseData.questions;
          } else if (responseData.data && Array.isArray(responseData.data)) {
            fetchedQuestions = responseData.data;
          }

          if (fetchedQuestions?.length > 0) {
            setQuestions(fetchedQuestions);
            return;
          }
        }
      } catch (e) {
        // Just continue with the next approach
      }

      // Second try: get question IDs and fetch them individually
      const questionIds = questionsList.map((q) =>
        typeof q === "string" ? q : q._id
      );
      const fetchedQuestions = [];

      for (const questionId of questionIds) {
        try {
          const questionResponse = await questionServices.getQuestionById(
            questionId
          );

          if (questionResponse.data?.status === 200) {
            let questionData = questionResponse.data.data;

            if (questionData.question) questionData = questionData.question;
            else if (questionData.data) questionData = questionData.data;

            if (questionData.questionContent && questionData.options) {
              fetchedQuestions.push(questionData);
            }
          }
        } catch (err) {
          // Continue with next question
        }
      }

      if (fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
      } else {
        // Last resort: check if original question objects have enough data
        if (
          questionsList[0]?._id &&
          (questionsList[0].questionContent ||
            (questionsList[0].question &&
              questionsList[0].question.questionContent))
        ) {
          setQuestions(questionsList.map((q) => q.question || q));
        } else {
          setError("No questions found for this quiz");
        }
      }
    } catch (err) {
      if (isMounted) {
        setError("Failed to load quiz questions");
      }
    }
  };

  const handleStartQuiz = () => {
    if (!isMounted) return;

    if (!quiz || !questions || questions.length === 0) {
      Alert.alert("Error", "This quiz doesn't have any questions yet.");
      return;
    }
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedOptions({});
  };

  const handleSelectOption = (questionId, optionId, score) => {
    setSelectedOptions({
      ...selectedOptions,
      [questionId]: { optionId, score },
    });
  };

  const handleNextQuestion = () => {
    const currentQuestionId = questions[currentQuestionIndex]._id;

    if (!selectedOptions[currentQuestionId]) {
      Alert.alert("Required", "Please select an option to continue.");
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed
      calculateScore();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let totalQuestions = questions.length;

    Object.values(selectedOptions).forEach((option) => {
      totalScore += option.score;
    });

    const finalScore = totalScore;
    setScore(finalScore);
    setQuizCompleted(true);

    // Format the answers and submit them
    const formattedAnswers = formatAnswersForSubmission();
    submitQuizResults(finalScore, formattedAnswers);
  };

  // New function to format answers for API
  const formatAnswersForSubmission = () => {
    // Convert the selectedOptions object to the required array format
    const formattedAnswers = Object.entries(selectedOptions).map(
      ([questionID, data]) => ({
        questionID,
        optionID: data.optionId,
      })
    );

    console.log("Formatted answers for submission:", formattedAnswers);
    return formattedAnswers;
  };

  const submitQuizResults = async (finalScore, formattedAnswers) => {
    try {
      console.log("Submitting quiz results:", {
        quizId,
        userId: userInfo?.data?.user?._id,
        answers: formattedAnswers,
        score: finalScore,
      });

      // Make the actual API call with the correctly formatted data
      const response = await quizServices.submitQuizResults(formattedAnswers);

      if (response.data && response.data.status === 200) {
        console.log("Quiz results submitted successfully");
      } else {
        console.warn("Quiz submission response:", response.data);
      }
    } catch (err) {
      console.error("Error submitting quiz results:", err);
      Alert.alert(
        "Error",
        "Your results were saved locally but couldn't be uploaded. Try again later."
      );
    }
  };

  const renderQuizIntro = () => (
    <ScrollView style={styles.content}>
      {quiz.imageUrl && (
        <Image
          source={{ uri: quiz.imageUrl }}
          style={styles.quizImage}
          resizeMode="cover"
        />
      )}

      <Text style={styles.quizTitle}>{quiz.quizName}</Text>

      <View style={styles.quizInfoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="help-circle" size={20} color="#4a6ee0" />
          <Text style={styles.infoText}>{questions.length} Questions</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time" size={20} color="#4a6ee0" />
          <Text style={styles.infoText}>~{questions.length} minutes</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.descriptionText}>{quiz.quizDescription}</Text>

      <Text style={styles.sectionTitle}>Instructions</Text>
      <Text style={styles.instructionText}>
        • Please answer all questions honestly for the most accurate results.
        {"\n"}• There are no right or wrong answers - this quiz helps assess
        compatibility.{"\n"}• Your responses are confidential and used only for
        generating your results.{"\n"}• You can take this quiz multiple times if
        needed.
      </Text>

      <TouchableOpacity style={styles.startButton} onPress={handleStartQuiz}>
        <LinearGradient colors={["#4a6ee0", "#6f8fef"]} style={styles.gradient}>
          <Text style={styles.buttonText}>Start Quiz</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderQuizQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <View style={styles.questionContainer}>
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
                }%`,
              },
            ]}
          />
        </View>

        <Text style={styles.questionNumber}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>

        <Text style={styles.questionText}>
          {currentQuestion.questionContent}
        </Text>

        <ScrollView style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => (
            <TouchableOpacity
              key={option._id}
              style={[
                styles.optionItem,
                selectedOptions[currentQuestion._id]?.optionId === option._id &&
                  styles.selectedOption,
              ]}
              onPress={() =>
                handleSelectOption(
                  currentQuestion._id,
                  option._id,
                  option.score
                )
              }
            >
              <Text
                style={[
                  styles.optionText,
                  selectedOptions[currentQuestion._id]?.optionId ===
                    option._id && styles.selectedOptionText,
                ]}
              >
                {option.optionContent}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.navigationButtons}>
          {currentQuestionIndex > 0 && (
            <TouchableOpacity
              style={styles.prevButton}
              onPress={handlePreviousQuestion}
            >
              <Ionicons name="arrow-back" size={20} color="#4a6ee0" />
              <Text style={styles.prevButtonText}>Previous</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex === questions.length - 1
                ? "Finish"
                : "Next"}
            </Text>
            <Ionicons
              name={
                currentQuestionIndex === questions.length - 1
                  ? "checkmark"
                  : "arrow-forward"
              }
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderQuizResults = () => {
    const maxPossibleScore = questions.length * 4; // Max score based on number of questions
    const percentage = (score / maxPossibleScore) * 100;

    let resultMessage = "";
    let resultColor = "";
    let resultTitle = "";

    if (percentage >= 85) {
      resultTitle = "High Compatibility";
      resultMessage =
        "Your responses indicate strong relationship compatibility. You share many important values and perspectives which can form a solid foundation for your relationship.";
      resultColor = "#4CAF50"; // Green
    } else if (percentage >= 70) {
      resultTitle = "Good Compatibility";
      resultMessage =
        "You have good compatibility in many areas. There are positive aspects in your relationship to build on, though some areas may benefit from open discussion.";
      resultColor = "#8BC34A"; // Light Green
    } else if (percentage >= 50) {
      resultTitle = "Moderate Compatibility";
      resultMessage =
        "You have moderate compatibility. While there are areas of alignment, consider discussing topics where your perspectives differ to better understand each other.";
      resultColor = "#FFC107"; // Amber
    } else {
      resultTitle = "Areas to Explore";
      resultMessage =
        "This assessment suggests some differences in perspectives. This isn't necessarily negative - discussing these differences openly can lead to growth and deeper understanding.";
      resultColor = "#FF9800"; // Orange (changed from deep orange to be less alarming)
    }

    return (
      <ScrollView contentContainerStyle={styles.resultsContainer}>
        <View style={styles.resultHeader}>
          <Ionicons name="heart-circle" size={60} color={resultColor} />
          <Text style={styles.resultTitle}>Assessment Complete</Text>
          <Text style={[styles.resultSubtitle, { color: resultColor }]}>
            {resultTitle}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Compatibility Score</Text>
          <Text style={[styles.scoreNumber, { color: resultColor }]}>
            {Math.round(percentage)}%
          </Text>
          <View style={styles.scoreBarContainer}>
            <View
              style={[
                styles.scoreBar,
                { width: `${percentage}%`, backgroundColor: resultColor },
              ]}
            />
          </View>
        </View>

        <Text style={styles.resultMessage}>{resultMessage}</Text>

        <View style={styles.resultTipsContainer}>
          <Text style={styles.resultTipsTitle}>What This Means</Text>
          <Text style={styles.resultTipsText}>
            This assessment is designed to help you understand areas of
            alignment and potential growth in your relationship. Remember that
            differences can strengthen a partnership when approached with
            understanding and respect.
          </Text>
          <Text style={styles.resultTipsText}>
            Consider discussing your results together and use them as a starting
            point for deeper conversations about your expectations, values, and
            goals.
          </Text>
        </View>

        <View style={styles.resultButtons}>
          <TouchableOpacity
            style={[styles.resultButton, styles.homeButton]}
            onPress={() => navigation.navigate("QuizList")}
          >
            <Ionicons name="list" size={20} color="#fff" />
            <Text style={styles.homeButtonText}>All Quizzes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const navigateBack = () => {
    // Use setTimeout to handle the navigation event after the current frame completes
    setTimeout(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("QuizList");
      }
    }, 0);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6ee0" />
        <Text style={styles.loadingText}>Loading quiz...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchQuizDetails}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (quizStarted && !quizCompleted) {
              Alert.alert(
                "Quit Quiz?",
                "Your progress will be lost. Are you sure you want to quit?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Quit", onPress: navigateBack },
                ]
              );
            } else {
              navigateBack();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {quizStarted ? "Quiz in Progress" : quiz?.quizName || "Quiz Details"}
        </Text>
      </View>

      {!quizStarted && !quizCompleted && renderQuizIntro()}
      {quizStarted && !quizCompleted && renderQuizQuestion()}
      {quizCompleted && renderQuizResults()}
    </SafeAreaView>
  );
}
