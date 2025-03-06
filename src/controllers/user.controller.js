const userServices = require("../services/user.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class UserController {
  //res -> msg -> await function
  getAllUser = catchAsync(async (req, res) => {
    return OK(res, "Success", await userServices.getAllUsers());
  });
  getUserById = catchAsync(async (req, res) => {
    return OK(res, "Success", await userServices.getUserById(req.params.id));
  });
  updateProfile = catchAsync(async (req, res) => {
    return OK(
      res,
      "Updated information successfully",
      await userServices.updateProfile(req)
    );
  });
  changeAvatar = catchAsync(async (req, res) => {
    return OK(
      res,
      "Your avatar has been changed successfully",
      await userServices.changeAvatar(req)
    );
  });

  inactiveUser = catchAsync(async (req, res) => {
    return OK(
      res,
      "User has been deactivated successfully",
      await userServices.inactiveUser(req)
    );
  });

  activeUser = catchAsync(async (req, res) => {
    return OK(
      res,
      "User has been activated successfully",
      await userServices.activeUser(req)
    );
  });
}

module.exports = new UserController();
