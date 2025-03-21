const { uploadImage } = require("../services/imgur.services");
const APIError = require("../utils/ApiError");
const { OK } = require("../utils/response");

class UtilsController {
  async uploadImage(req, res) {
    try {
      const imageFile = req.file;
      console.log("REQ.IMAGE", req.image);
      console.log("REQ.FILE", req.file);

      if (!imageFile) {
        throw new APIError(400, "Image file is required");
      }
      const uploadResult = await uploadImage(imageFile);
      return OK(res, "Image uploaded successfully", uploadResult);
    } catch (error) {
      throw new APIError(500, `Image upload failed: ${error.message}`);
    }
  }
}

module.exports = new UtilsController();
