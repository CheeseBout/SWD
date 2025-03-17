import { StyleSheet } from "react-native";

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
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  therapistSection: {
    alignItems: "center",
    marginBottom: 30,
    paddingVertical: 20,
  },
  therapistImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  therapistName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  star: {
    marginHorizontal: 5,
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4a6ee0",
    textAlign: "center",
    marginBottom: 30,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  commentInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    height: 150,
    textAlignVertical: "top",
    fontSize: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  submitButton: {
    backgroundColor: "#4a6ee0",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
