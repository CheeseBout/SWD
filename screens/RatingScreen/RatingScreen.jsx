import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import ratingServices from "../../services/ratingServices";
import { useAuth } from "../../context/AuthContext";

export default function RatingScreen({ route, navigation }) {
  const { reservation, therapist } = route.params;
  const { userInfo } = useAuth();

  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("RatingScreen - Reservation:", reservation._id);
    console.log("RatingScreen - Therapist:", therapist._id);
    console.log("RatingScreen - User:", userInfo?.data?.user?._id);

    // Check if user has already rated this therapist for this reservation
    checkExistingRating();
  }, []);

  const checkExistingRating = async () => {
    try {
      setLoading(true);
      const response = await ratingServices.checkRatingForReservation(
        therapist._id
      );

      console.log("Rating check response:", response);

      // Chỉ hiển thị thông báo đã đánh giá nếu response có hasRated = true
      // và có dữ liệu trong response
      if (response && response.hasRated === true && response.data) {
        Alert.alert(
          "Already Rated",
          "You have already submitted a rating for this session.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        console.log("No rating found, user can submit rating");
      }
    } catch (error) {
      console.error("Error checking existing rating:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (rating < 1) {
      Alert.alert("Error", "Please select a rating");
      return;
    }

    setLoading(true);

    try {
      // Format the rating data according to your API requirements
      const ratingData = {
        userID: reservation.userID._id,
        coupleTherapistID: therapist._id,
        reservationID: reservation._id, // Include reservation ID
        rate: rating, // Make sure field name matches API expectation
        content: content.trim(),
      };

      console.log("Submitting rating:", JSON.stringify(ratingData, null, 2));

      const response = await ratingServices.submitRating(ratingData);

      if (response && (response.status === 200 || response.status === 201)) {
        Alert.alert("Success", "Thank you for your feedback!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert(
          "Error",
          response?.message || "Failed to submit your rating"
        );
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ...rest of the component remains the same...
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={40}
            color={i <= rating ? "#FFD700" : "#ccc"}
            style={styles.star}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Therapist</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.therapistSection}>
          {therapist.photoURL && (
            <Image
              source={{ uri: therapist.photoURL }}
              style={styles.therapistImage}
            />
          )}
          <Text style={styles.therapistName}>{therapist.fullname}</Text>
        </View>

        <Text style={styles.ratingLabel}>How was your session?</Text>

        <View style={styles.starsContainer}>{renderStars()}</View>

        <Text style={styles.ratingValue}>
          {rating === 5
            ? "Excellent!"
            : rating === 4
            ? "Very Good"
            : rating === 3
            ? "Good"
            : rating === 2
            ? "Fair"
            : "Poor"}
        </Text>

        <Text style={styles.commentLabel}>
          Share your experience (optional)
        </Text>
        <TextInput
          style={styles.commentInput}
          multiline={true}
          numberOfLines={5}
          placeholder="What did you like? What could be improved?"
          value={content}
          onChangeText={setContent}
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitRating}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Rating</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
