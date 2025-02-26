import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { addExpense } from "../../services/api";

const AddExpense = ({ onClose, onExpenseAdded, existingCategories = [] }) => {
  const { user } = useAuth();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  // Animation state
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after component mounts
    setTimeout(() => setFormVisible(true), 50);

    // Add body class to prevent scrolling when modal is open
    document.body.classList.add("overflow-hidden");

    // Cleanup when modal closes
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !description || !amount || !date) {
      setError("Please fill in all fields");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setIsSubmitting(true);
    const expense = {
      UserId: user.id,
      Category: category,
      Description: description,
      Amount: parseFloat(amount),
      Date: date,
    };

    try {
      const response = await addExpense(expense);
      if (response.data) {
        // Success animation
        setIsSubmitting(false);
        onExpenseAdded(response.data);

        // Start exit animation
        setFormVisible(false);
        setTimeout(() => onClose(), 300);
      }
    } catch (err) {
      console.error("Error adding expense", err);
      setError("Failed to add expense. Please try again.");
      setIsSubmitting(false);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleClose = () => {
    setFormVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setShowCategoryDropdown(false);
  };

  const handleCustomCategorySubmit = () => {
    if (customCategory.trim()) {
      setCategory(customCategory.trim());
      setCustomCategory("");
      setShowCategoryDropdown(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showCategoryDropdown &&
        !event.target.closest(".category-container")
      ) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCategoryDropdown]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 transition-all duration-300">
      {/* Improved backdrop with gradient and blur */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-gray-900/70 to-black/70 backdrop-blur-md transition-opacity duration-300 ${
          formVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      ></div>

      <div
        className={`relative bg-gradient-to-br from-gray-800 to-gray-900 text-gray-200 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 transform transition-all duration-500 ease-out ${
          formVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-8"
        }`}
      >
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-blue-500/5 rounded-xl backdrop-blur-sm"></div>

        <div className="relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Add New Expense
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-300 focus:outline-none group"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 backdrop-blur-sm border border-red-800 rounded-lg text-red-200 animate-pulse">
              <p className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative category-container">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Category
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  onClick={() => setShowCategoryDropdown(true)}
                  className="w-full p-3 pl-10 bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
                  placeholder="Select or type a category"
                  required
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 absolute left-3 top-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                {showCategoryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800/90 backdrop-blur-md border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-fadeIn">
                    <div className="p-2">
                      <div className="flex mb-2">
                        <input
                          type="text"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="flex-1 p-2 bg-gray-700/70 rounded-l-lg border border-gray-600 focus:outline-none"
                          placeholder="Add custom category"
                        />
                        <button
                          type="button"
                          onClick={handleCustomCategorySubmit}
                          className="px-3 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors duration-300"
                        >
                          Add
                        </button>
                      </div>
                      <ul>
                        {existingCategories.length > 0 ? (
                          existingCategories.map((cat) => (
                            <li
                              key={cat}
                              onClick={() => handleCategorySelect(cat)}
                              className="p-2 hover:bg-gray-700/70 cursor-pointer rounded-lg transition-colors duration-200 flex items-center"
                            >
                              <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                              {cat}
                            </li>
                          ))
                        ) : (
                          <li className="p-2 text-gray-400 text-sm">
                            No categories yet. Create your first one!
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Description
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 pl-10 bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
                  placeholder="What did you spend on?"
                  required
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 absolute left-3 top-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 pl-10 bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 pl-10 bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
                  required
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 absolute left-3 top-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add Expense
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              All expenses are securely stored and encrypted
            </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AddExpense;
