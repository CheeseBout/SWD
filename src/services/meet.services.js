const moment = require("moment");
const fs = require("fs");
const path = require("path");
const APIError = require("../utils/ApiError");
const { google } = require("googleapis");
const { oauth2Client } = require("../configs/googleAuth.config");

const TOKEN_PATH = path.join(__dirname, "../token.json");

class GoogleMeetServices {
  async createMeeting({ startTime, endTime }) {
    if (!startTime || !endTime) {
      throw new APIError(400, "Start time and end time are required");
    }

    await this.ensureValidToken(); // 🔥 Đảm bảo token hợp lệ trước khi gọi API

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
   * Đảm bảo token hợp lệ, nếu hết hạn thì refresh và lưu lại.
   */
  async ensureValidToken() {
    if (!fs.existsSync(TOKEN_PATH)) {
      throw new APIError(401, "Bạn cần xác thực trước bằng /auth.");
    }

    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    oauth2Client.setCredentials(token);

    if (token.expiry_date && token.expiry_date < Date.now()) {
      try {
        const newToken = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(newToken.credentials);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(newToken.credentials));
        console.log("✅ Access token đã được làm mới!");
      } catch (error) {
        console.error("❌ Lỗi refresh token:", error);
        throw new APIError(401, "Lỗi xác thực, vui lòng xác thực lại bằng /auth.");
      }
    }
  }
}

module.exports = new GoogleMeetServices();
