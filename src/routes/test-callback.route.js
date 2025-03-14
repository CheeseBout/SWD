const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const appConfig = require("../configs/app.config");

/**
 * Debug route to validate Google API credentials and test token exchange
 */
router.get("/test-google-creds", async (req, res) => {
  try {
    const googleConfig = {
      clientId: appConfig.GOOGLEMEETAPI.CLIENT_ID,
      clientSecret: appConfig.GOOGLEMEETAPI.CLIENT_SECRET,
      redirectUrl: appConfig.GOOGLEMEETAPI.CALLBACK_URL,
    };

    // Test auth client creation
    const oAuth2Client = new google.auth.OAuth2(
      googleConfig.clientId,
      googleConfig.clientSecret,
      googleConfig.redirectUrl
    );

    // Generate a test auth URL to verify parameters are correct
    const scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ];

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      state: JSON.stringify({ test: true }),
    });

    return res.json({
      status: "success",
      message: "Google API credentials appear valid",
      data: {
        clientIdPrefix: googleConfig.clientId
          ? googleConfig.clientId.substring(0, 10) + "..."
          : "missing",
        clientSecretPrefix: googleConfig.clientSecret
          ? "present (hidden)"
          : "missing",
        redirectUrl: googleConfig.redirectUrl,
        testAuthUrl: authUrl,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error validating Google credentials",
      error: error.message,
    });
  }
});

/**
 * Debug route to capture callback for testing
 */
router.get("/google-callback", async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.status(400).send(`Google returned error: ${error}`);
  }

  if (!code) {
    return res.status(400).send("No authorization code received from Google");
  }

  try {
    // Log received data
    const logData = {
      codePrefix: code ? code.substring(0, 10) + "..." : "none",
      state: state || "none",
      fullQueryParams: req.query,
    };

    console.log("Test callback received data:", logData);

    // Try to exchange code for token
    const oAuth2Client = new google.auth.OAuth2(
      appConfig.GOOGLEMEETAPI.CLIENT_ID,
      appConfig.GOOGLEMEETAPI.CLIENT_SECRET,
      appConfig.GOOGLEMEETAPI.CALLBACK_URL
    );

    // Get token
    const tokenResponse = await oAuth2Client.getToken(code);

    // Only show token presence/absence, not the actual tokens
    const tokenInfo = tokenResponse.tokens
      ? {
          hasAccessToken: !!tokenResponse.tokens.access_token,
          hasRefreshToken: !!tokenResponse.tokens.refresh_token,
          expiryDate: tokenResponse.tokens.expiry_date
            ? new Date(tokenResponse.tokens.expiry_date)
            : null,
          tokenType: tokenResponse.tokens.token_type,
        }
      : "No tokens received";

    res.send(`
      <h1>Google Callback Test Successful</h1>
      <p>Authorization code successfully exchanged for tokens</p>
      <h2>Token Information:</h2>
      <pre>${JSON.stringify(tokenInfo, null, 2)}</pre>
      <p>You can close this window now.</p>
    `);
  } catch (error) {
    console.error("Test callback error:", error);
    res.status(500).send(`
      <h1>Google Callback Test Failed</h1>
      <p>Error: ${error.message}</p>
      <h2>Error Details:</h2>
      <pre>${JSON.stringify(error, null, 2)}</pre>
    `);
  }
});

module.exports = router;
