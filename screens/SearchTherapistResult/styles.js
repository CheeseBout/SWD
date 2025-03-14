import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 16,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  sortContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: "#666",
  },
  sortButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortByText: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 6,
    backgroundColor: "#f0f0f0",
  },
  activeSortButton: {
    backgroundColor: "#4a6ee0",
  },
  sortButtonText: {
    fontSize: 12,
    color: "#666",
  },
  activeSortButtonText: {
    color: "#fff",
  },
  listContent: {
    paddingBottom: 20,
  },
  therapistCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  therapistImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  therapistInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  therapistName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginRight: 6,
  },
  therapistCategory: {
    fontSize: 14,
    color: "#4a6ee0",
    marginBottom: 4,
  },
  therapistLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  therapistDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
  },
  availableTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#e6f7ed",
  },
  availableText: {
    fontSize: 12,
    color: "#1d9a59",
    fontWeight: "500",
  },
  unavailableTag: {
    backgroundColor: "#f8e9e9",
  },
  unavailableText: {
    color: "#d93025",
    fontWeight: "500",
  },
  therapistSpecialty: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  reviewCount: {
    fontSize: 12,
    color: "#999",
    marginLeft: 2,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  searchButton: {
    backgroundColor: "#4a6ee0",
  },
});
