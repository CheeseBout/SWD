import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { AuthContext } from "../../contexts/AuthContextObject";
import { authService } from "../../services/api";
import SideBar from "../../components/SideBar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  FaLock,
  FaUnlock,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaTimes,
  FaInfoCircle,
  FaKey,
} from "react-icons/fa";

const schema = yup.object({
  oldPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm password is required"),
});

export default function ChangePassword() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useContext(AuthContext);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    try {
      setError(null);
      setSubmitLoading(true);

      const response = await authService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      toast.success("Password changed successfully!");
      reset();

      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (err) {
      console.error("Error changing password:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to change password. Please try again.";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  if (authLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-white">
      <div className="flex flex-col md:flex-row">
        <div className="md:sticky md:top-16 md:h-screen">
          <SideBar />
        </div>

        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center animate-fade-in">
                <div className="bg-blue-100 p-3 rounded-full mr-4 text-blue-600">
                  <FaKey className="text-3xl" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Change Your Password
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Update your password to keep your account secure
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-blue-100 transition-all duration-300 hover:shadow-lg">
              {error && (
                <div className="alert alert-error mb-6 rounded-xl flex items-center">
                  <FaInfoCircle className="mr-2" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="card bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm p-6 rounded-2xl border border-blue-200">
                  <h2 className="text-xl font-semibold mb-5 text-blue-800 flex items-center">
                    <FaLock className="mr-2" />
                    <span>Password Settings</span>
                  </h2>

                  <div className="space-y-6">
                    <div className="transition-all duration-300 hover:translate-x-1">
                      <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span>Current Password</span>
                      </div>
                      <div className="relative">
                        <label
                          className={`input input-bordered border-2 ${
                            errors.oldPassword
                              ? "input-error border-red-300"
                              : ""
                          } rounded-xl shadow-sm focus-within:shadow-blue-100 transition-all`}
                        >
                          <FaUnlock className="h-5 w-5 text-blue-500" />
                          <input
                            type={showOldPassword ? "text" : "password"}
                            className="grow focus:outline-none"
                            placeholder="Enter current password"
                            {...register("oldPassword")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </label>
                      </div>
                      {errors.oldPassword && (
                        <p className="text-error text-sm mt-1 flex items-center">
                          <FaInfoCircle className="mr-1 text-xs" />
                          {errors.oldPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="transition-all duration-300 hover:translate-x-1">
                      <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span>New Password</span>
                      </div>
                      <div className="relative">
                        <label
                          className={`input input-bordered border-2 ${
                            errors.newPassword
                              ? "input-error border-red-300"
                              : ""
                          } rounded-xl shadow-sm focus-within:shadow-blue-100 transition-all`}
                        >
                          <FaLock className="h-5 w-5 text-blue-500" />
                          <input
                            type={showNewPassword ? "text" : "password"}
                            className="grow focus:outline-none"
                            placeholder="Enter new password"
                            {...register("newPassword")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </label>
                      </div>
                      {errors.newPassword && (
                        <p className="text-error text-sm mt-1 flex items-center">
                          <FaInfoCircle className="mr-1 text-xs" />
                          {errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="transition-all duration-300 hover:translate-x-1">
                      <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span>Confirm New Password</span>
                      </div>
                      <div className="relative">
                        <label
                          className={`input input-bordered border-2 ${
                            errors.confirmPassword
                              ? "input-error border-red-300"
                              : ""
                          } rounded-xl shadow-sm focus-within:shadow-blue-100 transition-all`}
                        >
                          <FaLock className="h-5 w-5 text-blue-500" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="grow focus:outline-none"
                            placeholder="Confirm new password"
                            {...register("confirmPassword")}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </label>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-error text-sm mt-1 flex items-center">
                          <FaInfoCircle className="mr-1 text-xs" />
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FaInfoCircle className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            For security, your password should be at least 8
                            characters and include a mix of letters, numbers,
                            and special characters.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-outline border-2 rounded-xl px-6 transition-all duration-300 hover:bg-gray-100"
                  >
                    <FaTimes className="mr-2" /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="btn btn-primary rounded-xl px-6 transition-all duration-300"
                  >
                    {submitLoading ? (
                      <span className="flex items-center">
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        Updating...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FaSave className="mr-2" /> Save Changes
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
