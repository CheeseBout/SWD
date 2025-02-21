const meetServices = require("../services/meet.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class GoogleMeetController {
  createMeeting = catchAsync(async (req, res) => {
    return OK(res, "Success", await meetServices.createMeeting(req.body));
  });
}

module.exports = new GoogleMeetController();
