import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 260,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    width: width - 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f5f5f7",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#4a6ee0",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#a5b7e9",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  footerLink: {
    color: "#4a6ee0",
    fontSize: 14,
    fontWeight: "bold",
  },
});
