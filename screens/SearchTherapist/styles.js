import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },

  // Search Section Styles
  searchSection: {
    marginBottom: 30,
  },
  searchTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  searchSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
    backgroundColor: "#f5f5f5",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#4a6ee0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Process Section Styles
  processSection: {
    paddingTop: 10,
  },
  processTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  processStep: {
    flexDirection: "row",
    marginBottom: 25,
  },
  stepNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4a6ee0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    marginTop: 2,
  },
  stepNumber: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
  },
});
