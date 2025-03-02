import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "./screens/Login/Login";
import { HomeScreen } from "./screens/Home/Home";
import { RegisterScreen } from "./screens/Register/Register";
import { ChatScreen } from "./screens/Chat/Chat";
import { ProfileScreen } from "./screens/Profile/Profile";
import SettingScreen from "./screens/Setting/Setting";
import { CalendarScreen } from "./screens/Calendar/Calendar";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import SearchTherapistScreen from "./screens/SearchTherapist/SearchTherapist";
import SearchTherapistResultScreen from "./screens/SearchTherapistResult/SearchTherapistResult";

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
            focused ? (iconName = "home") : (iconName = "home-outline");
          } else if (route.name === "Calendar") {
            focused ? (iconName = "calendar") : (iconName = "calendar-outline");
          } else if (route.name === "Chat") {
            focused ? (iconName = "chatbox") : (iconName = "chatbox-outline");
          } else if (route.name === "Profile") {
            focused ? (iconName = "person") : (iconName = "person-outline");
          }
          return <Ionicons name={iconName} size={24} color="#4a6ee0" />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={TabItems}
          options={{ headerShown: false }}
        />
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
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
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
          options={{ headerShown: true, title: "Find a Therapist" }}
        />
        <Stack.Screen
          name="SearchTherapistResult"
          component={SearchTherapistResultScreen}
          options={{ headerShown: true, title: "Find a Therapist" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
