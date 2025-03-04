import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContextObject";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
const schema = yup.object({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Please enter your email"),
  password: yup.string().required("Please enter your password"),
});

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(null);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), mode: "onSubmit" });

  const onSubmit = async (data) => {
    setError(null);
    try {
      const response = await authService.login(data.email, data.password);
      const { accessToken, refreshToken } = response.data.tokens;

      // Use the AuthContext login function instead
      login(accessToken);

      if (remember) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      navigate("/");
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
    try {
      const response = await authService.forgotPassword(resetEmail);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-white p-4 gap-40">
      <div>
        <img
          src="../couple2.jpg"
          alt="couple"
          className="w-max h-max rounded-lg"
        />
      </div>
      <div className="w-full max-w-md bg-gray-50 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-900">Sign In</h1>
        <p className="text-lg text-gray-400 mt-2">
          Enter your email and password to sign in
        </p>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
              placeholder="Email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-2">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
              placeholder="Password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-2">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center">
            <label className="flex items-center text-gray-700">
              <input
                type="checkbox"
                className="toggle toggle-primary mr-2 border-blue-500"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() =>
                document.getElementById("forgot_password_modal").showModal()
              }
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-400"
          >
            SIGN IN
          </button>
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <button
            type="button"
            className="w-full text-black p-3 rounded-lg border-1 border-gray-300 hover:border-[#4096ff] hover:text-[#4096ff]"
            onClick={() => authService.loginWithGoogle()}
          >
            <i className="fa-solid fa-g"></i> SIGN IN WITH GOOGLE
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account ?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
      <dialog id="forgot_password_modal" className="modal">
        <div className="modal-box bg-white p-6 rounded-lg shadow-lg w-96">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg text-gray-800">Reset Password</h3>
          <p className="text-sm text-gray-600 py-2">
            Enter your email address to receive a password reset link.
          </p>

          <input
            placeholder="Your email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="input input-bordered w-full mt-2 p-2 rounded-md border-gray-300"
          />
          {!resetEmail && (
            <p className="text-xs text-red-500 mt-2">Email is required</p>
          )}
          {}
          <button
            className="btn btn-primary w-full mt-4"
            onClick={handleResetPassword}
          >
            Send Reset Link
          </button>
        </div>
      </dialog>
    </div>
  );
}
