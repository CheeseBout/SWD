import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKENS = "auth_tokens";

export const saveTokens = async (tokens) => {
  try {
    await AsyncStorage.setItem(AUTH_TOKENS, JSON.stringify(tokens));
    console.log("Tokens saved successfully: ", tokens);
  } catch (error) {
    console.error("Error saving tokens:", error);
    throw error;
  }
};

export const getTokens = async () => {
  try {
    const tokens = await AsyncStorage.getItem(AUTH_TOKENS);
    return tokens ? JSON.parse(tokens) : null;
  } catch (error) {
    console.error("Error getting tokens:", error);
    return null;
  }
};

export const removeTokens = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKENS);
  } catch (error) {
    console.error("Error removing tokens:", error);
    throw error;
  }
};
