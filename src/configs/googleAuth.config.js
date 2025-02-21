const { google } = require("googleapis");
const { GOOGLEMEETAPI } = require("./app.config");
const GoogleTokenService = require("../services/googleToken.services");
require("dotenv").config();

const oauth2Client = new google.auth.OAuth2(
  GOOGLEMEETAPI.CLIENT_ID,
  GOOGLEMEETAPI.CLIENT_SECRET,
  GOOGLEMEETAPI.REDIRECT_URI
);

console.log("🔍 Debug: CLIENT_ID:", GOOGLEMEETAPI.CLIENT_ID);
console.log("🔍 Debug: CLIENT_SECRET:", GOOGLEMEETAPI.CLIENT_SECRET);
console.log("🔍 Debug: REDIRECT_URI:", GOOGLEMEETAPI.REDIRECT_URI);

// Load token from database
async function loadGoogleToken(userId) {
  const tokens = await GoogleTokenService.getGoogleToken(userId);
  if (tokens) {
    oauth2Client.setCredentials(tokens);
    return true;
  }
  return false;
}

function getAuthURL() {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
  });
}

async function saveToken(code, userId) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Save to database
  await GoogleTokenService.saveGoogleToken(userId, tokens);
  console.log("Google token saved to database!");

  return tokens;
}

module.exports = { oauth2Client, getAuthURL, saveToken, loadGoogleToken };
