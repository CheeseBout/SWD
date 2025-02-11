const userServices = require("../services/user.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class UserController {
  getAllUser = catchAsync(async (req, res) => {
    return OK(res, "Success", await userServices.getAllUsers());
  });
  getUserById = catchAsync(async (req, res) => {
    return OK(res, "Success", await userServices.getUserById(req.params.id));
  });
  updateProfile = catchAsync(async (req, res) => {
    return OK(res, "Success", await userServices.updateProfile(req));
  });
}

module.exports = new UserController();
