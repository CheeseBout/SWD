import { useState } from "react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password, remember });
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
              placeholder="Email"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
              placeholder="Password"
              required
            />
          </div>

          <div className="flex justify-between items-center">
            <label className="flex items-center text-gray-700">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="mr-2"
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
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
            type="submit"
            className="w-full text-black p-3 rounded-lg border-1 border-gray-300 hover:border-[#4096ff] hover:text-[#4096ff]"
          >
            SIGN IN WITH GOOGLE
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
    </div>
  );
}
