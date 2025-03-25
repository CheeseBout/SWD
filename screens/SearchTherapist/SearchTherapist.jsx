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

export default function SearchTherapistResultScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [therapistList, setTherapistList] = useState([]);
  const [filteredTherapists, setFilteredTherapists] = useState([]);
  const [sortBy, setSortBy] = useState("rating"); // Options: rating, experience, reviews
  const isMounted = useRef(true);

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (navigation.canGoBack()) {
          // Clean up before going back
          setTherapistList([]);
          setFilteredTherapists([]);
        }
        return false; // Allow default back behavior
      }
    );

    return () => {
      backHandler.remove();
      isMounted.current = false;
    };
  }, []);

  // Safe navigation with cleanup
  const safeNavigate = (routeName, params = {}) => {
    // Reset states before navigating to prevent memory issues
    setTherapistList([]);
    setFilteredTherapists([]);

    // Navigate using navigate instead of push to avoid stacking screens
    navigation.navigate(routeName, params);
  };

  // Safe cleanup when screen loses focus and rehydration when focused
  useFocusEffect(
    useCallback(() => {
      // Component is mounted and focused
      isMounted.current = true;

      // Only fetch data if needed and component is mounted
      if (therapistList.length === 0 && isMounted.current) {
        fetchData();
      }

      return () => {
        // Cleanup when losing focus
        if (isMounted.current) {
          // Reset states that might cause memory leaks
        }
      };
    }, [therapistList.length])
  );

  const fetchData = async () => {
    try {
      const response = await fetchSearchTherapistList("");
      setTherapistList(response || []);
      setFilteredTherapists(response || []);
    } catch (error) {
      console.log("Error while fetching couple therapist", error);
      setTherapistList([]);
      setFilteredTherapists([]);
    }
  };

  useEffect(() => {
    fetchData();

    // Cleanup function when component unmounts
    return () => {
      // Clean up any resources
      setTherapistList([]);
      setFilteredTherapists([]);
    };
  }, []);

  // Navigate to result screen with proper params
  const navigateToResults = (query, therapist = null) => {
    const params = { searchQuery: query };
    if (therapist) {
      params.selectedTherapist = therapist;
    }

    safeNavigate("SearchTherapistResult", params);
  };

  // Filter therapists based on search query
  const filterTherapists = async () => {
    try {
      navigateToResults(searchQuery);
    } catch (error) {
      console.log("Error filtering therapists:", error);
    }
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
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "experience":
        sorted.sort(
          (a, b) => parseInt(b.experience || 0) - parseInt(a.experience || 0)
        );
        break;
      case "reviews":
        sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
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
          .map((cat) => cat.category || cat.name)
          .join(", ");
      } else if (typeof item.categoryInfo === "object") {
        // Handle single category object
        return (
          item.categoryInfo.category || item.categoryInfo.name || "General"
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
        onPress={() => navigateToResults(item?.userInfo?.fullname || "", item)}
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
            {item?.userInfo?.address || "No location specified"}
          </Text>

          <View style={styles.therapistDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.detailText}>
                {item.rating || "New"}{" "}
                {item.rating ? `(${item.reviewCount || 0} reviews)` : ""}
              </Text>
            </View>

            {item?.certificates && item.certificates.length > 0 && (
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
              <Text style={styles.detailText}>
                {item?.userInfo?.address || "No location"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
          placeholder="Search therapists..."
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
          keyExtractor={(item) => item._id || Math.random().toString()}
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
