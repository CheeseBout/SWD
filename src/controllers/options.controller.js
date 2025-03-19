const optionsServices = require("../services/options.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class OptionsController {
  getAllOptions = catchAsync(async (req, res) => {
    return OK(res, "Success", await optionsServices.getAllOptions());
  });

  getOptionById = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await optionsServices.getOptionById(req.params.optionId)
    );
  });

  createOption = catchAsync(async (req, res) => {
    return OK(res, "Success", await optionsServices.createOptions(req));
  });

  selectOptionWithQuiz = catchAsync(async (req, res) => {
    // Pass the quizID from params to the service
    return OK(res, "Success", await optionsServices.selectOptionWithQuiz(req));
  });

  updateOption = catchAsync(async (req, res) => {
    return OK(res, "Success", await optionsServices.updateOptions(req));
  });

  deleteOption = catchAsync(async (req, res) => {
    return OK(res, "Success", await optionsServices.deleteOptions(req));
  });
}

module.exports = new OptionsController();
