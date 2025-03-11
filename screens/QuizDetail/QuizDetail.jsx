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

  useEffect(() => {
    fetchQuizDetails();
  }, []);

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);

      // Fetch quiz data
      const response = await quizServices.getQuizById(quizId);
      console.log("Quiz response:", JSON.stringify(response.data, null, 2));

      if (response.data && response.data.status === 200) {
        // Handle the new response format where quiz is directly in data.quiz
        const quizData = response.data.data.quiz;
        setQuiz(quizData);

        // Fetch all questions and filter for those in this quiz
        await fetchAllQuestions(quizData.questions);
      } else {
        setError("Failed to load quiz details");
      }
    } catch (err) {
      console.error("Error fetching quiz details:", err);
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllQuestions = async (questionIds) => {
    try {
      if (!questionIds || questionIds.length === 0) {
        setError("This quiz has no questions");
        return;
      }

      // Fetch all questions at once instead of one by one
      const questionsResponse = await questionServices.getAllQuestions();

      if (questionsResponse.data && questionsResponse.data.status === 200) {
        // Extract questions from the response
        const allQuestions = questionsResponse.data.data.data;

        // Filter questions that belong to this quiz
        const quizQuestions = allQuestions.filter((question) =>
          questionIds.includes(question._id)
        );

        console.log(`Found ${quizQuestions.length} questions for this quiz`);
        setQuestions(quizQuestions);

        if (quizQuestions.length === 0) {
          setError("No questions found for this quiz");
        }
      } else {
        setError("Failed to load quiz questions");
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to load quiz questions");
    }
  };

  const handleStartQuiz = () => {
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
                  { text: "Quit", onPress: () => navigation.goBack() },
                ]
              );
            } else {
              navigation.goBack();
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
