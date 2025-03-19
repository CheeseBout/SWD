import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LogBox, InteractionManager } from "react-native";
import { LoginScreen } from "./screens/Login/Login";
import { HomeScreen } from "./screens/Home/Home";
import { RegisterScreen } from "./screens/Register/Register";
import { ProfileScreen } from "./screens/Profile/Profile";
import SettingScreen from "./screens/Setting/Setting";
import { CalendarScreen } from "./screens/Calendar/Calendar";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import SearchTherapistScreen from "./screens/SearchTherapist/SearchTherapist";
import SearchTherapistResultScreen from "./screens/SearchTherapistResult/SearchTherapistResult";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { ForgotPasswordScreen } from "./screens/ForgotPassword/ForgotPassword";
import Toast from "react-native-toast-message";
import TherapistDetailScreen from "./screens/TherapistDetail/TherapistDetail";
import { ProfileDetailScreen } from "./screens/ProfileDetail/ProfileDetail";
import { ChangePasswordScreen } from "./screens/ChangePassword/ChangePassword";
import BlogList from "./screens/BlogList/BlogList";
import BlogDetail from "./screens/BlogDetail/BlogDetail";
import QuizList from "./screens/QuizList/QuizList";
import QuizDetail from "./screens/QuizDetail/QuizDetail";
import ReservationsScreen from "./screens/Reservations/Reservations";
import YourReservation from "./screens/YourReservation/YourReservation";
import PaymentWebView from "./screens/PaymentWebView/PaymentWebView";
import { linking } from "./navigation/linking";
import RatingScreen from "./screens/RatingScreen/RatingScreen";
import { ChooseGalleryPhoto } from "./screens/Profile/ChooseGalleryPhoto";

// Add this line to ignore the specific warning related to this React Native bug
LogBox.ignoreLogs([
  "ViewGroup",
  "Cannot remove child at index",
  "Warning: childCount may be incorrect",
  "VirtualizedLists should never be nested",
]);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabItems = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Calendar") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Blog") {
            iconName = focused ? "newspaper" : "newspaper-outline";
          } else if (route.name === "Reservations") {
            iconName = focused ? "bookmark" : "bookmark-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={24} color="#4a6ee0" />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Blog" component={BlogList} />
      <Tab.Screen name="Reservations" component={ReservationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
const NavigationScreens = () => {
  const { isAuthenticated, loading, userInfo } = useAuth();

  // Thêm debug logs
  console.log("App - Auth State:", {
    isAuthenticated,
    loading,
    hasUserInfo: !!userInfo,
    userName: userInfo?.data?.user?.fullname || "Not available",
  });

  if (loading) {
    console.log("App - Still loading auth state");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4a6ee0" />
      </View>
    );
  }

  console.log(
    "App - Rendering navigation with auth state:",
    isAuthenticated ? "AUTHENTICATED" : "NOT AUTHENTICATED"
  );

  return (
    <Stack.Navigator
      screenListeners={{
        beforeRemove: (e) => {
          // Handle back navigation more gracefully
          const event = e;
          if (event.data.action.type === "GO_BACK") {
            InteractionManager.runAfterInteractions(() => {
              // Let any animations complete before continuing
            });
          }
        },
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="MainTabs"
            component={TabItems}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Setting"
            component={SettingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SearchTherapist"
            component={SearchTherapistScreen}
            options={{
              headerShown: true,
              title: "Find a Therapist",
              animation: "slide_from_right", // Add animation type
            }}
          />
          <Stack.Screen
            name="SearchTherapistResult"
            component={SearchTherapistResultScreen}
            options={{ headerShown: true, title: "Find a Therapist" }}
          />
          <Stack.Screen
            name="ProfileDetail"
            component={ProfileDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BlogDetail"
            component={BlogDetail}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="QuizList"
            component={QuizList}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="QuizDetails"
            component={QuizDetail}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Reservations"
            component={ReservationsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ReservationDetails"
            component={YourReservation}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TherapistDetail"
            component={TherapistDetailScreen}
            options={{ headerShown: true, title: "Find a Therapist" }}
          />
          <Stack.Screen
            name="PaymentWebView"
            component={PaymentWebView}
            options={{
              headerShown: true,
              title: "Payment",
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="RatingScreen"
            component={RatingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ChooseGalleryPhoto"
            component={ChooseGalleryPhoto}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer linking={linking}>
        <NavigationScreens />
      </NavigationContainer>
      <Toast />
    </AuthProvider>
  );
}
