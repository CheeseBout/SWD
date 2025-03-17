import { useState, useEffect } from "react";
import { userService } from "../../services/api";
import AdminSideBar from "../../components/SideBar/AdminSidebar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { toast } from "react-toastify";
import {
  SearchIcon,
  FilterIcon,
  UserIcon,
  MailIcon,
  BadgeCheckIcon,
  LockClosedIcon,
  LockOpenIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/outline";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await userService.getAllUsers();

        if (response && response.data && response.data.users) {
          const filteredData = response.data.users.filter(
            (user) => user.role !== "admin"
          );
          setUsers(filteredData);
          setFilteredUsers(filteredData);
        } else {
          throw new Error("Invalid user data format");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [refreshTrigger]);

  useEffect(() => {
    let results = users;

    if (searchTerm) {
      results = results.filter(
        (user) =>
          user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      results = results.filter(
        (user) => user.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      results = results.filter((user) => user.isActive === isActive);
    }

    setFilteredUsers(results);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      setLoading(true);

      console.log(
        "Toggling status for user:",
        userId,
        "Current status:",
        currentStatus
      );

      if (currentStatus) {
        await userService.inactiveUser({ userId });
        toast.success("User deactivated successfully");

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, isActive: false } : user
          )
        );
      } else {
        await userService.activeUser({ userId });
        toast.success("User activated successfully");

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, isActive: true } : user
          )
        );
      }
    } catch (error) {
      console.error(
        `Error ${currentStatus ? "deactivating" : "activating"} user:`,
        error
      );
      toast.error(
        `Failed to ${currentStatus ? "deactivate" : "activate"} user: ${
          error.message || "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
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

  if (loading && users.length === 0)
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <AdminSideBar />
        <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading users...</p>
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
            User Management
          </h1>
          <p className="text-gray-600">
            Manage user accounts and their activation status
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              className="input input-bordered w-full pl-10"
              placeholder="Search users by name or email..."
            />
          </div>

          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={roleFilter}
              onChange={handleRoleFilter}
              className="select select-bordered w-full pl-10"
            >
              <option value="all">All Roles</option>
              <option value="member">Member</option>
              <option value="couple_therapist">Couple Therapist</option>
            </select>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat bg-white shadow-sm rounded-lg">
            <div className="stat-title">Total Users</div>
            <div className="stat-value">{users.length}</div>
          </div>
          <div className="stat bg-white shadow-sm rounded-lg">
            <div className="stat-title">Active</div>
            <div className="stat-value text-green-600">
              {users.filter((user) => user.isActive).length}
            </div>
          </div>
          <div className="stat bg-white shadow-sm rounded-lg">
            <div className="stat-title">Inactive</div>
            <div className="stat-value text-gray-600">
              {users.filter((user) => !user.isActive).length}
            </div>
          </div>
        </div>

        {loading && users.length > 0 && (
          <div className="flex justify-center my-4">
            <LoadingSpinner size="md" />
          </div>
        )}

        {!loading && filteredUsers.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <UserIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No users found
              </h3>
              {searchTerm || roleFilter !== "all" || statusFilter !== "all" ? (
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria
                </p>
              ) : (
                <p className="text-gray-600 mb-6">
                  No users found in the system
                </p>
              )}
              <div className="flex flex-wrap gap-4 justify-center">
                {(searchTerm ||
                  roleFilter !== "all" ||
                  statusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setRoleFilter("all");
                      setStatusFilter("all");
                    }}
                    className="btn btn-outline"
                  >
                    Clear Filters
                  </button>
                )}
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
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Email
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Verified
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
                  {currentUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.photoURL ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.photoURL}
                                alt=""
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/40?text=" +
                                    user.fullname[0];
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 font-medium">
                                  {user.fullname[0]}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.fullname}
                            </div>
                            <div className="text-xs text-gray-500">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center">
                          <MailIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "couple_therapist"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role === "couple_therapist"
                            ? "Therapist"
                            : "Member"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center hidden sm:table-cell">
                        {user.isVerified ? (
                          <BadgeCheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <ExclamationCircleIcon className="h-5 w-5 text-yellow-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() =>
                            handleToggleStatus(user._id, user.isActive)
                          }
                          className={`ml-auto px-3 py-1.5 rounded-md inline-flex items-center ${
                            user.isActive
                              ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <LockClosedIcon className="h-4 w-4 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <LockOpenIcon className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && <Pagination />}

            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstUser + 1}-
                {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
                {(searchTerm ||
                  roleFilter !== "all" ||
                  statusFilter !== "all") && (
                  <span> (filtered from {users.length} total users)</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
