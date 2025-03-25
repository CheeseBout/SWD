import { useState, useEffect } from "react";
import { categoryService } from "../../services/category/categoryService";
import AdminSideBar from "../../components/SideBar/AdminSidebar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { toast } from "react-toastify";
import {
  PencilAltIcon,
  TrashIcon,
  TagIcon,
  FilterIcon,
  PlusCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/outline";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const categoriesPerPage = 10;

  const [formMode, setFormMode] = useState("create");
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await categoryService.getAllCategories();
        let categoriesData = [];

        if (data && Array.isArray(data)) {
          categoriesData = data;
        } else if (data && data.data && Array.isArray(data.data)) {
          categoriesData = data.data;
        } else {
          throw new Error("Received unexpected data format from the server");
        }

        setCategories(categoriesData);
        setFilteredCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [refreshTrigger]);

  useEffect(() => {
    let results = categories;

    if (searchTerm) {
      results = results.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.description &&
            category.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredCategories(results);
    setCurrentPage(1);
  }, [searchTerm, categories]);

  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = filteredCategories.slice(
    indexOfFirstCategory,
    indexOfLastCategory
  );
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const openCreateModal = () => {
    setFormMode("create");
    setCategoryName("");
    setCategoryDescription("");
    setCurrentCategory(null);
    document.getElementById("category_modal").showModal();
  };

  const openUpdateModal = (category) => {
    setFormMode("update");
    setCurrentCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");

    console.log("Category selected for update:", category);
    document.getElementById("category_modal").showModal();
  };

  const openDeleteModal = (category) => {
    setCurrentCategory(category);
    document.getElementById("delete_category_modal").showModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const categoryData = {
        name: categoryName.trim(),
        description: categoryDescription.trim(),
      };

      let result;
      if (formMode === "create") {
        result = await categoryService.createCategory(categoryData);
        if (result) {
          toast.success("Category created successfully");
        }
      } else {
        const categoryId = currentCategory?.id || currentCategory?._id;

        if (!categoryId) {
          console.error("Missing category ID for update:", currentCategory);
          toast.error("Cannot update category: Missing category ID");
          setIsSubmitting(false);
          return;
        }

        const updateData = {
          categoryId: categoryId,
          name: categoryName.trim(),
          description: categoryDescription.trim(),
        };
        console.log("Sending update data:", updateData);

        result = await categoryService.updateCategory(updateData);

        if (result) {
          toast.success("Category updated successfully");
        }
      }

      if (result) {
        document.getElementById("category_modal").close();
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast.error(`Failed to ${formMode} category. Please try again.`);
      }
    } catch (err) {
      console.error(
        `Error ${formMode === "create" ? "creating" : "updating"} category:`,
        err
      );
      toast.error(
        `Failed to ${formMode} category: ${err.message || "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentCategory) return;

    setIsSubmitting(true);

    try {
      const categoryId = currentCategory?.id || currentCategory?._id;
      if (!categoryId) {
        console.error("Missing category ID for delete:", currentCategory);
        toast.error("Cannot delete category: Missing category ID");
        setIsSubmitting(false);
        return;
      }

      const result = await categoryService.deleteCategory({
        categoryId: categoryId,
      });

      if (result) {
        toast.success("Category deleted successfully");
        document.getElementById("delete_category_modal").close();
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast.error("Failed to delete category. Please try again.");
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error(
        `Failed to delete category: ${err.message || "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const Pagination = () => {
    return (
      <div className="flex justify-center mt-6">
        <div className="join">
          <button
            className="join-item btn btn-sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            «
          </button>
          <button
            className="join-item btn btn-sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          <button className="join-item btn btn-sm">
            Page {currentPage} of {totalPages}
          </button>
          <button
            className="join-item btn btn-sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            ›
          </button>
          <button
            className="join-item btn btn-sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>
    );
  };

  if (loading && categories.length === 0)
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <AdminSideBar />
        <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    );

  if (error && categories.length === 0)
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <AdminSideBar />
        <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <ErrorMessage message={error} />
            <button
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              className="mt-4 btn btn-primary w-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminSideBar />

      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Category Management
          </h1>
          <p className="text-gray-600">
            Manage categories for blog posts and content organization
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              className="input input-bordered w-full pl-10"
              placeholder="Search categories by name..."
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={openCreateModal}
              className="btn btn-primary flex items-center"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Add New Category
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat bg-white shadow-sm rounded-lg">
            <div className="stat-title">Total Categories</div>
            <div className="stat-value">{categories.length}</div>
          </div>
          <div className="stat bg-white shadow-sm rounded-lg">
            <div className="stat-title">Active</div>
            <div className="stat-value text-green-600">
              {categories.filter((category) => category.status === "active").length}
            </div>
          </div>
          <div className="stat bg-white shadow-sm rounded-lg">
            <div className="stat-title">Inactive</div>
            <div className="stat-value text-gray-600">
              {categories.filter((category) => category.status !== "active").length}
            </div>
          </div>
        </div>

        {loading && categories.length > 0 && (
          <div className="flex justify-center my-4">
            <LoadingSpinner size="md" />
          </div>
        )}

        {!loading && filteredCategories.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <TagIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No categories found
              </h3>
              {searchTerm ? (
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria
                </p>
              ) : (
                <p className="text-gray-600 mb-6">
                  Start by creating your first category
                </p>
              )}
              <div className="flex flex-wrap gap-4 justify-center">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="btn btn-outline"
                  >
                    Clear Search
                  </button>
                )}
                <button onClick={openCreateModal} className="btn btn-primary">
                  Create Category
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentCategories.map((category) => (
                    <tr
                      key={category.id || category._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <TagIcon className="h-5 w-5 text-blue-500 mr-3" />
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {category.description || "No description provided"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            category.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {category.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={() => openUpdateModal(category)}
                            className="text-blue-600 hover:text-blue-900 focus:outline-none"
                            title="Edit Category"
                          >
                            <PencilAltIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(category)}
                            className="text-red-600 hover:text-red-900 focus:outline-none"
                            title="Delete Category"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && <Pagination />}

            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstCategory + 1}-
                {Math.min(indexOfLastCategory, filteredCategories.length)} of{" "}
                {filteredCategories.length} categories
                {searchTerm && (
                  <span>
                    {" "}
                    (filtered from {categories.length} total categories)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {}
      <dialog id="category_modal" className="modal backdrop-blur-sm">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">
            {formMode === "create" ? "Create Category" : "Update Category"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Enter category name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                rows="3"
                className="textarea textarea-bordered w-full"
                placeholder="Enter category description"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() =>
                  document.getElementById("category_modal").close()
                }
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !categoryName.trim()}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                ) : null}
                {formMode === "create" ? "Create" : "Update"}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {}
      <dialog id="delete_category_modal" className="modal backdrop-blur-sm">
        <div className="modal-box">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <ExclamationCircleIcon className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-bold text-center mb-2">
            Delete Category
          </h3>
          <p className="text-gray-600 text-center mb-6">
            Are you sure you want to delete the category "
            {currentCategory?.name}"? This action cannot be undone and may
            affect content linked to this category.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                document.getElementById("delete_category_modal").close();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default CategoryManagement;
