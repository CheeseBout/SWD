import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  eventsContainer: {
    marginTop: 20,
    flex: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2d4150",
  },
  eventCard: {
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#2E66E7",
    flexDirection: "row",
  },
  timeContainer: {
    width: 80,
    marginRight: 15,
  },
  eventTime: {
    color: "#2E66E7",
    fontWeight: "bold",
  },
  eventEndTime: {
    color: "#777",
    fontSize: 12,
    marginTop: 2,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  eventContent: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
  },
  noEventsText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
  meetingLink: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  meetingText: {
    fontSize: 12,
    color: "#2E66E7",
    marginLeft: 5,
    fontWeight: "500",
  },
});
