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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f7",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: "#333",
  },
  inputDisabled: {
    backgroundColor: "#f0f0f0",
    color: "#666",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f5f5f7",
  },
  picker: {
    height: 50,
  },
  saveButton: {
    backgroundColor: "#4a6ee0",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
