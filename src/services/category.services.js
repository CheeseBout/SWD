const categoryRepo = require("../repositories/category.repo");
const coupleTherapistRepo = require("../repositories/coupleTherapist.repo");
const APIError = require("../utils/ApiError");

class CategoryServices {
  async createCategory(req) {
    const data = await categoryRepo.create(req.body);
    return { data };
  }

  async updateCategory(req) {
    const { categoryId, name, description, imageUrl } = req.body;

    if (!categoryId) {
      throw new APIError(400, "Category ID is required");
    }

    const category = await categoryRepo.findById(categoryId);
    if (!category) {
      throw new APIError(400, "Category not found");
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (imageUrl) updateData.imageUrl = imageUrl;
    updateData.lastEdited = Date.now();

    const updatedCategory = await categoryRepo.update(categoryId, updateData);
    return { updatedCategory };
  }

  async deleteCategory(req) {
    const { categoryId } = req.body;

    if (!categoryId) {
      throw new APIError(400, "Category ID is required");
    }

    const category = await categoryRepo.findById(categoryId);
    if (!category) {
      throw new APIError(400, "Category not found");
    }

    const deletedCategory = await categoryRepo.updateStatus(
      categoryId,
      "inactive",
      "Deleted by admin"
    );
    return { deletedCategory };
  }

  async findAllCategories() {
    const data = await categoryRepo.findAll();
    return { data };
  }

  async findCategoryById(categoryId) {
    const data = await categoryRepo.findById(categoryId);
    return { data };
  }

  async findCategoryByName(categoryName) {
    const data = await categoryRepo.findByName(categoryName);
    return { data };
  }

  async findCategoryByStatus(status) {
    const data = await categoryRepo.findByStatus(status);
    return { data };
  }

  async findTherapistsByCategory(categoryId) {
    if (!categoryId) {
      throw new APIError(400, "Category ID is required");
    }

    const category = await categoryRepo.findById(categoryId);
    if (!category) {
      throw new APIError(404, "Category not found");
    }

    const therapists = await coupleTherapistRepo.findTherapistsByCategory(
      categoryId
    );
    return { therapists };
  }
}

module.exports = new CategoryServices();
