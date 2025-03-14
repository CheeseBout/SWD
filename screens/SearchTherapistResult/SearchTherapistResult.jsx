import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Button,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchSearchTherapistList } from "../../services/therapistServices";
import { styles } from "./styles";

export default function SearchTherapistResultScreen({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState("");
  const query = route.params.searchQuery || "";
  const [therapistList, setTherapistList] = useState([]);
  const [filteredTherapists, setFilteredTherapists] = useState([]);
  const [sortBy, setSortBy] = useState("rating"); // Options: rating, experience, reviews

  useEffect(() => {
    setSearchQuery(query);
    const fetchData = async () => {
      try {
        const response = await fetchSearchTherapistList(query);
        setTherapistList(response);
        setFilteredTherapists(response);
        console.log("");
        console.log(response);
      } catch (error) {
        console.log("Error while fetching couple therapist", error);
      }
    };
    fetchData();
  }, [query]);

  // Filter therapists based on search query
  const filterTherapists = async () => {
    const response = await fetchSearchTherapistList(searchQuery);
    setFilteredTherapists(response);
    console.log(response);
  };

  // Handle enter key press
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      filterTherapists();
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
      <Image
        source={{ uri: item.userInfo.photoURL }}
        style={styles.therapistImage}
      />
      <View style={styles.therapistInfo}>
        <View style={styles.nameContainer}>
          <Text style={styles.therapistName}>{item.userInfo.fullname}</Text>
          {item.userInfo.isVerified && (
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          )}
        </View>

        <Text style={styles.therapistCategory}>{item.category}</Text>
        <Text style={styles.therapistLocation}>{item.userInfo.address}</Text>

        <View style={styles.therapistDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.detailText}>
              {item.rating || "New"}{" "}
              {item.rating ? `(${item.reviewCount} reviews)` : ""}
            </Text>
          </View>

          {item.certificates && item.certificates.length > 0 && (
            <View style={styles.detailItem}>
              <Ionicons name="school-outline" size={14} color="#666" />
              <Text style={styles.detailText}>
                {item.certificates.length} Certificate
                {item.certificates.length > 1 ? "s" : ""}
              </Text>
            </View>
          )}

          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{item.userInfo.address}</Text>
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
          onChangeText={setSearchQuery}
          onKeyPress={handleKeyPress}
        />
        <Button title="Search" onPress={filterTherapists} />
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
          keyExtractor={(item) => item._id}
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
