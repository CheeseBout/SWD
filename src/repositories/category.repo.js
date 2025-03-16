const CATEGORY = require("../models/category.model");

class CategoryRepository {
  async create(categoryData) {
    const category = new CATEGORY(categoryData);
    return await category.save();
  }

  async findAll() {
    return await CATEGORY.find({});
  }

  async findById(id) {
    return await CATEGORY.findById(id);
  }

  async findByName(name) {
    return await CATEGORY.findOne({ name });
  }

  async findByStatus(status) {
    return await CATEGORY.find({ status });
  }

  async update(id, categoryData) {
    return await CATEGORY.findByIdAndUpdate(id, categoryData, { new: true });
  }

  async updateStatus(id, status, reason) {
    return await CATEGORY.findByIdAndUpdate(
      id,
      {
        status,
        statusReason: reason,
        lastEdited: Date.now(),
      },
      { new: true }
    );
  }
}

module.exports = new CategoryRepository();
