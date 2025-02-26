const PACKAGE = require("../models/package.model");
const APIError = require("../utils/ApiError");
class PackageServices {
  async createPackage(data) {
    if (await this.checkDuplicate(data)) {
      throw new APIError(400, "Package duplicated");
    }
    const discountPackage = await PACKAGE.create(data);
    discountPackage.save();
    return discountPackage;
  }
  async getAllPackage() {
    return await PACKAGE.find();
  }
  async getPackageByID(packageID) {
    return await PACKAGE.findById(packageID);
  }
  async updatePackage(packageID, data) {
    if (await this.checkDuplicate(data)) {
      throw new APIError(400, "Pack duplicated");
    }
    const discountPackage = await PACKAGE.creat(data);
    return discountPackage;
  }
  async deletePackage(packageID) {
    const discountPackage = await PACKAGE.findById(packageID);
  }
  async checkDuplicate(data) {
    const response = await PACKAGE.find();
    return response;
  }
}
module.exports = PackageServices;
