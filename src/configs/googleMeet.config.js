const { google } = require("googleapis");
const appConfig = require("./app.config");
require("dotenv").config();

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  appConfig.GOOGLEMEETAPI.CLIENT_ID,
  appConfig.GOOGLEMEETAPI.CLIENT_SECRET,
  appConfig.GOOGLEMEETAPI.CALLBACK_URL
);

// Updated scopes for full Calendar access
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

// Update auth URL generation
const getAuthUrl = () => {
  console.log("Generating Google auth URL with scopes:", SCOPES);
  console.log("Using redirect URI:", appConfig.GOOGLEMEETAPI.CALLBACK_URL);

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    include_granted_scopes: true,
  });
};

async function getToken(code) {
  try {
    console.log("Getting token with code:", code.substring(0, 10) + "...");
    console.log("Using client ID:", appConfig.GOOGLEMEETAPI.CLIENT_ID);
    console.log("Using redirect URI:", appConfig.GOOGLEMEETAPI.CALLBACK_URL);

    // Create a complete fresh OAuth2 client
    const { OAuth2Client } = require("google-auth-library");
    const oAuth2Client = new OAuth2Client(
      appConfig.GOOGLEMEETAPI.CLIENT_ID,
      appConfig.GOOGLEMEETAPI.CLIENT_SECRET,
      appConfig.GOOGLEMEETAPI.CALLBACK_URL
    );

    // Setup explicit redirect URI to match what was used for the auth URL
    const redirectUri = appConfig.GOOGLEMEETAPI.CALLBACK_URL;
    console.log("Using redirect URI for token exchange:", redirectUri);

    // Get token with explicit options
    const tokenOptions = {
      code: code,
      redirect_uri: redirectUri,
    };

    console.log("Making token request with options:", {
      code: code.substring(0, 10) + "...",
      redirect_uri: redirectUri,
    });

    // Get token using the direct approach with explicit options
    const tokenResponse = await oAuth2Client.getToken(tokenOptions);
    console.log("Token response received:", !!tokenResponse.tokens);

    // Log detailed token info without exposing sensitive data
    if (tokenResponse.tokens) {
      console.log("Token details:", {
        hasAccessToken: !!tokenResponse.tokens.access_token,
        hasRefreshToken: !!tokenResponse.tokens.refresh_token,
        expiryDate: tokenResponse.tokens.expiry_date,
        tokenType: tokenResponse.tokens.token_type,
        scopes: tokenResponse.tokens.scope,
      });
    }

    return { tokens: tokenResponse.tokens, success: true };
  } catch (error) {
    console.error("Error getting token:", error.message);

    // Log more detailed error information
    if (error.response) {
      console.error(
        "Error response data:",
        JSON.stringify(error.response.data || {})
      );
      console.error("Error response status:", error.response.status);
      console.error(
        "Error response headers:",
        JSON.stringify(error.response.headers || {})
      );
    } else if (error.request) {
      console.error("No response received from token request");
    }

    return {
      error,
      success: false,
      message: error.message,
      details: error.response?.data || "No response data",
    };
  }
}

// Export a function to create a new client with existing credentials
const createCalendarClient = (credentials) => {
  try {
    const calendarClient = new google.auth.OAuth2(
      appConfig.GOOGLEMEETAPI.CLIENT_ID,
      appConfig.GOOGLEMEETAPI.CLIENT_SECRET,
      appConfig.GOOGLEMEETAPI.CALLBACK_URL
    );

    if (credentials) {
      calendarClient.setCredentials(credentials);
    }

    return calendarClient;
  } catch (error) {
    console.error("Error creating calendar client:", error);
    throw error;
  }
};

module.exports = {
  oauth2Client,
  getAuthUrl,
  getToken,
  SCOPES,
  createCalendarClient,
};
