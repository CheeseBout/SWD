import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4a6ee0",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4a6ee0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  // Quiz Intro Styles
  content: {
    flex: 1,
    padding: 20,
  },
  quizImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginBottom: 20,
  },
  quizTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  quizInfoContainer: {
    flexDirection: "row",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  infoText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
    color: "#333",
  },
  descriptionText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    marginBottom: 30,
  },
  startButton: {
    marginBottom: 30,
    borderRadius: 12,
    overflow: "hidden",
  },
  gradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 10,
  },

  // Quiz Question Styles
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    marginBottom: 15,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#4a6ee0",
    borderRadius: 3,
  },
  questionNumber: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 25,
    lineHeight: 26,
  },
  optionsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  optionItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedOption: {
    borderColor: "#4a6ee0",
    backgroundColor: "rgba(74, 110, 224, 0.05)",
  },
  optionText: {
    fontSize: 16,
    color: "#444",
  },
  selectedOptionText: {
    color: "#4a6ee0",
    fontWeight: "500",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 20,
  },
  prevButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  prevButtonText: {
    fontSize: 16,
    color: "#4a6ee0",
    marginLeft: 5,
  },
  nextButton: {
    backgroundColor: "#4a6ee0",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  nextButtonText: {
    fontSize: 16,
    color: "#fff",
    marginRight: 8,
    fontWeight: "500",
  },

  // Results Styles
  resultsContainer: {
    padding: 20,
    alignItems: "center",
  },
  resultHeader: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
    color: "#333",
  },
  resultSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  scoreContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 25,
  },
  scoreText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 15,
  },
  scoreBarContainer: {
    width: "100%",
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    marginBottom: 10,
  },
  scoreBar: {
    height: 10,
    borderRadius: 5,
  },
  scorePercentage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  resultMessage: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  resultTipsContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 25,
    width: "100%",
  },
  resultTipsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  resultTipsText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    marginBottom: 10,
  },
  resultButtons: {
    width: "100%",
    marginBottom: 30,
  },
  resultButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  homeButton: {
    backgroundColor: "#4a6ee0",
  },
  homeButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 8,
  },
  resultButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 30,
  },
  resultButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  restartButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#4a6ee0",
  },
  restartButtonText: {
    color: "#4a6ee0",
    fontWeight: "500",
    marginLeft: 8,
  },
  homeButton: {
    backgroundColor: "#4a6ee0",
  },
  homeButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 8,
  },
});
