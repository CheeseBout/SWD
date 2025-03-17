import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import { useAuth } from "../../context/AuthContext";
import reservationServices from "../../services/reservationServices";
const { useFocusEffect } = require("@react-navigation/native");

export default function ReservationsScreen({ navigation }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'pending', 'approved', 'denied'
  const { userInfo } = useAuth();
  useFocusEffect(
    useCallback(() => {
      fetchReservations();
      return () => {}; // cleanup function (if needed)
    }, [])
  );

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await reservationServices.getAllReservationByUser(
        userInfo.data.user._id
      );

      if (response && response.status === 200) {
        // Update to use the new response format where reservations are in data.reservations
        setReservations(response.data.reservations || []);
      } else {
        setError("Failed to load reservations");
      }
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setError("An error occurred while loading your reservations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservations();
  };

  const filterReservationsByStatus = (status) => {
    if (status === "all") return reservations;
    return reservations.filter((reservation) => reservation.status === status);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
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
      case "confirmed": // Add this case to use the same green color
        return "#4CAF50";
      case "deposited":
        return "#4CAF50";
      case "pending":
        return "#FFC107";
      case "denied":
        return "#F44336";
      case "completed":
        return "#4CAF50";
      default:
        return "#757575";
    }
  };

  const renderReservationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.reservationCard}
      onPress={() =>
        navigation.navigate("ReservationDetails", { reservation: item })
      }
    >
      <View style={styles.cardHeader}>
        <View style={styles.therapistInfo}>
          {item.coupleTherapistID?.photoURL && (
            <Image
              source={{ uri: item.coupleTherapistID.photoURL }}
              style={styles.therapistImage}
            />
          )}
          <View style={styles.headerTextContainer}>
            <Text style={styles.reservationTitle}>{item.title}</Text>
            <Text style={styles.therapistName}>
              {item.coupleTherapistID?.fullname || "Unknown Therapist"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(item.status)}20` },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status === "confirmed"
              ? "Confirmed"
              : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.dateTimeContainer}>
        <View style={styles.dateTimeRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.dateTimeText}>{formatDate(item.startTime)}</Text>
        </View>
        <View style={styles.dateTimeRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.dateTimeText}>
            {formatTime(item.startTime)} - {formatTime(item.endTime)}
          </Text>
        </View>
      </View>

      {item.content && (
        <Text style={styles.contentText} numberOfLines={2}>
          {item.content}
        </Text>
      )}

      {item.status === "denied" && item.deniedReason && (
        <View style={styles.deniedReasonContainer}>
          <Text style={styles.deniedReasonLabel}>Reason:</Text>
          <Text style={styles.deniedReasonText}>{item.deniedReason}</Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        {item.packageID ? (
          <View style={styles.packageContainer}>
            <Text style={styles.packageLabel}>{item.packageID.name}</Text>
            <Text style={styles.priceText}>
              {item.totalPrice.toLocaleString("vi-VN")} VNĐ
            </Text>
          </View>
        ) : (
          <Text style={styles.priceText}>
            {item.totalPrice > 0
              ? item.totalPrice.toLocaleString("vi-VN") + " VNĐ"
              : "Free"}
          </Text>
        )}
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {["all", "pending", "confirmed", "deposited", "completed", "denied"].map(
        (tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );

  const filteredReservations = filterReservationsByStatus(activeTab);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6ee0" />
        <Text style={styles.loadingText}>Loading your reservations...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Reservations</Text>
      </View>

      {renderTabs()}

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchReservations}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : filteredReservations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>
            {activeTab === "all"
              ? "You don't have any reservations yet"
              : `You don't have any ${activeTab} reservations`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredReservations}
          keyExtractor={(item) => item._id}
          renderItem={renderReservationItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}
