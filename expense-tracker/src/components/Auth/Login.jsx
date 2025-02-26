import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const response = await login(email, password);
    console.log(response);
    setIsLoading(false);
    if (response.error) {
      setError(response.error);
      setTimeout(() => setError(""), 2500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6 py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-64 h-64 rounded-full bg-indigo-600 opacity-10 -top-10 -right-10 animate-pulse"></div>
        <div
          className="absolute w-96 h-96 rounded-full bg-purple-600 opacity-10 -bottom-20 -left-20 animate-pulse"
          style={{ animationDuration: "8s" }}
        ></div>
      </div>

      <div className="max-w-md w-full backdrop-blur-sm bg-gray-800 bg-opacity-80 p-8 rounded-2xl shadow-2xl border border-gray-700 transform transition-all duration-500 hover:shadow-indigo-500/10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            Login
          </h2>
          <p className="text-gray-400 mt-2">
            Welcome back! Please sign in to your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-2 transition-all duration-300 group-focus-within:text-indigo-400">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full p-3 rounded-lg bg-gray-700 bg-opacity-50 text-gray-200 border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-300"
              />
              {email && email.includes("@") && (
                <span className="absolute right-3 top-3 text-indigo-400 transform transition-transform duration-300 ease-in-out animate-fadeIn">
                  ✓
                </span>
              )}
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-2 transition-all duration-300 group-focus-within:text-indigo-400">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full p-3 rounded-lg bg-gray-700 bg-opacity-50 text-gray-200 border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-300"
              />
              {password && (
                <span className="absolute right-3 top-3 text-indigo-400 transform transition-transform duration-300 ease-in-out animate-fadeIn">
                  •••
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 mt-4 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-indigo-500/20 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-70 disabled:transform-none disabled:hover:translate-y-0"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="text-center mt-8">
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 transition-colors duration-300 hover:underline underline-offset-2"
          >
            Don't have an account? Register here
          </Link>
        </div>
      </div>

      {/* Floating animated elements */}
      <div className="absolute top-1/4 left-1/4 w-6 h-6 rounded-full bg-indigo-500 opacity-20 animate-float"></div>
      <div
        className="absolute top-3/4 right-1/4 w-4 h-4 rounded-full bg-purple-500 opacity-20 animate-float"
        style={{ animationDelay: "1s", animationDuration: "7s" }}
      ></div>
      <div
        className="absolute bottom-1/3 left-1/3 w-3 h-3 rounded-full bg-pink-500 opacity-20 animate-float"
        style={{ animationDelay: "2s", animationDuration: "8s" }}
      ></div>

      {/* Error Popup */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 animate-bounce-gentle opacity-90">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            Invalid Credentials
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(0) translateX(20px);
          }
          75% {
            transform: translateY(20px) translateX(10px);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-float {
          animation: float 6s infinite ease-in-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes bounce-gentle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
