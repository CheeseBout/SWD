import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Calendar } from "react-native-calendars";
import { styles } from "./styles";
import { useAuth } from "../../context/AuthContext";
import reservationServices from "../../services/reservationServices";
import Ionicons from "@expo/vector-icons/Ionicons";

export const CalendarScreen = ({ navigation }) => {
  const [selected, setSelected] = useState("");
  const [events, setEvents] = useState({});
  const [markedDates, setMarkedDates] = useState({});
  const { userInfo } = useAuth();
  const user = userInfo?.data?.user || {};

  // Fetch reservations from API
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        if (!user._id) return;

        const response = await reservationServices.getAllReservationByUser(
          user._id
        );
        const reservations = response.data?.reservations || [];

        console.log("Reservations fetched:", reservations.length);

        // Process reservations into calendar events
        const eventsByDate = {};
        const marks = {};

        reservations.forEach((reservation) => {
          // Get date without time
          const startDate = new Date(reservation.startTime);
          const dateString = startDate.toISOString().split("T")[0];

          // Add to events by date
          if (!eventsByDate[dateString]) {
            eventsByDate[dateString] = [];
          }
          eventsByDate[dateString].push({
            id: reservation._id,
            title: reservation.title,
            content: reservation.content,
            time: formatTime(startDate),
            endTime: formatTime(new Date(reservation.endTime)),
            status: reservation.status,
            meetingURL: reservation.meetingURL,
            fullReservation: reservation,
          });

          // Add to marked dates with color based on status
          let dotColor = "#2E66E7"; // default blue
          if (reservation.status === "completed") dotColor = "#4caf50";
          else if (reservation.status === "denied") dotColor = "#f44336";
          else if (reservation.status === "pending") dotColor = "#ff9800";

          marks[dateString] = {
            marked: true,
            dotColor: dotColor,
          };
        });

        setEvents(eventsByDate);
        setMarkedDates(marks);

        // Set today as the selected date initially
        const today = new Date().toISOString().split("T")[0];
        setSelected(today);
      } catch (error) {
        console.error("Error fetching reservations for calendar:", error);
      }
    };

    fetchReservations();
  }, [user._id]);

  // Helper function to format time
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper function to format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#4caf50";
      case "denied":
        return "#f44336";
      case "pending":
        return "#ff9800";
      default:
        return "#2E66E7";
    }
  };

  // Update marked dates when a date is selected
  const handleDayPress = (day) => {
    const updatedMarkedDates = { ...markedDates };

    // Remove selection from previous date
    if (selected && updatedMarkedDates[selected]) {
      updatedMarkedDates[selected] = {
        ...updatedMarkedDates[selected],
        selected: false,
      };
    }

    // Add selection to new date
    updatedMarkedDates[day.dateString] = {
      ...updatedMarkedDates[day.dateString],
      selected: true,
      selectedColor: "#2E66E7",
    };

    setMarkedDates(updatedMarkedDates);
    setSelected(day.dateString);
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          backgroundColor: "#ffffff",
          calendarBackground: "#ffffff",
          textSectionTitleColor: "#b6c1cd",
          selectedDayBackgroundColor: "#2E66E7",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#2E66E7",
          dayTextColor: "#2d4150",
          dotColor: "#2E66E7",
          selectedDotColor: "#ffffff",
          arrowColor: "#2E66E7",
          monthTextColor: "#2d4150",
          textDayFontWeight: "300",
          textMonthFontWeight: "bold",
          textDayHeaderFontWeight: "300",
        }}
      />

      {selected && (
        <View style={styles.eventsContainer}>
          <Text style={styles.dateText}>{formatDisplayDate(selected)}</Text>
          <ScrollView>
            {events[selected] && events[selected].length > 0 ? (
              events[selected].map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={[
                    styles.eventCard,
                    { borderLeftColor: getStatusColor(event.status) },
                  ]}
                  onPress={() =>
                    navigation.navigate("ReservationDetails", {
                      reservation: event.fullReservation,
                    })
                  }
                >
                  <View style={styles.timeContainer}>
                    <Text style={styles.eventTime}>{event.time}</Text>
                    <Text style={styles.eventEndTime}>to {event.endTime}</Text>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(event.status) },
                      ]}
                    />
                    <Text style={styles.statusText}>
                      {event.status.charAt(0).toUpperCase() +
                        event.status.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventContent} numberOfLines={2}>
                      {event.content}
                    </Text>
                    {event.meetingURL && event.status !== "denied" && (
                      <View style={styles.meetingLink}>
                        <Ionicons name="videocam" size={14} color="#2E66E7" />
                        <Text style={styles.meetingText}>
                          Meeting Available
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noEventsText}>
                No reservations for this day
              </Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};
