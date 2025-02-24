const APIError = require("../utils/ApiError");
const { google } = require("googleapis");
const { oauth2Client } = require("../configs/googleMeet.config");
const TOKEN = require("../models/token.model");

class GoogleMeetServices {
  async createMeeting({ startTime, endTime, userId }) {
    if (!startTime || !endTime) {
      throw new APIError(400, "Start time and end time are required");
    }

    if (!userId) {
      throw new APIError(400, "User ID is required");
    }

    try {
      // Lấy Google token từ collection TOKEN
      const tokenDoc = await TOKEN.findOne({ userID: userId });
      if (!tokenDoc?.googleToken) {
        throw new APIError(
          401,
          "Google authorization required. Please login with Google first."
        );
      }

      // Set credentials với token từ database
      oauth2Client.setCredentials({
        access_token: tokenDoc.googleToken,
      });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      const event = {
        summary: "Buổi tư vấn trực tuyến",
        description: "Online counseling session",
        start: {
          dateTime: new Date(startTime).toISOString(),
          timeZone: "Asia/Ho_Chi_Minh",
        },
        end: {
          dateTime: new Date(endTime).toISOString(),
          timeZone: "Asia/Ho_Chi_Minh",
        },
        conferenceData: {
          createRequest: {
            requestId: Date.now().toString(),
          },
        },
      };

      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
        conferenceDataVersion: 1,
      });

      const meetLink = response.data.hangoutLink;
      if (!meetLink) {
        throw new APIError(500, "Could not generate meet link");
      }

      return {
        meetLink,
        startTime,
        endTime,
        eventId: response.data.id,
      };
    } catch (error) {
      console.error("Google Calendar Error:", error.response?.data || error);
      throw new APIError(500, "Failed to create meeting: " + error.message);
    }
  }
}

module.exports = new GoogleMeetServices();
