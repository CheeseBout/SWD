import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f7",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  changeButton: {
    backgroundColor: "#4a6ee0",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  changeButtonDisabled: {
    backgroundColor: "#a5b7e9",
  },
  changeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
