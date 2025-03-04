import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
// Mock data for therapists
const MOCK_THERAPISTS = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "Marriage & Family Therapy",
    experience: "15 years",
    rating: 4.9,
    reviews: 124,
    location: "New York, NY",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "2",
    name: "Dr. Michael Williams",
    specialty: "Relationship Counseling",
    experience: "10 years",
    rating: 4.7,
    reviews: 98,
    location: "Boston, MA",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    specialty: "Pre-marital Counseling",
    experience: "8 years",
    rating: 4.8,
    reviews: 86,
    location: "Chicago, IL",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: "4",
    name: "Dr. Robert Chen",
    specialty: "Couples Therapy",
    experience: "12 years",
    rating: 4.6,
    reviews: 112,
    location: "San Francisco, CA",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    id: "5",
    name: "Dr. Lisa Thompson",
    specialty: "Family Counseling",
    experience: "9 years",
    rating: 4.5,
    reviews: 79,
    location: "Seattle, WA",
    image: "https://randomuser.me/api/portraits/women/33.jpg",
  },
];

export default function SearchTherapistResultScreen({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTherapists, setFilteredTherapists] = useState(MOCK_THERAPISTS);
  const [sortBy, setSortBy] = useState("rating"); // Options: rating, experience, reviews

  // Filter therapists based on search query
  const filterTherapists = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredTherapists(MOCK_THERAPISTS);
    } else {
      const filtered = MOCK_THERAPISTS.filter(
        (therapist) =>
          therapist.name.toLowerCase().includes(query.toLowerCase()) ||
          therapist.specialty.toLowerCase().includes(query.toLowerCase()) ||
          therapist.location.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTherapists(filtered);
    }
  };

  // Sort therapists based on criteria
  const sortTherapists = (criteria) => {
    setSortBy(criteria);
    let sorted = [...filteredTherapists];

    switch (criteria) {
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "experience":
        sorted.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
        break;
      case "reviews":
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    setFilteredTherapists(sorted);
  };

  // Render each therapist card
  const renderTherapistCard = ({ item }) => (
    <TouchableOpacity
      style={styles.therapistCard}
      onPress={() =>
        navigation.navigate("TherapistDetail", { therapist: item })
      }
    >
      <Image source={{ uri: item.image }} style={styles.therapistImage} />
      <View style={styles.therapistInfo}>
        <View style={styles.nameContainer}>
          <Text style={styles.therapistName}>{item.name}</Text>
        </View>

        <Text style={styles.therapistSpecialty}>{item.specialty}</Text>

        <View style={styles.therapistDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{item.experience}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.detailText}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviews})</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Refine your search..."
          value={searchQuery}
          onChangeText={filterTherapists}
        />
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.resultsCount}>
          {filteredTherapists.length} therapists found
        </Text>
        <View style={styles.sortButtons}>
          <Text style={styles.sortByText}>Sort by:</Text>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "rating" && styles.activeSortButton,
            ]}
            onPress={() => sortTherapists("rating")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === "rating" && styles.activeSortButtonText,
              ]}
            >
              Rating
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "experience" && styles.activeSortButton,
            ]}
            onPress={() => sortTherapists("experience")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === "experience" && styles.activeSortButtonText,
              ]}
            >
              Experience
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "reviews" && styles.activeSortButton,
            ]}
            onPress={() => sortTherapists("reviews")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === "reviews" && styles.activeSortButtonText,
              ]}
            >
              Reviews
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Therapist List */}
      {filteredTherapists.length > 0 ? (
        <FlatList
          data={filteredTherapists}
          keyExtractor={(item) => item.id}
          renderItem={renderTherapistCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <Text style={styles.noResultsText}>
            No therapists found matching your search
          </Text>
          <Text style={styles.noResultsSubtext}>
            Try adjusting your search terms
          </Text>
        </View>
      )}
    </View>
  );
}
