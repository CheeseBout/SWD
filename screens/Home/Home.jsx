import React from "react";
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
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.welcomeText}>Hello, John!</Text>
          <Image
            style={styles.profileImage}
            source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
          />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#fff" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for services..."
            placeholderTextColor="rgba(255,255,255,0.7)"
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>

        <View style={styles.upcomingEvent}>
          <View style={styles.eventHeader}>
            <View style={styles.eventDate}>
              <Text style={styles.eventDay}>24</Text>
              <Text style={styles.eventMonth}>Jun</Text>
            </View>
            <View>
              <Text style={styles.eventTitle}>Pre-Marriage Counseling</Text>
              <View style={styles.eventDetails}>
                <Ionicons name="location" size={14} color="#666" />
                <Text style={styles.eventLocation}>Marriage Center</Text>
                <Ionicons name="time" size={14} color="#666" />
                <Text style={styles.eventTime}>10:00 AM</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Services</Text>

        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("SearchTherapist")}
          >
            <View style={styles.cardImage} />
            <Text style={styles.cardTitle}>Counseling</Text>
            <Text style={styles.cardDescription}>Expert marriage advice</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <View style={styles.cardImage} />
            <Text style={styles.cardTitle}>Planning</Text>
            <Text style={styles.cardDescription}>Plan your big day</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <View style={styles.cardImage} />
            <Text style={styles.cardTitle}>Venues</Text>
            <Text style={styles.cardDescription}>Find perfect venues</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <View style={styles.cardImage} />
            <Text style={styles.cardTitle}>Legal Help</Text>
            <Text style={styles.cardDescription}>Marriage documents</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
