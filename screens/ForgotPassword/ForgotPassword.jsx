import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { forgotPassword } from "../../services/authServices";
import Toast from "react-native-toast-message";
import { validateEmail } from "../../utils/validations";

export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendResetLink = async () => {
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Email is required 📧",
        visibilityTime: 3000,
        autoHide: true,
      });
      return;
    }

    if (!validateEmail(email)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address",
      });
      return;
    }

    setLoading(true);
    try {
      // API call will go here
      await forgotPassword(email);
      setEmailSent(true);
      Toast.show({
        type: "success",
        text1: "Your password reset link has been sent! 🚀",
        visibilityTime: 3000,
        autoHide: true,
      });
      navigation.navigate("Login");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error sending reset link",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#4a6ee0", "#7a93ef"]}
        style={styles.gradientBackground}
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.contentContainer}
      >
        <View style={styles.formContainer}>
          <View style={styles.headerContainer}>
            <Ionicons name="lock-open-outline" size={60} color="#4a6ee0" />
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you instructions to reset
              your password.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading && !emailSent}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              (loading || emailSent) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendResetLink}
            disabled={loading || emailSent}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>
                {emailSent ? "Email Sent" : "Send Reset Link"}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.footerLink}>Login here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
