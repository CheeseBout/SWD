import React, { useEffect, useState, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Button,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchSearchTherapistList } from "../../services/therapistServices";
import { styles } from "./styles";

export default function SearchTherapistResultScreen({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState("");
  const query = route.params?.searchQuery || "";
  const selectedTherapist = route.params?.selectedTherapist || null;
  const [therapistList, setTherapistList] = useState([]);
  const [filteredTherapists, setFilteredTherapists] = useState([]);
  const [sortBy, setSortBy] = useState("rating"); // Options: rating, experience, reviews
  const isMounted = useRef(true);

  // Handle hardware back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // Clean up before navigating back
        cleanupAndGoBack();
        return true; // Prevent default behavior
      }
    );

    return () => {
      backHandler.remove();
      isMounted.current = false;
    };
  }, []);

  // Safe cleanup function before navigation
  const cleanupAndGoBack = () => {
    // Reset all state to prevent memory leaks
    setTherapistList([]);
    setFilteredTherapists([]);

    // Use replace instead of navigate to avoid stacking screens
    navigation.goBack();
  };

  // Navigation method with cleanup
  const safeNavigate = (routeName, params = {}) => {
    // Reset state before navigating
    setTherapistList([]);
    setFilteredTherapists([]);

    // Navigate with replace to avoid screen stacking
    navigation.navigate(routeName, params);
  };

  // Safe cleanup when screen loses focus
  useFocusEffect(
    useCallback(() => {
      // When screen is focused, flag as mounted
      isMounted.current = true;

      // Return cleanup function for when screen loses focus
      return () => {
        // Reset states to prevent memory leaks
        if (isMounted.current) {
          setTherapistList([]);
          setFilteredTherapists([]);
        }
        isMounted.current = false;
      };
    }, [])
  );

  useEffect(() => {
    if (!route.params) return;

    // Only proceed if component is still mounted
    if (!isMounted.current) return;

    // Log information received from SearchTherapist screen
    console.log("Route params received:", route.params);
    console.log("Search query:", query);
    console.log("Selected therapist:", selectedTherapist);

    setSearchQuery(query);
    const fetchData = async () => {
      try {
        let response;
        if (selectedTherapist) {
          // If we have a selected therapist, use that directly
          response = [selectedTherapist];
          console.log("Using selected therapist instead of API call");
        } else {
          // Otherwise perform the search API call
          response = await fetchSearchTherapistList(query);
        }
        setTherapistList(response || []);
        setFilteredTherapists(response || []);
      } catch (error) {
        console.log("Error while fetching therapists:", error);
      }
    };
    fetchData();

    // Cleanup function when component unmounts
    return () => {
      // Additional cleanup for any resources if needed
      isMounted.current = false;
    };
  }, [query, selectedTherapist, route.params]);

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
  const renderTherapistCard = ({ item }) => {
    // Helper function to extract category name
    const getCategoryName = () => {
      if (!item.categoryInfo) return "General";

      if (Array.isArray(item.categoryInfo) && item.categoryInfo.length > 0) {
        // Handle array of category objects
        return item.categoryInfo
          .map((cat) => cat.name || cat.category)
          .join(", ");
      } else if (typeof item.categoryInfo === "object") {
        // Handle single category object
        return (
          item.categoryInfo.name || item.categoryInfo.category || "General"
        );
      } else if (typeof item.category === "string") {
        // Fallback to item.category if it's a string
        return item.category;
      }

      return "General";
    };

    return (
      <TouchableOpacity
        style={styles.therapistCard}
        onPress={() => safeNavigate("TherapistDetail", { therapist: item })}
      >
        <Image
          source={{
            uri: item?.userInfo?.photoURL || "https://via.placeholder.com/150",
          }}
          style={styles.therapistImage}
        />
        <View style={styles.therapistInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.therapistName}>
              {item?.userInfo?.fullname || "Unknown"}
            </Text>
            {item?.userInfo?.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            )}
          </View>

          <Text style={styles.therapistCategory}>{getCategoryName()}</Text>
          <Text style={styles.therapistLocation}>
            {item?.userInfo?.address || "No location"}
          </Text>

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
  };

  return (
    <View style={styles.container}>
      {/* Selected Therapist Info Display (if available) */}
      {selectedTherapist && (
        <View style={styles.selectedTherapistBanner}>
          <Text style={styles.selectedTherapistTitle}>Selected Therapist:</Text>
          <Text style={styles.selectedTherapistName}>
            {selectedTherapist?.userInfo?.fullname}
          </Text>
        </View>
      )}

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
