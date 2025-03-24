const categoryServices = require("../services/category.services");
const { OK } = require("../utils/response");
const APIError = require("../utils/ApiError");

class CategoryController {
  async createCategory(req, res) {
    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can create categories");
    }
    const result = await categoryServices.createCategory(req);
    return OK(res, "Category created successfully", result.data);
  }

  async getAllCategories(req, res) {
    const result = await categoryServices.findAllCategories();
    return OK(res, "Success", result.data);
  }

  async getCategoryById(req, res) {
    const result = await categoryServices.findCategoryById(req.params.id);
    return OK(res, "Success", result.data);
  }

  async getCategoryByName(req, res) {
    const result = await categoryServices.findCategoryByName(req.query.name);
    return OK(res, "Success", result.data);
  }

  async getCategoryByStatus(req, res) {
    const result = await categoryServices.findCategoryByStatus(
      req.query.status
    );
    return OK(res, "Success", result.data);
  }

  async getTherapistsByCategory(req, res) {
    const { categoryId } = req.params;
    const result = await categoryServices.findTherapistsByCategory(categoryId);
    return OK(res, "Therapists retrieved successfully", result.therapists);
  }

  async updateCategory(req, res) {
    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can create categories");
    }
    const result = await categoryServices.updateCategory(req);
    return OK(res, "Category updated successfully", result.updatedCategory);
  }

  async deleteCategory(req, res) {
    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can create categories");
    }
    const result = await categoryServices.deleteCategory(req);
    return OK(res, "Category deleted successfully", result.deletedCategory);
  }
}

module.exports = new CategoryController();
