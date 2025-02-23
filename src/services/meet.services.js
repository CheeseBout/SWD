const moment = require("moment");
const fs = require("fs");
const path = require("path");
const APIError = require("../utils/ApiError");
const { google } = require("googleapis");
const { oauth2Client } = require("../configs/googleAuth.config");
const TOKEN = require("../models/token.model");

const TOKEN_PATH = path.join(__dirname, "../token.json");

class GoogleMeetServices {
  async createMeeting({ startTime, endTime }) {
    if (!startTime || !endTime) {
      throw new APIError(400, "Start time and end time are required");
    }

    await this.ensureValidToken();

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
      summary: "Cuộc họp Google Meet",
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
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    try {
      const response = await calendar.events.insert({
        calendarId: "primary",
        resource: event,
        conferenceDataVersion: 1,
      });

      return {
        meetLink: response.data.hangoutLink,
        startTime: startTime,
        endTime: endTime,
      };
    } catch (error) {
      console.error("Lỗi tạo Google Meet:", error);
      throw new APIError(
        500,
        "Failed to create a Google Meet link:  " + error.message
      );
    }
  }

  /**
   * Đảm bảo token hợp lệ, nếu hết hạn thì refresh và lưu lại vào database
   */
  async ensureValidToken() {
    const tokenDoc = await TOKEN.findOne({ googleToken: { $exists: true } });
    if (!tokenDoc || !tokenDoc.googleToken) {
      throw new APIError(
        401,
        "Không tìm thấy token xác thực Google. Vui lòng xác thực lại."
      );
    }

    const token = JSON.parse(tokenDoc.googleToken);
    oauth2Client.setCredentials(token);

    if (tokenDoc.expiryDate && tokenDoc.expiryDate < Date.now()) {
      try {
        const newToken = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(newToken.credentials);

        // Cập nhật token mới vào database
        await TOKEN.findOneAndUpdate(
          { _id: tokenDoc._id },
          {
            googleToken: JSON.stringify(newToken.credentials),
            expiryDate: new Date(newToken.credentials.expiry_date),
            updatedAt: new Date(),
          },
          { new: true }
        );

        console.log("✅ Access token đã được làm mới!");
      } catch (error) {
        console.error("❌ Lỗi refresh token:", error);
        throw new APIError(
          401,
          "Lỗi xác thực token Google, vui lòng xác thực lại."
        );
      }
    }
  }
}

module.exports = new GoogleMeetServices();
