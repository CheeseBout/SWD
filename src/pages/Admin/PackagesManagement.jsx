import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { packageService } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { toast } from "react-toastify";
import AdminSideBar from "../../components/Sidebar/AdminSidebar";
import PackageForm from "../../components/Admin/PackageForm";
import {
  PlusIcon,
  PencilAltIcon,
  SearchIcon,
  FilterIcon,
  EyeIcon,
  LockOpenIcon,
  LockClosedIcon,
} from "@heroicons/react/outline";

export default function PackagesManagement() {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [therapistFilter, setTherapistFilter] = useState("");
  const [therapists, setTherapists] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const packagesPerPage = 8;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await packageService.getAllPackages();
        let packageData = [];

        if (response?.data) {
          packageData = response.data;
        } else if (Array.isArray(response)) {
          packageData = response;
        } else {
          console.error("Unexpected response format:", response);
          throw new Error("Invalid package data format");
        }

        packageData.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt);
          const dateB = new Date(b.updatedAt || b.createdAt);
          return dateB - dateA;
        });

        setPackages(packageData);
        setFilteredPackages(packageData);

        const uniqueTherapists = [];
        const therapistIds = new Set();

        packageData.forEach((pkg) => {
          if (
            pkg.coupleTherapistID &&
            !therapistIds.has(pkg.coupleTherapistID._id)
          ) {
            therapistIds.add(pkg.coupleTherapistID._id);
            uniqueTherapists.push({
              id: pkg.coupleTherapistID._id,
              name:
                pkg.coupleTherapistID.userID?.fullname ||
                pkg.coupleTherapistID.userInfo?.fullname ||
                "Unknown Therapist",
            });
          }
        });

        setTherapists(uniqueTherapists);
      } catch (err) {
        console.error("Error fetching packages:", err);
        setError("Failed to load packages. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [refreshTrigger]);

  useEffect(() => {
    let results = packages;

    if (searchTerm) {
      results = results.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (pkg.description &&
            pkg.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (pkg.coupleTherapistID?.userID?.fullname &&
            pkg.coupleTherapistID.userID.fullname
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== "all") {
      results = results.filter(
        (pkg) =>
          (statusFilter === "active" && pkg.isActive) ||
          (statusFilter === "inactive" && !pkg.isActive)
      );
    }

    if (therapistFilter) {
      results = results.filter(
        (pkg) => pkg.coupleTherapistID?._id === therapistFilter
      );
    }

    setFilteredPackages(results);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, therapistFilter, packages]);

  const indexOfLastPackage = currentPage * packagesPerPage;
  const indexOfFirstPackage = indexOfLastPackage - packagesPerPage;
  const currentPackages = filteredPackages.slice(
    indexOfFirstPackage,
    indexOfLastPackage
  );
  const totalPages = Math.ceil(filteredPackages.length / packagesPerPage);

  const handleToggleStatus = (pkg) => {
    setCurrentPackage(pkg);
    document.getElementById("toggle_status_modal").showModal();
  };

  const confirmToggleStatus = async () => {
    try {
      setLoading(true);

      const updateData = {
        packageId: currentPackage._id,
        isActive: !currentPackage.isActive,
      };

      if (currentPackage.isActive) {
        await packageService.softDeletePackage(currentPackage._id);
        toast.success("Package deactivated successfully");
      } else {
        await packageService.updatePackage(currentPackage._id, updateData);
        toast.success("Package activated successfully");
      }

      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Error updating package status:", err);
      toast.error(
        `Failed to ${
          currentPackage.isActive ? "deactivate" : "activate"
        } package`
      );
    } finally {
      setLoading(false);
      document.getElementById("toggle_status_modal").close();
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleTherapistFilter = (e) => {
    setTherapistFilter(e.target.value);
  };

  const handleCreatePackage = () => {
    setCurrentPackage(null);
    document.getElementById("create_package_modal").showModal();
  };

  const handleEditPackage = (pkg) => {
    setCurrentPackage({ ...pkg });
    document.getElementById("edit_package_modal").showModal();
  };

  const handleCancelCreate = () => {
    document.getElementById("create_package_modal").close();
    setCurrentPackage(null);
  };

  const handleCancelEdit = () => {
    document.getElementById("edit_package_modal").close();
  };

  const handleSubmitCreate = async (formData) => {
    try {
      setIsSubmitting(true);
      await packageService.createPackage(formData);
      toast.success("Package created successfully");
      document.getElementById("create_package_modal").close();
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Error creating package:", err);
      toast.error("Failed to create package");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (formData) => {
    try {
      setIsSubmitting(true);
      const updateData = {
        ...formData,
        packageId: currentPackage._id,
      };
      await packageService.updatePackage(currentPackage._id, updateData);
      toast.success("Package updated successfully");
      document.getElementById("edit_package_modal").close();
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Error updating package:", err);
      toast.error("Failed to update package");
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

  if (loading && packages.length === 0)
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <AdminSideBar />
        <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading packages...</p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <AdminSideBar />
        <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <ErrorMessage error={error} />
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
            Packages Management
          </h1>
          <p className="text-gray-600">
            Manage and monitor service packages offered by therapists
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              className="input input-bordered w-full pl-10"
              placeholder="Search packages..."
            />
          </div>

          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="select select-bordered w-full pl-10"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={therapistFilter}
              onChange={handleTherapistFilter}
              className="select select-bordered w-full pl-10"
            >
              <option value="">All Therapists</option>
              {therapists.map((therapist) => (
                <option key={therapist.id} value={therapist.id}>
                  {therapist.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-start lg:justify-end">
            <button
              onClick={handleCreatePackage}
              className="btn btn-primary w-full lg:w-auto"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New Package
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat bg-white shadow-sm rounded-lg">
            <div className="stat-title">Total Packages</div>
            <div className="stat-value">{packages.length}</div>
          </div>
          <div className="stat bg-white shadow-sm rounded-lg">
            <div className="stat-title">Active</div>
            <div className="stat-value text-green-600">
              {packages.filter((pkg) => pkg.isActive).length}
            </div>
          </div>
          <div className="stat bg-white shadow-sm rounded-lg">
            <div className="stat-title">Inactive</div>
            <div className="stat-value text-gray-600">
              {packages.filter((pkg) => !pkg.isActive).length}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center my-4">
            <LoadingSpinner size="md" />
          </div>
        )}

        {!loading && filteredPackages.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M20 7l-8-4-8 4m16 0l-8 4m-8-4l8 4m8 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No packages found
              </h3>
              {searchTerm || statusFilter !== "all" || therapistFilter ? (
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria
                </p>
              ) : (
                <p className="text-gray-600 mb-6">
                  No therapist packages are available in the system
                </p>
              )}
              <div className="flex flex-wrap gap-4 justify-center">
                {(searchTerm || statusFilter !== "all" || therapistFilter) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setTherapistFilter("");
                    }}
                    className="btn btn-outline"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={handleCreatePackage}
                  className="btn btn-primary"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create New Package
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
                      Package Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Therapist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPackages.map((pkg) => (
                    <tr
                      key={pkg._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {pkg.name}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-1">
                              {pkg.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden bg-gray-100">
                            {pkg.coupleTherapistID?.userID?.photoURL ||
                            pkg.coupleTherapistID?.userInfo?.photoURL ? (
                              <img
                                src={
                                  pkg.coupleTherapistID.userID?.photoURL ||
                                  pkg.coupleTherapistID.userInfo?.photoURL
                                }
                                alt=""
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/40x40?text=T";
                                }}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-800 font-medium">
                                {pkg.coupleTherapistID?.userID?.fullname?.[0] ||
                                  pkg.coupleTherapistID?.userInfo
                                    ?.fullname?.[0] ||
                                  "T"}
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {pkg.coupleTherapistID?.userID?.fullname ||
                                pkg.coupleTherapistID?.userInfo?.fullname ||
                                "Unknown Therapist"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {pkg.coupleTherapistID?.userID?.email ||
                                pkg.coupleTherapistID?.userInfo?.email ||
                                ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatPrice(pkg.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {pkg.discount}%
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {pkg.comissionFee ? `${pkg.comissionFee}%` : "0%"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            pkg.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {pkg.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditPackage(pkg)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                            title="Edit package"
                          >
                            <PencilAltIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(pkg)}
                            className={`p-1 rounded ${
                              pkg.isActive
                                ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                                : "text-green-600 hover:text-green-900 hover:bg-green-50"
                            }`}
                            title={
                              pkg.isActive
                                ? "Deactivate package"
                                : "Activate package"
                            }
                          >
                            {pkg.isActive ? (
                              <LockClosedIcon className="h-5 w-5" />
                            ) : (
                              <LockOpenIcon className="h-5 w-5" />
                            )}
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
                Showing {indexOfFirstPackage + 1}-
                {Math.min(indexOfLastPackage, filteredPackages.length)} of{" "}
                {filteredPackages.length} packages
                {(searchTerm || statusFilter !== "all" || therapistFilter) && (
                  <span> (filtered from {packages.length} total packages)</span>
                )}
              </div>
            </div>
          </div>
        )}

        <dialog id="toggle_status_modal" className="modal">
          <div className="modal-box">
            <h3 className="text-lg font-bold">
              {currentPackage?.isActive
                ? "Deactivate Package"
                : "Activate Package"}
            </h3>
            <p className="py-4">
              {currentPackage
                ? `Are you sure you want to ${
                    currentPackage.isActive ? "deactivate" : "activate"
                  } "${currentPackage?.name}"?`
                : ""}
            </p>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn btn-sm btn-ghost">Cancel</button>
              </form>
              <button
                onClick={confirmToggleStatus}
                className={`btn btn-sm ${
                  currentPackage?.isActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                } text-white`}
              >
                {currentPackage?.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        <dialog id="create_package_modal" className="modal">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg">Create New Package</h3>
            <div className="py-4">
              <PackageForm
                initialData={null}
                onSubmit={handleSubmitCreate}
                onCancel={handleCancelCreate}
                submitButtonText="Create Package"
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        <dialog id="edit_package_modal" className="modal">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg">Edit Package</h3>
            <div className="py-4">
              <PackageForm
                initialData={currentPackage}
                onSubmit={handleSubmitEdit}
                onCancel={handleCancelEdit}
                submitButtonText="Update Package"
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </div>
  );
}
