import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { AuthContext } from "../../contexts/AuthContextObject";
import { userService } from "../../services/api";
import SideBar from "../../components/SideBar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import {
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSave,
  FaTimes,
  FaUserEdit,
  FaVenusMars,
  FaCheck,
  FaInfoCircle,
} from "react-icons/fa";

const schema = yup.object({
  fullname: yup
    .string()
    .test(
      "is-valid-fullname",
      "Full name must not contain numbers or special characters",
      function (value) {
        if (value === this.options.context?.originalData?.fullname) {
          return true;
        }

        if (!value) return true;

        return /^[\p{L}\s''.-]+$/u.test(value);
      }
    )
    .required("Full name is required"),
  dob: yup
    .date()
    .transform((value, originalValue) => {
      if (
        originalValue === "" ||
        originalValue === null ||
        originalValue === undefined
      ) {
        return null;
      }

      const date = new Date(originalValue);
      return isNaN(date.getTime()) ? null : date;
    })
    .typeError("Please enter a valid date format")
    .test("is-valid-date", "Date cannot be in the future", function (value) {
      if (
        value &&
        this.options.context?.originalData?.dob &&
        new Date(value).toISOString().split("T")[0] ===
          new Date(this.options.context.originalData.dob)
            .toISOString()
            .split("T")[0]
      ) {
        return true;
      }
      return value ? new Date(value) <= new Date() : false;
    })
    .required("Date of birth is required"),
  gender: yup
    .string()
    .test(
      "is-valid-gender",
      "Gender must be male, female, or other",
      function (value) {
        if (value === this.options.context?.originalData?.gender) {
          return true;
        }
        return value
          ? ["male", "female", "other"].includes(value.toLowerCase())
          : false;
      }
    )
    .required("Gender is required"),
  address: yup
    .string()
    .test("is-valid-address", "Address is required", function (value) {
      if (value === this.options.context?.originalData?.address) {
        return true;
      }
      return Boolean(value && value.trim().length > 0);
    })
    .required("Address is required"),
});

export default function UpdateProfile() {
  const navigate = useNavigate();
  const {
    user: authUser,
    isAuthenticated,
    isLoading: authLoading,
    updateUser,
    refreshUser,
  } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [originalData, setOriginalData] = useState({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    context: { originalData },
    defaultValues: {
      fullname: "",
      dob: "",
      gender: "",
      address: "",
    },
  });

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const userId =
          authUser?.userId || authUser?._id || authUser?.id || authUser?.sub;

        if (userId) {
          const response = await userService.getUserById(userId);
          if (response?.data?.user) {
            const userData = response.data.user;
            const formattedDate = userData.dob
              ? new Date(userData.dob).toISOString().split("T")[0]
              : "";

            const originalValues = {
              fullname: userData.fullname || "",
              dob: formattedDate,
              gender: userData.gender || "",
              address: userData.address || "",
            };

            setOriginalData(originalValues);

            reset(originalValues, {
              keepErrors: false,
              keepDirty: false,
              keepIsSubmitted: false,
              keepTouched: false,
              keepIsValid: false,
              keepSubmitCount: false,
            });
          } else {
            const formattedDate = authUser.dob
              ? new Date(authUser.dob).toISOString().split("T")[0]
              : "";

            const originalValues = {
              fullname: authUser.fullname || "",
              dob: formattedDate,
              gender: authUser.gender || "",
              address: authUser.address || "",
            };

            setOriginalData(originalValues);

            reset(originalValues, {
              keepErrors: false,
              keepDirty: false,
              keepIsSubmitted: false,
              keepTouched: false,
              keepIsValid: false,
              keepSubmitCount: false,
            });
          }
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
        setError("Failed to load your profile information.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [authUser, isAuthenticated, authLoading, navigate, reset]);

  const onSubmit = async (data) => {
    try {
      setSubmitLoading(true);
      setError(null);

      const changedData = {};
      Object.keys(dirtyFields).forEach((key) => {
        changedData[key] = data[key];
      });

      if (Object.keys(changedData).length === 0) {
        toast.info("No changes detected");
        navigate("/profile");
        return;
      }

      const submissionData = {
        fullname: data.fullname,
        dob: data.dob,
        gender: data.gender.toLowerCase(),
        address: data.address || "",
      };

      const response = await userService.updateUserProfile(submissionData);

      if (response.success || response.status === 200 || response.data) {
        if (typeof updateUser === "function") {
          updateUser(submissionData);
        }

        if (typeof refreshUser === "function") {
          await refreshUser();
        }

        toast.success("Profile updated successfully!");
        navigate("/profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update profile. Please try again.";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  if (authLoading || isLoading) {
    return <LoadingSpinner message="Loading profile data..." />;
  }

  if (error && !isLoading) {
    return <ErrorMessage message={error} />;
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
                  <FaUserEdit className="text-3xl" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Edit Your Profile
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Update your personal information and preferences
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
                    <FaUser className="mr-2" />
                    <span>Personal Information</span>
                  </h2>

                  <div className="space-y-6">
                    <div className="transition-all duration-300 hover:translate-x-1">
                      <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span>Full Name</span>
                        {dirtyFields.fullname && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            Modified
                          </span>
                        )}
                      </div>
                      <label
                        className={`input input-bordered border-2 ${
                          errors.fullname
                            ? "input-error border-red-300"
                            : dirtyFields.fullname
                            ? "border-blue-300"
                            : ""
                        } rounded-xl shadow-sm focus-within:shadow-blue-100 transition-all`}
                      >
                        <FaUser className="h-5 w-5 text-blue-500" />
                        <input
                          type="text"
                          className="grow focus:outline-none"
                          placeholder="Your full name"
                          {...register("fullname")}
                        />
                        {!errors.fullname && dirtyFields.fullname && (
                          <FaCheck className="text-green-500" />
                        )}
                      </label>
                      {errors.fullname && (
                        <p className="text-error text-sm mt-1 flex items-center">
                          <FaInfoCircle className="mr-1 text-xs" />
                          {errors.fullname.message}
                        </p>
                      )}
                    </div>

                    <div className="transition-all duration-300 hover:translate-x-1">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </div>
                      <label className="input input-bordered bg-gray-50 rounded-xl border-2 border-gray-200 shadow-sm">
                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          className="grow bg-transparent text-gray-600"
                          defaultValue={authUser?.email || ""}
                          disabled
                          readOnly
                        />
                        <span className="badge badge-neutral badge-xs">
                          Locked
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 italic mt-1 flex items-center">
                        <FaInfoCircle className="mr-1 text-xs" />
                        Email address cannot be changed for security reasons.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card bg-gradient-to-r from-violet-50 to-purple-100 shadow-sm p-6 rounded-2xl border border-purple-200">
                  <h2 className="text-xl font-semibold mb-5 text-violet-800 flex items-center">
                    <FaInfoCircle className="mr-2" />
                    <span>Additional Details</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="transition-all duration-300 hover:translate-x-1">
                      <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span>Date of Birth</span>
                        {dirtyFields.dob && (
                          <span className="ml-2 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                            Modified
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <label
                          className={`input input-bordered border-2 ${
                            errors.dob
                              ? "input-error border-red-300"
                              : dirtyFields.dob
                              ? "border-violet-300"
                              : ""
                          } rounded-xl shadow-sm focus-within:shadow-violet-100 transition-all`}
                        >
                          <FaCalendarAlt className="h-5 w-5 text-violet-500" />
                          <input
                            type="date"
                            className="grow focus:outline-none"
                            {...register("dob")}
                          />
                        </label>
                      </div>
                      {errors.dob && (
                        <p className="text-error text-sm mt-1 flex items-center">
                          <FaInfoCircle className="mr-1 text-xs" />
                          {errors.dob.message}
                        </p>
                      )}
                    </div>

                    <div className="transition-all duration-300 hover:translate-x-1">
                      <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span>Gender</span>
                        {dirtyFields.gender && (
                          <span className="ml-2 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                            Modified
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <label className="input items-center input-bordered border-2 rounded-xl shadow-sm focus-within:shadow-violet-100 transition-all">
                          <FaVenusMars className="h-5 w-5 text-violet-500 mr-2" />
                          <select
                            className={`select border-none bg-transparent w-full focus:outline-none ${
                              errors.gender ? "text-red-500" : ""
                            }`}
                            {...register("gender")}
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </label>
                      </div>
                      {errors.gender && (
                        <p className="text-error text-sm mt-1 flex items-center">
                          <FaInfoCircle className="mr-1 text-xs" />
                          {errors.gender.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 transition-all duration-300 hover:translate-x-1">
                    <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <span>Address</span>
                      {dirtyFields.address && (
                        <span className="ml-2 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                          Modified
                        </span>
                      )}
                    </div>
                    <label
                      className={`input input-bordered border-2 ${
                        errors.address
                          ? "input-error border-red-300"
                          : dirtyFields.address
                          ? "border-violet-300"
                          : ""
                      } rounded-xl shadow-sm focus-within:shadow-violet-100 transition-all`}
                    >
                      <FaMapMarkerAlt className="h-5 w-5 text-violet-500" />
                      <input
                        type="text"
                        className="grow focus:outline-none"
                        placeholder="Your address"
                        {...register("address")}
                      />
                      {!errors.address && dirtyFields.address && (
                        <FaCheck className="text-green-500" />
                      )}
                    </label>
                    {errors.address && (
                      <p className="text-error text-sm mt-1 flex items-center">
                        <FaInfoCircle className="mr-1 text-xs" />
                        {errors.address.message}
                      </p>
                    )}
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
                    disabled={submitLoading || !isDirty}
                    className={`btn ${
                      !isDirty ? "btn-disabled" : "btn-primary"
                    } rounded-xl px-6 transition-all duration-300`}
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
