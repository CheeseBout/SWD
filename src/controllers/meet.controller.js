const meetServices = require("../services/meet.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");
const APIError = require("../utils/ApiError");

class GoogleMeetController {
  createMeeting = catchAsync(async (req, res) => {
    // Validate user exists in request
    if (!req.user || !req.user._id) {
      throw new APIError(401, "Authentication required");
    }
    if (req.user.role !== "couple_therapist") {
      throw new APIError(403, "Only couple therapist can create meeting");
    }

    const result = await meetServices.createMeeting({
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      userId: req.user._id,
      email: req.body.email,
    });

    return OK(res, "Meeting created successfully", result);
  });
}

module.exports = new GoogleMeetController();
