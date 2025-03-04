import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./styles";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import {
  signInWithGoogle,
  isSignedIn,
  getCurrentUser,
} from "../../services/authServices";
import { troubleshootGoogleSignIn } from "../../utils/GoogleSignInHelper";
import { useAuth } from "../../context/AuthContext";

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setIsAuthenticated, login } = useAuth();

  useEffect(() => {
    // Check for existing sign-in when component mounts
    const checkGoogleSignIn = async () => {
      try {
        const isUserSignedIn = await isSignedIn();
        if (isUserSignedIn) {
          const userData = await getCurrentUser();
          setUserInfo(userData);
          console.log("User already signed in:", userData);
        }
      } catch (error) {
        console.log("Error checking sign-in status:", error);
      }
    };

    // Run troubleshooter in development
    if (__DEV__) {
      troubleshootGoogleSignIn().then((result) => {
        console.log("Google Sign-In Configuration:", result);
      });
    }

    checkGoogleSignIn();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      // Thực hiện API login ở đây
      // Giả sử response có dạng: { user: { id, email, name, ... }, token: "..." }
      const response = await loginAPI(credentials);
      await login(response.user);
    } catch (error) {
      console.error(error);
      Alert.alert("Login Error", error.message);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();

      if (result && result.backendResponse) {
        const { data } = result.backendResponse;

        // Lưu toàn bộ response data, bao gồm tokens và user info
        await login(data);
      } else {
        Alert.alert(
          "Login Failed",
          "Could not get user information from server"
        );
      }
    } catch (error) {
      console.error("Google login error:", error);
      Alert.alert(
        "Login Error",
        error.message || "Failed to sign in with Google"
      );
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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.contentContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.topSection}>
            <Text style={styles.appName}>Pre-Marriage</Text>
            <Text style={styles.tagline}>
              Your journey to a happy marriage begins here
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Welcome Back</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.googleButton, loading && { opacity: 0.7 }]}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#4285F4"
                  style={{ marginRight: 10 }}
                />
              ) : (
                <Image
                  source={{
                    uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png",
                  }}
                  style={styles.googleIcon}
                />
              )}
              <Text style={styles.googleButtonText}>
                {loading ? "Signing in..." : "Continue with Google"}
              </Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
