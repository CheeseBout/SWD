import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/api";

const schema = yup.object({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Please enter your email"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters long")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    )
    .matches(/\d/, "Password must contain at least one number")
    .required("Please enter your password"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password"), null], "Passwords do not match"),
  fullname: yup.string().required("Please enter your full name"),
  username: yup.string().required("Please enter your username"),
  dob: yup
    .string()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .required("Please select your date of birth"),
  gender: yup.string().required("Please select your gender"),
});

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);

  const [notification, setNotification] = useState({ type: "", message: "" });

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
    setValue,
  } = useForm({ resolver: yupResolver(schema), mode: "onChange" });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  useEffect(() => {
    setValue("role", "user");
  }, []);
  useEffect(() => {
    if (confirmPassword) {
      trigger("confirmPassword");
    }
  }, [password, trigger]);

  const nextStep = async () => {
    if (currentStep === 2) {
      const isValid = await trigger(["email", "password", "confirmPassword"]); // Kích hoạt validation
      if (!isValid) return; // Nếu có lỗi thì không chuyển step
    }
    setCurrentStep((prev) => prev + 1);
  };
  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        fullname: data.fullname,
        username: data.username,
        email: data.email,
        password: data.password,
        dob: data.dob,
        gender: data.gender,
        role: data.role,
      };

      await authService.register(payload);
      setNotification({
        type: "success",
        message: "Sign up successfully!",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setNotification({
        type: "error",
        message: "Email or Username already in use",
      });

      setTimeout(() => {
        setNotification({ type: "", message: "" });
      }, 3000);
    }
  };

  const isStep2Valid = () => {
    return (
      !errors.email &&
      !errors.password &&
      !errors.confirmPassword &&
      watch("email") &&
      watch("password") &&
      watch("confirmPassword") &&
      watch("password") === watch("confirmPassword")
    );
  };

  return (
    <>
      <div className="toast toast-top toast-end ">
        {notification.message && (
          <div
            className={`alert ${
              notification.type === "success" ? "alert-success" : "alert-error"
            } mt-20`}
          >
            <span>{notification.message}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center items-center min-h-screen bg-white">
        <h1 className="text-4xl font-bold mb-6">Register</h1>

        <div className="bg-gray-100 p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <ul className="steps mb-6 w-full">
              <li className={`step ${currentStep >= 1 ? "step-primary" : ""}`}>
                Role
              </li>
              <li className={`step ${currentStep >= 2 ? "step-primary" : ""}`}>
                Account
              </li>
              <li className={`step ${currentStep === 3 ? "step-primary" : ""}`}>
                Info
              </li>
            </ul>

            {/* Form */}
            <form className="space-y-4">
              {currentStep === 1 && (
                <div>
                  <h2 className="text-lg font-semibold text-center mb-4">
                    Select Your Role
                  </h2>

                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="user"
                        defaultChecked
                        {...register("role")}
                        checked={watch("role") === "user"}
                      />
                      <span>User</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="couple_therapist"
                        {...register("role")}
                        checked={watch("role") === "couple_therapist"} // Liên kết với giá trị của form
                      />
                      <span>Couple Therapist</span>
                    </label>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-center mb-4">
                    Create Account
                  </h2>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <div className="input input-bordered flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="h-4 w-4 opacity-70"
                    >
                      <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                      <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                    </svg>
                    <input
                      type="email"
                      className="grow"
                      placeholder="Email "
                      id="email"
                      {...register("email")}
                    />
                  </div>
                  <p className="text-red-500 text-sm">
                    {errors.email?.message}
                  </p>

                  <label
                    className="block text-sm font-medium text-gray-700 mb-1 mt-6"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <div className="input input-bordered flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="h-4 w-4 opacity-70"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <input
                      type="password"
                      className="grow"
                      id="password"
                      {...register("password")}
                    />
                  </div>
                  <p className="text-red-500 text-sm">
                    {errors.password?.message}
                  </p>

                  <div className="input input-bordered flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="h-4 w-4 opacity-70"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      className="grow"
                      {...register("confirmPassword")}
                    />
                  </div>
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword?.message}
                  </p>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-center mb-4">
                    Personal Info
                  </h2>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="input w-full"
                      {...register("fullname")}
                    />
                  </div>
                  <p className="text-red-500 text-sm">
                    {errors.fullname?.message}
                  </p>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      {...register("username")}
                      placeholder="Enter your username"
                      className="input w-full"
                    />
                    <p className="text-red-500 text-sm">
                      {errors.username?.message}
                    </p>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      {...register("dob")}
                      className="input w-full"
                    />
                    <p className="text-red-500 text-sm">
                      {errors.dob?.message}
                    </p>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      {...register("gender")}
                      className="select select-bordered w-full max-w-xs"
                    >
                      <option value="" disabled selected>
                        What is your gender?
                      </option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <p className="text-red-500 text-sm">
                      {errors.gender?.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-between">
                {currentStep === 1 && <button></button>}
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500"
                  >
                    Back
                  </button>
                )}
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className={`py-2 px-4 rounded-lg ${
                      currentStep === 2 && !isStep2Valid()
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                    disabled={currentStep === 2 && !isStep2Valid()}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
                  >
                    Register
                  </button>
                )}
              </div>
            </form>
            <p className="text-center mt-8 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
