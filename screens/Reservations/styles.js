import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    backgroundColor: "#4a6ee0",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
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
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginVertical: 15,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 15,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    marginTop: 15,
    marginBottom: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#4a6ee0",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    fontWeight: "600",
    color: "#4a6ee0",
  },
  listContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  reservationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 10,
  },
  therapistInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  therapistImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  reservationTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  therapistName: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  dateTimeContainer: {
    marginBottom: 10,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  dateTimeText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  contentText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    lineHeight: 20,
  },
  deniedReasonContainer: {
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  deniedReasonLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#B91C1C",
    marginBottom: 2,
  },
  deniedReasonText: {
    fontSize: 13,
    color: "#B91C1C",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4a6ee0",
  },
  packageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  packageLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
});
