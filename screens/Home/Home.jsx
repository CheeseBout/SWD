import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { styles } from "./styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../../context/AuthContext";
import reservationServices from "../../services/reservationServices";

const Icon = ({ name, size, color }) => (
  <View
    style={{
      width: size,
      height: size,
      backgroundColor: color || "#ddd",
      borderRadius: size / 2,
    }}
  />
);

export const HomeScreen = ({ navigation }) => {
  const { userInfo } = useAuth();
  const user = userInfo?.data?.user || {};
  const [reservations, setReservations] = useState([]);
  const [nextReservation, setNextReservation] = useState(null);

  useEffect(() => {
    console.log("Full userInfo in Home:", userInfo);
    const fetchReservationByUser = async () => {
      try {
        const response = await reservationServices.getAllReservationByUser(
          user._id
        );
        console.log("User Reservations:", response.data);
        if (response.data && response.data.reservations) {
          setReservations(response.data.reservations);

          // Find the next upcoming reservation (not completed/denied)
          const now = new Date();
          const upcoming = response.data.reservations
            .filter(
              (res) =>
                res.status !== "completed" &&
                res.status !== "denied" &&
                new Date(res.startTime) > now
            )
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

          if (upcoming.length > 0) {
            setNextReservation(upcoming[0]);
          } else {
            // If no upcoming events, get the most recent completed one
            const completed = response.data.reservations
              .filter((res) => res.status === "completed")
              .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

            if (completed.length > 0) {
              setNextReservation(completed[0]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };
    fetchReservationByUser();
  }, [userInfo]);

  // Format date for display
  const formatEventDate = (dateString) => {
    if (!dateString) return { day: "--", month: "---" };
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    return { day, month };
  };

  // Format time for display (12 hour format)
  const formatEventTime = (dateString) => {
    if (!dateString) return "--:--";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.welcomeText}>
            Hello, {user?.fullname || "Guest"}!
          </Text>
          <Image
            style={styles.profileImage}
            source={{
              uri: user.photoURL
                ? user.photoURL
                : user.gender === "male"
                ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEz1ve3QQhGM3EKWe1dDjnQAOqyMv0RUEcnw&s"
                : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxrd4dsitg-Rhwx0aUZsGjzqkZn34JbVC9-w&s",
            }}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>

        {nextReservation ? (
          <TouchableOpacity
            style={styles.upcomingEvent}
            onPress={() =>
              navigation.navigate("ReservationDetails", {
                reservation: nextReservation,
              })
            }
          >
            <View style={styles.eventHeader}>
              <View style={styles.eventDate}>
                <Text style={styles.eventDay}>
                  {formatEventDate(nextReservation.startTime).day}
                </Text>
                <Text style={styles.eventMonth}>
                  {formatEventDate(nextReservation.startTime).month}
                </Text>
              </View>
              <View>
                <Text style={styles.eventTitle}>{nextReservation.title}</Text>
                <View style={styles.eventDetails}>
                  <Ionicons name="location" size={14} color="#666" />
                  <Text style={styles.eventLocation}>Online Meeting</Text>
                  <Ionicons name="time" size={14} color="#666" />
                  <Text style={styles.eventTime}>
                    {formatEventTime(nextReservation.startTime)}
                  </Text>
                  <View
                    style={[
                      styles.statusIndicator,
                      {
                        backgroundColor:
                          nextReservation.status === "completed"
                            ? "#4caf50"
                            : nextReservation.status === "denied"
                            ? "#f44336"
                            : "#ff9800",
                      },
                    ]}
                  />
                  <Text style={styles.eventStatus}>
                    {nextReservation.status.charAt(0).toUpperCase() +
                      nextReservation.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.upcomingEvent}>
            <View style={styles.eventHeader}>
              <View style={styles.eventDate}>
                <Text style={styles.eventDay}>--</Text>
                <Text style={styles.eventMonth}>---</Text>
              </View>
              <View>
                <Text style={styles.eventTitle}>No upcoming events</Text>
                <View style={styles.eventDetails}>
                  <Ionicons name="calendar" size={14} color="#666" />
                  <Text style={styles.eventLocation}>Book a session now</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Services</Text>
        <View style={styles.mainServices}>
          <TouchableOpacity
            style={styles.mainServiceCard}
            onPress={() => navigation.navigate("SearchTherapist")}
          >
            <Ionicons name="people" size={40} color="#4a6ee0" />
            <Text style={styles.mainServiceTitle}>Counseling Service</Text>
            <Text style={styles.mainServiceDescription}>
              Connect with expert marriage counselors
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mainServiceCard}
            onPress={() => navigation.navigate("QuizList")}
          >
            <Ionicons name="clipboard" size={40} color="#4a6ee0" />
            <Text style={styles.mainServiceTitle}>Take Compatibility Quiz</Text>
            <Text style={styles.mainServiceDescription}>
              Assess your relationship compatibility
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
