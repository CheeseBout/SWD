import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const cardWidth = (width - 50) / 2;

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
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#7a93ef",
  },
  searchContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    paddingLeft: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 20,
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: cardWidth,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardDescription: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  upcomingEvent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  eventDate: {
    width: 50,
    height: 50,
    backgroundColor: "#4a6ee0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  eventDay: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  eventMonth: {
    color: "#fff",
    fontSize: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  eventDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  eventLocation: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  eventTime: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
    marginLeft: 15,
  },
  bottomNavigation: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingVertical: 12,
    justifyContent: "space-around",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 5,
    color: "#888",
  },
  activeNavText: {
    color: "#4a6ee0",
  },
});
