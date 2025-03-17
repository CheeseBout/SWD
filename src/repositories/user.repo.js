const USER = require("../models/user.model");

class UserRepo {
  async getByEmail({ email }) {
    return await USER.findOne({ email });
  }
  async getByID(userID) {
    return await USER.findById(userID);
  }
  async getAll(filter, options) {
    return await USER.paginate(filter, options);
  }

  async update(id, updateData) {
    return await USER.findByIdAndUpdate(id, updateData, { new: true });
  }

  async find() {
    return await USER.find();
  }
}

module.exports = new UserRepo();
