import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./styles";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { register } from "../../services/authServices";
import { validateEmail, validatePassword } from "../../utils/validations";

export const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullname: "",
    username: "",
    dob: new Date(),
    gender: "other",
    role: "user",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.fullname) newErrors.fullname = "Full name is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email))
      newErrors.email = "Please enter a valid email address";

    if (!formData.password) newErrors.password = "Password is required";
    else if (!validatePassword(formData.password))
      newErrors.password =
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords don't match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (validate()) {
      console.log("Registration data:", formData);

      try {
        const { confirmPassword, ...registerData } = formData;
        const response = await register(registerData);
        navigation.navigate("Login");

        console.log("Registration response:", response.data);
      } catch (error) {
        console.error("Registration error:", error);
        if (error.response) {
          setErrors({ terms: error.response.data.message });
        } else {
          setErrors({ terms: "An error occurred. Please try again." });
        }
      }
    }
  };

  const handleBackButton = () => {
    navigation.goBack();
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, dob: selectedDate }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#4a6ee0", "#7a93ef"]}
        style={styles.gradientBackground}
      />

      <TouchableOpacity style={styles.backButton} onPress={handleBackButton}>
        <View
          style={{
            width: 20,
            height: 20,
            backgroundColor: "#fff",
            borderRadius: 10,
          }}
        />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.contentContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.topSection}>
            <Text style={styles.appName}>Pre-Marriage</Text>
            <Text style={styles.tagline}>Create an account to get started</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Sign Up</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={formData.fullname}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, fullname: text }))
                }
              />
              {errors.fullname && (
                <Text style={styles.errorText}>{errors.fullname}</Text>
              )}

              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Choose a username"
                value={formData.username}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, username: text }))
                }
              />
              {errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, email: text }))
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{formData.dob.toLocaleDateString("vi-VN")}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={formData.dob}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}

              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.gender}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, gender: value }))
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, password: text }))
                }
                secureTextEntry
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, confirmPassword: text }))
                }
                secureTextEntry
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              <View
                style={[
                  styles.checkbox,
                  agreedToTerms && styles.checkboxChecked,
                ]}
              >
                {agreedToTerms && <View style={styles.checkboxInner} />}
              </View>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms && (
              <Text style={styles.errorText}>{errors.terms}</Text>
            )}

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>Create Account</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
