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
  "https://www.googleapis.com/auth/calendar.settings.readonly",
  "https://www.googleapis.com/auth/meetings.space.created",
];

// Update auth URL generation
const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    include_granted_scopes: true,
  });
};

module.exports = {
  oauth2Client,
  getAuthUrl,
  SCOPES,
};
