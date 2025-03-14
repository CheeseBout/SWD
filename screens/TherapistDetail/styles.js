import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    marginRight: 15,
  },
  therapistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  specialty: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  statText: {
    color: "#666",
    fontSize: 14,
    marginLeft: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    marginTop: 10,
  },
  aboutText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoIcon: {
    marginRight: 10,
    width: 24,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 15,
    color: "#666",
    width: 100,
  },
  infoValue: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  availabilityItem: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginVertical: 5,
  },
  availabilityText: {
    fontSize: 14,
    color: "#333",
  },
  noAvailabilityText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
  },
  reviewContainer: {
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  reviewerName: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#333",
  },
  reviewDate: {
    fontSize: 12,
    color: "#777",
    marginLeft: "auto",
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  bookButton: {
    backgroundColor: "#4a6ee0",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionDivider: {
    height: 8,
    backgroundColor: "#f5f5f5",
    marginVertical: 15,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#4E9CAF",
  },
  tabText: {
    fontSize: 16,
  },
  activeTabText: {
    fontWeight: "bold",
    color: "#4E9CAF",
  },
  inactiveTabText: {
    fontWeight: "normal",
    color: "#666",
  },
});
