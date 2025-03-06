import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { styles } from "./styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../../context/AuthContext";
import Toast from "react-native-toast-message";
import { updateProfile } from "../../services/userServices";

export const ProfileDetailScreen = ({ navigation }) => {
  const { userInfo, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const user = userInfo?.data?.user || {};
  console.log("Profile Detail userInfo:", userInfo);

  const [formData, setFormData] = useState({
    fullname: user.fullname || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
    dob: user.dob ? new Date(user.dob) : new Date(),
    gender: user.gender || "other",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      const allowedFields = ["fullname", "address", "dob", "gender"];

      const formattedData = {
        ...formData,
        gender: formData.gender.toLowerCase(),
        dob: formData.dob.toISOString(),
      };

      const dataToUpdate = Object.fromEntries(
        Object.entries(formattedData).filter(([key]) =>
          allowedFields.includes(key)
        )
      );

      const updatedUserInfo = await updateProfile(dataToUpdate);
      console.log("Updated user info:", updatedUserInfo);

      // Cập nhật context với toàn bộ dữ liệu mới
      await login(updatedUserInfo);

      Toast.show({
        type: "success",
        text1: "Profile updated successfully!",
      });

      // Quay lại màn hình trước sau khi cập nhật thành công
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to update profile",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, dob: selectedDate }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Details</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Ionicons
            name={isEditing ? "save" : "create"}
            size={24}
            color="#4a6ee0"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.fullname}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, fullname: text }))
              }
              editable={isEditing}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={formData.email}
              editable={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.address}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, address: text }))
              }
              editable={isEditing}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity
              style={[styles.input, !isEditing && styles.inputDisabled]}
              onPress={() => isEditing && setShowDatePicker(true)}
            >
              <Text>{formData.dob.toLocaleDateString("vi-VN")}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.dob}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender</Text>
            {isEditing ? (
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
            ) : (
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={
                  formData.gender.charAt(0).toUpperCase() +
                  formData.gender.slice(1)
                } // Capitalize first letter
                editable={false}
              />
            )}
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
