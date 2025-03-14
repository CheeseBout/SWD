import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import reservationServices from "../../services/reservationServices";

export default function YourReservation({ route, navigation }) {
  const { reservation: initialReservation } = route.params;
  const [reservation, setReservation] = useState(initialReservation);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReservationDetails();
  }, []);

  const fetchReservationDetails = async () => {
    try {
      setLoading(true);
      const response = await reservationServices.getReservationById(
        reservation._id
      );
      if (response && response.status === "success") {
        setReservation(response.data);
      }
    } catch (error) {
      console.error("Error fetching reservation details:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
      case "confirmed": // Add confirmed status to use green color
        return "#4CAF50";
      case "deposited":
        return "#4CAF50";
      case "pending":
        return "#FFC107";
      case "denied":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  const handleCancelReservation = () => {
    Alert.alert(
      "Cancel Reservation",
      "Are you sure you want to cancel this reservation?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await reservationServices.cancelReservation(
                reservation._id
              );

              if (response && response.status === "success") {
                setLoading(false);
                // Fix: Use setTimeout to avoid race condition
                setTimeout(() => {
                  Alert.alert("Success", "Reservation cancelled successfully", [
                    {
                      text: "OK",
                      onPress: () => {
                        // Use requestAnimationFrame for navigation
                        requestAnimationFrame(() => {
                          navigation.goBack();
                        });
                      },
                    },
                  ]);
                }, 100);
              } else {
                setLoading(false);
                Alert.alert("Error", "Failed to cancel reservation");
              }
            } catch (error) {
              setLoading(false);
              Alert.alert(
                "Error",
                "An error occurred while cancelling the reservation"
              );
              console.error("Error cancelling reservation:", error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6ee0" />
        <Text style={styles.loadingText}>Loading reservation details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservation Details</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Therapist Info Section */}
        <View style={styles.therapistSection}>
          {reservation.coupleTherapistID?.photoURL && (
            <Image
              source={{ uri: reservation.coupleTherapistID.photoURL }}
              style={styles.therapistImage}
            />
          )}
          <View style={styles.therapistInfo}>
            <Text style={styles.therapistName}>
              {reservation.coupleTherapistID?.fullname || "Unknown Therapist"}
            </Text>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.statusSection}>
          <Text style={styles.statusLabel}>Status</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(reservation.status)}20` },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(reservation.status) },
              ]}
            >
              {reservation.status === "confirmed"
                ? "Confirmed"
                : reservation.status.charAt(0).toUpperCase() +
                  reservation.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Main Content Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{reservation.title}</Text>
          {reservation.content && (
            <Text style={styles.contentText}>{reservation.content}</Text>
          )}
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={20} color="#4a6ee0" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {formatDate(reservation.startTime)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="time-outline" size={20} color="#4a6ee0" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>
                {formatTime(reservation.startTime)} -{" "}
                {formatTime(reservation.endTime)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="cash-outline" size={20} color="#4a6ee0" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                {reservation.packageID ? "Package" : "Price"}
              </Text>
              {reservation.packageID ? (
                <View>
                  <Text style={styles.packageName}>
                    {reservation.packageID.name}
                  </Text>
                  <Text style={styles.priceValue}>
                    {reservation.totalPrice.toLocaleString("vi-VN")} VNĐ
                  </Text>
                </View>
              ) : (
                <Text style={styles.priceValue}>
                  {reservation.totalPrice > 0
                    ? reservation.totalPrice.toLocaleString("vi-VN") + " VNĐ"
                    : "Free"}
                </Text>
              )}
            </View>
          </View>

          {reservation.meetingURL && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="videocam-outline" size={20} color="#4a6ee0" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Meeting</Text>
                <TouchableOpacity>
                  <Text style={styles.meetingLink}>
                    {reservation.meetingURL}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {reservation.status === "denied" && reservation.deniedReason && (
          <View style={styles.deniedSection}>
            <Text style={styles.deniedTitle}>Reason for Denial</Text>
            <Text style={styles.deniedReason}>{reservation.deniedReason}</Text>
          </View>
        )}

        {reservation.status === "pending" && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelReservation}
          >
            <Ionicons name="close-circle-outline" size={20} color="#fff" />
            <Text style={styles.cancelButtonText}>Cancel Reservation</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
