import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { changeAvatar } from "../../services/userServices";

export const ChooseGalleryPhoto = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { userInfo } = useAuth();

  const pickImage = async () => {
    try {
      // Request media library permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to upload a photo"
        );
        return;
      }

      // Launch image picker with updated API
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images", // Updated from MediaTypeOptions.Images
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image");
    }
  };

  const uploadImage = async () => {
    if (!image) return;

    setLoading(true);
    try {
      // Create a form data object
      const formData = new FormData();

      // Get the filename from the image URI
      const imageName = image.split("/").pop();

      // Determine the file type
      const imageType = imageName.endsWith(".png")
        ? "image/png"
        : imageName.endsWith(".jpg") || imageName.endsWith(".jpeg")
        ? "image/jpeg"
        : "image/jpg";

      // Append the image to the form data with field name "image"
      formData.append("image", {
        uri: image,
        name: imageName,
        type: imageType,
      });

      console.log("Uploading image with formData:", formData);

      // Call the changeAvatar function from userServices
      const updatedUserInfo = await changeAvatar(formData);
      console.log("Response from changeAvatar:", updatedUserInfo);

      Alert.alert("Success", "Profile picture updated successfully", [
        {
          text: "OK",
          onPress: () => {
            // Use goBack() and pass params to the previous screen
            navigation.navigate({
              name: "Profile",
              params: { avatarUpdated: true, timestamp: Date.now() },
              merge: true,
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to update profile picture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Profile Picture</Text>

      {image ? (
        <Image source={{ uri: image }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="image-outline" size={60} color="#ccc" />
          <Text style={styles.placeholderText}>
            Select an image to continue
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Select Image</Text>
        </TouchableOpacity>

        {image && (
          <TouchableOpacity
            style={[styles.button, styles.uploadButton]}
            onPress={uploadImage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.buttonText, styles.uploadButtonText]}>
                Upload Image
              </Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={[styles.buttonText, styles.cancelButtonText]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginVertical: 20,
    borderWidth: 4,
    borderColor: "#4a6ee0",
  },
  placeholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  placeholderText: {
    marginTop: 10,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 30,
  },
  button: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  uploadButton: {
    backgroundColor: "#4a6ee0",
  },
  uploadButtonText: {
    color: "#fff",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ff3b30",
  },
  cancelButtonText: {
    color: "#ff3b30",
  },
});
