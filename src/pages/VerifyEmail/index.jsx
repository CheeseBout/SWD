import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authService } from "../../services/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendVerification = async () => {
    if (!resendEmail) return;

    setIsResending(true);
    try {
      await authService.resendVerification(resendEmail);
      setResendSuccess(true);
    } catch (error) {
      console.error("Failed to resend verification:", error);
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    const verifyEmailToken = async () => {
      // Fix to handle malformed URL with multiple question marks
      const url = window.location.href;
      let token, email;

      // Check if the URL has token and email params but in incorrect format
      if (url.includes("?token=") && url.includes("?email=")) {
        const tokenStart = url.indexOf("?token=") + 7;
        const tokenEnd = url.indexOf("?email=");
        token = url.substring(tokenStart, tokenEnd);

        const emailStart = url.indexOf("?email=") + 7;
        email = url.substring(emailStart);
      } else {
        // Regular approach using searchParams
        token = searchParams.get("token");
        email = searchParams.get("email");
      }

      if (!token || !email) {
        setVerificationStatus("error");
        setErrorMessage(
          "Missing verification information. Please check your email link."
        );
        return;
      }

      try {
        await authService.verifyEmail(email, token);
        setVerificationStatus("success");
      } catch (error) {
        console.error("Email verification failed:", error);
        setVerificationStatus("error");
        setErrorMessage(
          error.response?.data?.message ||
            "Verification failed. The link may be expired or invalid."
        );
      }
    };

    verifyEmailToken();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Email Verification
          </h1>
        </div>

        {verificationStatus === "verifying" && (
          <div className="text-center p-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">
              Verifying your email address...
            </p>
          </div>
        )}

        {verificationStatus === "success" && (
          <div className="text-center p-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-600 mb-4">
              Your email has been successfully verified. You can now login to
              your account.
            </p>
            <Link
              to="/login"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center"
            >
              Go to Login
            </Link>
          </div>
        )}

        {verificationStatus === "error" && (
          <div className="text-center p-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>

            {resendSuccess ? (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 text-left">
                <p className="text-green-700">
                  Verification email sent! Please check your inbox.
                </p>
              </div>
            ) : (
              <div className="mt-4 mb-6">
                <h3 className="text-md font-medium text-gray-700 mb-2">
                  Need a new verification link?
                </h3>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleResendVerification}
                    disabled={!resendEmail || isResending}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {isResending ? (
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    ) : (
                      "Resend"
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-2">
              <Link
                to="/login"
                className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
