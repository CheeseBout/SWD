import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { fetchAvailabilityList } from "../../services/therapistServices";
import { styles } from "./styles";
import { useAuth } from "../../context/AuthContext";
import reservationServices from "../../services/reservationServices";
import packageServices from "../../services/packageServices";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";

export default function TherapistDetailScreen({ route, navigation }) {
  const [activeTab, setActiveTab] = useState(1);
  const { therapist } = route.params;
  const [packages, setPackages] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [therapistAvailability, setTherapistAvailability] = useState(null);
  const { userInfo } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(null);

  // New state for booking modal
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingData, setBookingData] = useState({
    title: "Marriage Counseling Session",
    content: "",
    startTime: new Date(),
    endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // Default 1 hour duration
    selectedTimeSlot: null,
  });
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          // Fetch availability
          const availabilityResponse = await fetchAvailabilityList(
            therapist._id
          );
          if (availabilityResponse && availabilityResponse.availability) {
            const allTimeSlots = availabilityResponse.availability.reduce(
              (acc, curr) => {
                return acc.concat(curr.timeAvailable || []);
              },
              []
            );

            // Filter out slots where isOccupied is true
            const availableTimeSlots = allTimeSlots.filter(
              (slot) => !slot.isOccupied
            );

            const sortedTimeSlots = availableTimeSlots.sort(
              (a, b) => new Date(a.startHour) - new Date(b.startHour)
            );

            setAvailabilities(sortedTimeSlots);
            setTherapistAvailability(availabilityResponse.therapist);
          }

          // Fetch packages
          const packageResponse = await packageServices.getPackageByTherapistId(
            therapist._id
          );
          if (packageResponse && packageResponse.status === 200) {
            const packageList = packageResponse.data || [];
            setPackages(packageList);
            console.log("Packages loaded:", packageList.length);

            // Set first package as default selected if packages exist
            if (packageList.length > 0) {
              setSelectedPackage(packageList[0]);
            }
          }
        } catch (error) {
          console.log("Error while fetching data", error);
        }
      };
      fetchData();
      return () => {}; // cleanup function (if needed)
    }, [therapist._id])
  );

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`star-${i}`} name="star" size={16} color="#FFD700" />
      );
    }

    // Add half star if needed
    if (halfStar) {
      stars.push(
        <Ionicons key="half-star" name="star-half" size={16} color="#FFD700" />
      );
    }

    // Add empty stars
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-star-${i}`}
          name="star-outline"
          size={16}
          color="#FFD700"
        />
      );
    }

    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  const renderCertificateStatus = (status) => {
    const statusColors = {
      approved: "#4CAF50",
      pending: "#FFC107",
      default: "#666",
    };
    const color = statusColors[status] || statusColors.default;
    return (
      <View
        style={[styles.certificateStatus, { backgroundColor: `${color}20` }]}
      >
        <Text style={[styles.certificateStatusText, { color }]}>
          {status
            ? status.charAt(0).toUpperCase() + status.slice(1)
            : "Processing"}
        </Text>
      </View>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTimeSlot = (startHour, endHour) => {
    const start = new Date(startHour);
    const end = new Date(endHour);

    const date = start.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    const startTime = start.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const endTime = end.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${date} • ${startTime} - ${endTime}`;
  };

  const handleBookingSubmit = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!bookingData.title.trim()) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please enter a title for your appointment",
        });
        setLoading(false);
        return;
      }

      // Validate package selection
      if (!selectedPackage) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please select a package to continue",
        });
        setLoading(false);
        return;
      }

      // Prepare reservation data
      const reservationData = {
        coupleTherapistID: therapist._id,
        title: bookingData.title,
        content: bookingData.content,
        startTime: bookingData.startTime.toISOString(),
        endTime: bookingData.endTime.toISOString(),
        packageID: selectedPackage._id,
      };

      // Call the API to create a reservation
      const response = await reservationServices.createReservation(
        reservationData
      );

      setLoading(false);
      setBookingModalVisible(false);

      if (response && response.status === 200) {
        // Fix: Use setTimeout to avoid navigation during state update
        setTimeout(() => {
          Alert.alert(
            "Success",
            "Your appointment has been booked successfully!",
            [
              {
                text: "OK",
                onPress: () => {
                  // Fix: Use requestAnimationFrame for smoother navigation
                  requestAnimationFrame(() => {
                    navigation.navigate("Reservations");
                  });
                },
              },
            ]
          );
        }, 100);
      } else {
        Alert.alert(
          "Error",
          response?.message || "Failed to book appointment. Please try again."
        );
      }
    } catch (error) {
      setLoading(false);
      console.error("Error booking appointment:", error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    }
  };

  const selectTimeSlot = (slot) => {
    setBookingData({
      ...bookingData,
      startTime: new Date(slot.startHour),
      endTime: new Date(slot.endHour),
      selectedTimeSlot: slot,
    });
    setBookingModalVisible(true);
  };

  // Render the content based on the active tab
  const renderTabs = (id) => {
    switch (id) {
      case 1:
        return (
          <View>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>
              {therapist.description || "No description provided"}
            </Text>

            <View style={styles.sectionDivider} />

            <Text style={styles.sectionTitle}>Information</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="mail-outline" size={20} color="#4a6ee0" />
              </View>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{therapist.userInfo.email}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="location-outline" size={20} color="#4a6ee0" />
              </View>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{therapist.userInfo.address}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="star" size={20} color="#4a6ee0" />
              </View>
              <Text style={styles.infoLabel}>Rating:</Text>
              <Text style={styles.infoValue}>
                {therapist.rating || "New"} ({therapist.reviewCount || 0}{" "}
                reviews)
              </Text>
            </View>

            <View style={styles.sectionDivider} />

            <Text style={styles.sectionTitle}>Certificates</Text>
            {therapist.certificates && therapist.certificates.length > 0 ? (
              therapist.certificates.map((cert, index) => (
                <View key={cert._id} style={styles.certificateItem}>
                  {cert.documentURL && (
                    <Image
                      source={{ uri: cert.documentURL }}
                      style={styles.certificateImage}
                    />
                  )}
                  <View style={styles.certificateInfo}>
                    <Text style={styles.certificateTitle}>{cert.title}</Text>
                    <Text style={styles.certificateCategory}>
                      {cert.category}
                    </Text>
                    <Text style={styles.certificateDate}>
                      Valid: {formatDate(cert.issuedDate)} -{" "}
                      {formatDate(cert.expiryDate)}
                    </Text>
                    {renderCertificateStatus(cert.status)}
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noCertificatesText}>
                No certificates uploaded
              </Text>
            )}
          </View>
        );
      case 2:
        return (
          <View>
            <Text style={styles.sectionTitle}>Reviews</Text>

            <View style={styles.reviewContainer}>
              <View style={styles.reviewHeader}>
                <Image
                  source={{
                    uri: "https://randomuser.me/api/portraits/women/22.jpg",
                  }}
                  style={styles.reviewerImage}
                />
                <Text style={styles.reviewerName}>Jane Doe</Text>
                <Text style={styles.reviewDate}>2 weeks ago</Text>
              </View>
              {renderStars(5)}
              <Text style={styles.reviewText}>
                Dr. {therapist.userInfo?.fullname?.split(" ")[1]} was incredibly
                helpful during our sessions. Their insights and advice really
                transformed my relationship. Highly recommended!
              </Text>
            </View>

            <View style={styles.reviewContainer}>
              <View style={styles.reviewHeader}>
                <Image
                  source={{
                    uri: "https://randomuser.me/api/portraits/men/43.jpg",
                  }}
                  style={styles.reviewerImage}
                />
                <Text style={styles.reviewerName}>John Smith</Text>
                <Text style={styles.reviewDate}>1 month ago</Text>
              </View>
              {renderStars(4.5)}
              <Text style={styles.reviewText}>
                Professional, attentive, and insightful. Our couples therapy
                sessions have made a significant positive impact on our
                communication.
              </Text>
            </View>
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.sectionTitle}>Available Time Slots</Text>
            <Text style={styles.availabilityHint}>
              Tap on a time slot to book an appointment
            </Text>
            {availabilities.length > 0 ? (
              availabilities.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.availabilityItem}
                  onPress={() => selectTimeSlot(slot)}
                >
                  <View style={styles.availabilityContent}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#4a6ee0"
                    />
                    <Text style={styles.availabilityText}>
                      {formatTimeSlot(slot.startHour, slot.endHour)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noAvailabilityContainer}>
                <Ionicons name="calendar" size={40} color="#ccc" />
                <Text style={styles.noAvailabilityText}>
                  No available time slots
                </Text>
              </View>
            )}
          </View>
        );
      default:
        return <Text>No information available</Text>;
    }
  };

  // Booking modal component
  const renderBookingModal = () => (
    <Modal
      visible={bookingModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setBookingModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book Appointment</Text>
            <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Therapist</Text>
            <View style={styles.therapistPreview}>
              <Image
                source={{ uri: therapist.userInfo.photoURL }}
                style={styles.smallTherapistImage}
              />
              <Text style={styles.therapistPreviewName}>
                {therapist.userInfo.fullname}
              </Text>
            </View>

            {/* Package Selection - Required */}
            <Text style={styles.inputLabel}>
              Select Package <Text style={styles.requiredMark}>*</Text>
            </Text>
            <View style={styles.packageList}>
              {packages.map((pkg) => (
                <TouchableOpacity
                  key={pkg._id}
                  style={[
                    styles.packageItem,
                    selectedPackage?._id === pkg._id && styles.selectedPackage,
                  ]}
                  onPress={() => setSelectedPackage(pkg)}
                >
                  <View style={styles.packageInfo}>
                    <Text style={styles.packageName}>{pkg.name}</Text>
                    <Text style={styles.packageDescription}>
                      {pkg.description}
                    </Text>
                    <View style={styles.packageMeta}>
                      <View style={styles.discountTag}>
                        <Text style={styles.discountText}>
                          {pkg.discount}% OFF
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.packagePrice}>
                    {pkg.price.toLocaleString("vi-VN")} VNĐ
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {packages.length === 0 && (
              <View style={styles.noPackagesContainer}>
                <Text style={styles.noPackagesText}>
                  No packages available for this therapist
                </Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Time Slot</Text>
            <View style={styles.timeSlotPreview}>
              <Ionicons name="time-outline" size={20} color="#4a6ee0" />
              <Text style={styles.timeSlotText}>
                {bookingData.selectedTimeSlot &&
                  formatTimeSlot(
                    bookingData.selectedTimeSlot.startHour,
                    bookingData.selectedTimeSlot.endHour
                  )}
              </Text>
            </View>

            <Text style={styles.inputLabel}>
              Title <Text style={styles.requiredMark}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={bookingData.title}
              onChangeText={(text) =>
                setBookingData({ ...bookingData, title: text })
              }
              placeholder="Enter appointment title"
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bookingData.content}
              onChangeText={(text) =>
                setBookingData({ ...bookingData, content: text })
              }
              placeholder="Describe your needs or concerns..."
              multiline={true}
              numberOfLines={4}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setBookingModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!selectedPackage || packages.length === 0) &&
                  styles.disabledButton,
              ]}
              onPress={handleBookingSubmit}
              disabled={loading || !selectedPackage || packages.length === 0}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Booking</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: therapist.userInfo.photoURL }}
              style={styles.therapistImage}
            />
            {therapist.userInfo.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.name}>{therapist.userInfo.fullname}</Text>
            <Text style={styles.category}>{therapist.category}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.statText}>
                  {therapist.rating || "New"}{" "}
                  {therapist.reviewCount > 0 && `(${therapist.reviewCount})`}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="school-outline" size={14} color="#666" />
                <Text style={styles.statText}>
                  {therapist.certificates?.length || 0} Certificates
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Tab navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab(1)}
          style={[styles.tabButton, activeTab === 1 && styles.activeTab]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 1 ? styles.activeTabText : styles.inactiveTabText,
            ]}
          >
            About
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab(2)}
          style={[styles.tabButton, activeTab === 2 && styles.activeTab]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 2 ? styles.activeTabText : styles.inactiveTabText,
            ]}
          >
            Reviews
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab(3)}
          style={[styles.tabButton, activeTab === 3 && styles.activeTab]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 3 ? styles.activeTabText : styles.inactiveTabText,
            ]}
          >
            Availability
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>{renderTabs(activeTab)}</ScrollView>

      {/* Book appointment button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() =>
            activeTab === 3
              ? Alert.alert(
                  "Select Time",
                  "Please select a time slot from the available options"
                )
              : setActiveTab(3)
          }
        >
          <Text style={styles.bookButtonText}>
            {activeTab === 3 ? "Select Time Slot" : "Book Appointment"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Booking modal */}
      {renderBookingModal()}
    </View>
  );
}
