class UserRepo {
  async getByEmail(email) {
    return await User.findOne({ email });
  }
  async getByID(userID) {
    return await User.findOne({ id: userID });
  }
  async getAll(filter, options) {
    return await User.paginate(filter, options);
  }

  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  async find() {
    return await User.find();
  }
}

module.exports = new UserRepo();
