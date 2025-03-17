import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContextObject";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { FaGoogle, FaEnvelope, FaLock, FaChevronRight } from "react-icons/fa";

const schema = yup.object({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Please enter your email"),
  password: yup.string().required("Please enter your password"),
});

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(null);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema), mode: "onSubmit" });

  const onSubmit = async (data) => {
    setError(null);
    try {
      const response = await authService.login(data.email, data.password);
      const { accessToken, refreshToken } = response.data.tokens;
      const userData = response.data.user;

      if (!userData.isActive) {
        setError("This account has been deactivated. Please contact support for assistance.");
        return;
      }

      if (!userData.isVerified && userData.role !== "admin") {
        setError("Your account is not verified. Please verify your email to continue.");
        return;
      }

      await login(accessToken);

      if (remember) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      setTimeout(() => {
        navigate("/");
      }, 100);
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      return;
    }

    setIsResetting(true);
    try {
      await authService.forgotPassword(resetEmail);
      setResetSuccess(true);
      setTimeout(() => {
        document.getElementById("forgot_password_modal").close();
        setResetSuccess(false);
        setResetEmail("");
      }, 3000);
    } catch (err) {
      console.log(err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left side - Image section */}
      <div className="hidden lg:flex items-center justify-center w-full lg:w-1/2 p-12 bg-white">
        <div className="relative w-full max-w-lg">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          <div className="relative">
            <img
              src="../couple2.jpg"
              alt="couple"
              className="rounded-2xl shadow-2xl w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl flex items-end">
              <div className="p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">
                  Connect, Understand, Thrive
                </h2>
                <p className="text-sm opacity-90">
                  Your journey to better relationships starts here
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-500">Sign in to continue your journey</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  className={`w-full pl-10 pr-3 py-3 border ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="you@example.com"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  onClick={() =>
                    document.getElementById("forgot_password_modal").showModal()
                  }
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  className={`w-full pl-10 pr-3 py-3 border ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="••••••••"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                ) : (
                  <>
                    Sign In <FaChevronRight className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => authService.loginWithGoogle()}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <FaGoogle className="h-5 w-5 text-red-600 mr-2" />
                Sign in with Google
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Reset password modal */}
      <dialog id="forgot_password_modal" className="modal">
        <div className="modal-box bg-white p-8 rounded-xl shadow-xl max-w-md mx-auto">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-xl mb-2 text-gray-800">
            Reset Password
          </h3>
          <p className="text-gray-600 mb-6">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>

          {resetSuccess ? (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <p className="text-green-700">
                Reset link sent! Please check your email inbox.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {!resetEmail && (
                    <p className="mt-2 text-xs text-red-600">
                      Email is required
                    </p>
                  )}
                </div>
                <button
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                  onClick={handleResetPassword}
                  disabled={isResetting || !resetEmail}
                >
                  {isResetting ? (
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
};

export default LoginPage;
