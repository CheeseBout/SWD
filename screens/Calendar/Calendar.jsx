import { View, StyleSheet, Text, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { Calendar } from "react-native-calendars";
import { styles } from "./styles";

export const CalendarScreen = () => {
  const [selected, setSelected] = useState("");
  const [events, setEvents] = useState({});

  // Sample events data - in a real app, you might fetch this from an API
  useEffect(() => {
    // Example events data
    const sampleEvents = {
      "2025-02-28": [
        { id: 1, title: "Meeting with client", time: "10:00 AM" },
        { id: 2, title: "Lunch with team", time: "1:00 PM" },
      ],
      "2025-02-27": [{ id: 3, title: "Doctor appointment", time: "9:30 AM" }],
    };

    setEvents(sampleEvents);
  }, []);

  // Create marked dates for the calendar
  const markedDates = {};
  Object.keys(events).forEach((date) => {
    markedDates[date] = {
      marked: true,
      dotColor: "#2E66E7",
    };
  });

  // Add selected date marking
  if (selected) {
    markedDates[selected] = {
      ...markedDates[selected],
      selected: true,
      selectedColor: "#2E66E7",
    };
  }

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => {
          setSelected(day.dateString);
        }}
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
          <Text style={styles.dateText}>Reservation {selected}</Text>
          <ScrollView>
            {events[selected] ? (
              events[selected].map((event) => (
                <View key={event.id} style={styles.eventCard}>
                  <Text style={styles.eventTime}>{event.time}</Text>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                </View>
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
