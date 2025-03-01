import {
  View,
  Text,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import { styles } from "./styles";

export const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    id: "123456",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (123) 456-7890",
    joinDate: "May 2023",
    profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
  });

  const menuItems = [
    {
      icon: "person-outline",
      title: "Personal Information",
      subtitle: "Update your personal information",
      action: () => console.log("Open modal with personal information form"),
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
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => console.log("Edit profile")}
          >
            <Ionicons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Profile Information */}
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: user.profileImage }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.bio}>{user.bio}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color="#4a6ee0" />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#4a6ee0" />
            <Text style={styles.infoText}>{user.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#4a6ee0" />
            <Text style={styles.infoText}>{user.address}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#4a6ee0" />
            <Text style={styles.infoText}>Member since {user.joinDate}</Text>
          </View>
        </View>

        {/* Menu Section */}
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

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => console.log("Logout")}
        >
          <Ionicons name="log-out-outline" size={20} color="#ff3b30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
