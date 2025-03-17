import React, { useState } from "react";
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

export default function RatingScreen({ route, navigation }) {
  const { reservation, therapist } = route.params;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitRating = async () => {
    if (rating < 1) {
      Alert.alert("Error", "Please select a rating");
      return;
    }

    setLoading(true);

    try {
      const ratingData = {
        coupleTherapistID: therapist._id,
        reservationID: reservation._id,
        rating: rating,
        comment: comment.trim(),
      };

      const response = await ratingServices.submitRating(ratingData);

      if (response && response.status === "success") {
        Alert.alert("Success", "Thank you for your feedback!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("Error", "Failed to submit your rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Rate Your Experience</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.therapistSection}>
          {therapist.userInfo.photoURL && (
            <Image
              source={{ uri: therapist.userInfo.photoURL }}
              style={styles.therapistImage}
            />
          )}
          <Text style={styles.therapistName}>
            {therapist.userInfo.fullname}
          </Text>
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
          value={comment}
          onChangeText={setComment}
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
