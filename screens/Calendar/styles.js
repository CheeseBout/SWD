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
    alignItems: "center",
  },
  eventTime: {
    color: "#2E66E7",
    fontWeight: "bold",
    marginRight: 10,
    width: 80,
  },
  eventTitle: {
    fontSize: 16,
    flex: 1,
  },
  noEventsText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
});
