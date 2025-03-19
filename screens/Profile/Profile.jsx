import {
  View,
  Text,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
  Platform,
  RefreshControl,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { styles } from "./styles";
import { useAuth } from "../../context/AuthContext";
import { getUserById } from "../../services/userServices";

export const ProfileScreen = ({ navigation, route }) => {
  const { userInfo, logout } = useAuth();
  const user = userInfo?.data?.user || {};
  const [refreshing, setRefreshing] = useState(false);
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const prevPhotoURLRef = useRef(user?.photoURL);

  useEffect(() => {
    console.log("Current userInfo in Profile:", userInfo);

    // If photoURL has changed, update the avatar key to force a refresh
    if (user?.photoURL && user.photoURL !== prevPhotoURLRef.current) {
      prevPhotoURLRef.current = user.photoURL;
      setAvatarKey(Date.now());
    }
  }, [userInfo, user?.photoURL]);

  // Add a focus effect to refresh the profile when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // Force update by re-fetching user data when screen is focused
      if (user?._id) {
        refreshUserData();
        setAvatarKey(Date.now()); // Force image refresh on focus
      }
    });

    return unsubscribe;
  }, [navigation, user?._id]);

  // Check for avatar update param from route
  useEffect(() => {
    if (route.params?.avatarUpdated) {
      console.log("Avatar was updated, refreshing profile...");
      setAvatarKey(route.params.timestamp || Date.now());
      refreshUserData();

      // Clear the parameter to prevent multiple refreshes
      navigation.setParams({ avatarUpdated: undefined, timestamp: undefined });
    }
  }, [route.params?.avatarUpdated]);

  const refreshUserData = async () => {
    if (!user?._id) return;

    setRefreshing(true);
    try {
      // Re-fetch user data when needed
      await getUserById(user._id);
      // Force image refresh
      setAvatarKey(Date.now());
    } catch (error) {
      console.error("Error refreshing user data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    refreshUserData();
  }, [user?._id]);

  const menuItems = [
    {
      icon: "person-outline",
      title: "Personal Information",
      subtitle: "Update your personal information",
      action: () => navigation.navigate("ProfileDetail"),
    },
    {
      icon: "settings-outline",
      title: "Settings",
      subtitle: "Notificaton, privacy and more",
      action: () => console.log("Navigate to setting page"),
    },
    {
      icon: "help-circle-outline",
      title: "Help & Support",
      subtitle: "FAQs and customer support",
      action: () => console.log("Navigate to FAQs & support page"),
    },
    {
      icon: "information-circle-outline",
      title: "About",
      subtitle: "Terms, policies and app info",
      action: () => console.log("Navigate to About page"),
    },
    {
      icon: "lock-closed-outline",
      title: "Change Password",
      subtitle: "Update your password",
      action: () => navigation.navigate("ChangePassword"),
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert("Logout Error", "Failed to logout. Please try again.");
    }
  };

  const handleChangeAvatar = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Choose from Gallery"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            navigation.navigate("ChooseGalleryPhoto");
          }
        }
      );
    } else {
      // For Android
      Alert.alert("Change Profile Photo", "Choose an option", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Choose from Gallery",
          onPress: () => navigation.navigate("ChooseGalleryPhoto"),
        },
      ]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("Setting")}
          >
            <Ionicons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={handleChangeAvatar}>
            <Image
              key={avatarKey.toString()}
              source={{
                uri: user?.photoURL
                  ? `${user.photoURL}?timestamp=${avatarKey}`
                  : user?.gender === "male"
                  ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEz1ve3QQhGM3EKWe1dDjnQAOqyMv0RUEcnw&s"
                  : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxrd4dsitg-Rhwx0aUZsGjzqkZn34JbVC9-w&s",
              }}
              style={styles.profileImage}
              cacheControl="no-cache"
              onError={() => setAvatarKey(Date.now())}
            />
            <View style={styles.changePhotoOverlay}>
              <Ionicons name="camera" size={20} color="#ffffff" />
              <Text style={styles.changePhotoText}>Change</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{user?.fullname || "No name"}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color="#4a6ee0" />
            <Text style={styles.infoText}>{user?.email || "No email"}</Text>
          </View>

          {user?.address && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color="#4a6ee0" />
              <Text style={styles.infoText}>{user.address}</Text>
            </View>
          )}

          {user?.dob && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color="#4a6ee0" />
              <Text style={styles.infoText}>DOB: {formatDate(user.dob)}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color="#4a6ee0" />
            <Text style={styles.infoText}>
              Gender:{" "}
              {user?.gender
                ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
                : "Not specified"}
            </Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Account Settings</Text>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.action}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={22} color="#4a6ee0" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ff3b30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
