import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./styles";

// Process steps data
const PROCESS_STEPS = [
  {
    title: "Find a Therapist",
    description:
      "Everyone has unique needs when it comes to relationship help or mental health condition. Search by name, city or zip and we will display the best therapists in your locale from our list.",
  },
  {
    title: "Connect",
    description:
      "Found therapists that seem right for you? Great! You can connect with them directly on their profile page. Get to know them better by reading their advisory articles. Contact them and take back control of your life",
  },
  {
    title: "Seek Advice",
    description:
      "Now that you've found your perfect therapist, don't wait to seek advice and therapy. Talk 1-on-1 as your therapist helps you uncover strengths to cope with life challenges.",
  },
];

export default function SearchTherapistScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      console.log("Searching for:", searchQuery);
      navigation.navigate("SearchTherapistResult", { searchQuery });
    }
  };

  // Render a single process step
  const renderProcessStep = (step, index) => (
    <View key={index} style={styles.processStep}>
      <View style={styles.stepNumberContainer}>
        <Text style={styles.stepNumber}>{index + 1}</Text>
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepDescription}>{step.description}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Search Section */}
      <View style={styles.searchSection}>
        <Text style={styles.searchTitle}>Find Your Perfect Match</Text>
        <Text style={styles.searchSubtitle}>
          Search for therapists by name, specialty, or location
        </Text>

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
          />
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Process Section */}
      <View style={styles.processSection}>
        <Text style={styles.processTitle}>How It Works</Text>
        {PROCESS_STEPS.map(renderProcessStep)}
      </View>
    </ScrollView>
  );
}
