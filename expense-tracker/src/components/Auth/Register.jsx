import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const checkPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length > 6) strength += 1;
    if (pwd.length > 10) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register(name, email, password);
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsSubmitting(false);
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
            Create an Account
          </h2>
          <p className="text-gray-400 mt-2">
            Join us today! It's quick and easy.
          </p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-2 transition-all duration-300 group-focus-within:text-indigo-400">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full p-3 rounded-lg bg-gray-700 bg-opacity-50 text-gray-200 border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-300"
              />
              {name && (
                <span className="absolute right-3 top-3 text-indigo-400 transform transition-transform duration-300 ease-in-out animate-fadeIn">
                  ✓
                </span>
              )}
            </div>
          </div>

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
                onChange={handlePasswordChange}
                placeholder="Create a password"
                required
                className="w-full p-3 rounded-lg bg-gray-700 bg-opacity-50 text-gray-200 border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none transition-all duration-300"
              />
            </div>

            {/* Password strength indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex h-1 mt-1 mb-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`transition-all duration-500 ease-out ${
                      passwordStrength === 0
                        ? "bg-red-500 w-1/5"
                        : passwordStrength === 1
                        ? "bg-red-400 w-2/5"
                        : passwordStrength === 2
                        ? "bg-yellow-500 w-3/5"
                        : passwordStrength === 3
                        ? "bg-yellow-400 w-4/5"
                        : "bg-green-500 w-full"
                    }`}
                  ></div>
                </div>
                <p className="text-xs text-gray-400">
                  {passwordStrength < 2 &&
                    "Weak password - add special characters, numbers, and capital letters"}
                  {passwordStrength >= 2 &&
                    passwordStrength < 4 &&
                    "Medium strength - add more variety for a stronger password"}
                  {passwordStrength >= 4 && "Strong password!"}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 mt-4 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-indigo-500/20 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-70 disabled:transform-none disabled:hover:translate-y-0"
          >
            {isSubmitting ? (
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
                Creating Account...
              </span>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <div className="text-center mt-8">
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 transition-colors duration-300 hover:underline underline-offset-2"
          >
            Already have an account? Login here
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
      `}</style>
    </div>
  );
};

export default Register;
