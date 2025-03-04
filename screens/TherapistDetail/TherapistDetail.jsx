import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";

export default function TherapistDetailScreen({ route, navigation }) {
  // State to track the selected tab
  const [activeTab, setActiveTab] = useState(1);
  const { therapist } = route.params;

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

  // Render the content based on the active tab
  const renderTabs = (id) => {
    switch (id) {
      case 1:
        return (
          <View>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>
              {therapist.name} is a licensed therapist specializing in{" "}
              {therapist.specialty}. With {therapist.experience} of professional
              experience, they have helped numerous clients overcome challenges
              and improve their relationships.
            </Text>

            <View style={styles.sectionDivider} />

            <Text style={styles.sectionTitle}>Information</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="time-outline" size={20} color="#4a6ee0" />
              </View>
              <Text style={styles.infoLabel}>Experience:</Text>
              <Text style={styles.infoValue}>{therapist.experience}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="location-outline" size={20} color="#4a6ee0" />
              </View>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{therapist.location}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="star" size={20} color="#4a6ee0" />
              </View>
              <Text style={styles.infoLabel}>Rating:</Text>
              <Text style={styles.infoValue}>
                {therapist.rating} ({therapist.reviews} reviews)
              </Text>
            </View>
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
                Dr. {therapist.name.split(" ")[1]} was incredibly helpful during
                our sessions. Their insights and advice really transformed my
                relationship. Highly recommended!
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
            <Text style={styles.sectionTitle}>Services Offered</Text>

            <View style={styles.servicesContainer}>
              <View style={styles.serviceItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4a6ee0" />
                <Text style={styles.serviceText}>Individual Therapy</Text>
              </View>

              <View style={styles.serviceItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4a6ee0" />
                <Text style={styles.serviceText}>Couples Counseling</Text>
              </View>

              <View style={styles.serviceItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4a6ee0" />
                <Text style={styles.serviceText}>{therapist.specialty}</Text>
              </View>

              <View style={styles.serviceItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4a6ee0" />
                <Text style={styles.serviceText}>
                  Online Sessions Available
                </Text>
              </View>

              <View style={styles.serviceItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4a6ee0" />
                <Text style={styles.serviceText}>In-person Consultations</Text>
              </View>
            </View>
          </View>
        );
      default:
        return <Text>No information available</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: therapist.image }}
              style={styles.therapistImage}
            />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.name}>{therapist.name}</Text>
            <Text style={styles.specialty}>{therapist.specialty}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.statText}>{therapist.rating}</Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="chatbubble-outline" size={14} color="#666" />
                <Text style={styles.statText}>{therapist.reviews} Reviews</Text>
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
            Services
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>{renderTabs(activeTab)}</ScrollView>

      {/* Book appointment button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
