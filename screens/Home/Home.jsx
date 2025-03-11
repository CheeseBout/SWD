import React, { useEffect } from "react";
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

  useEffect(() => {
    console.log("Full userInfo in Home:", userInfo);
  }, [userInfo]);

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
