import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { styles } from "./styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import { changePassword, signOut } from "../../services/authServices";

export const ChangePasswordScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleChangePassword = async () => {
    if (
      !formData.oldPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      Toast.show({
        type: "error",
        text1: "All fields are required",
      });
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      Toast.show({
        type: "error",
        text1: "Password requirements not met",
        text2:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Toast.show({
        type: "error",
        text1: "New passwords do not match",
      });
      return;
    }

    setLoading(true);
    try {
      // API call will go here
      await changePassword(formData.oldPassword, formData.newPassword);

      Toast.show({
        type: "success",
        text1: "Password changed successfully! 🎉",
      });
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to change password",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionDescription}>
            Your new password must be different from your current password
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!showPasswords.current}
                value={formData.oldPassword}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, oldPassword: text }))
                }
                placeholder="Enter current password"
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility("current")}
              >
                <Ionicons
                  name={showPasswords.current ? "eye-off" : "eye"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!showPasswords.new}
                value={formData.newPassword}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, newPassword: text }))
                }
                placeholder="Enter new password"
              />
              <TouchableOpacity onPress={() => togglePasswordVisibility("new")}>
                <Ionicons
                  name={showPasswords.new ? "eye-off" : "eye"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!showPasswords.confirm}
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, confirmPassword: text }))
                }
                placeholder="Confirm new password"
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility("confirm")}
              >
                <Ionicons
                  name={showPasswords.confirm ? "eye-off" : "eye"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.changeButton, loading && styles.changeButtonDisabled]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.changeButtonText}>Change Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
