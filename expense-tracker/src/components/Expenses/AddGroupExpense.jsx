import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { addExpense, getUsers, splitExpense } from "../../services/api";

const AddGroupExpense = ({
  onClose,
  onExpenseAdded,
  existingCategories = [],
}) => {
  const { user } = useAuth();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [formVisible, setFormVisible] = useState(false);

  // New state for group expense functionality
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [splitMethod, setSplitMethod] = useState("equal"); // equal, custom
  const [customSplits, setCustomSplits] = useState({});

  useEffect(() => {
    setTimeout(() => setFormVisible(true), 50);
    document.body.classList.add("overflow-hidden");
    fetchUsers();
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await getUsers();
      const filteredUsers = response.data.filter((u) => u.id !== user.id);
      setUsers(filteredUsers);
      setIsLoadingUsers(false);
    } catch (err) {
      console.error("Error fetching users", err);
      setError("Failed to load users. Please try again.");
      setIsLoadingUsers(false);
      setTimeout(() => setError(""), 3000);
    }
  };

  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
      // Remove from custom splits if exists
      const newSplits = { ...customSplits };
      delete newSplits[userId];
      setCustomSplits(newSplits);
    } else {
      setSelectedUsers([...selectedUsers, userId]);
      // Add to custom splits with default value
      if (splitMethod === "custom") {
        setCustomSplits({
          ...customSplits,
          [userId]: 0,
        });
      }
    }
  };

  const handleSplitMethodChange = (method) => {
    setSplitMethod(method);
    if (method === "custom") {
      // Initialize custom splits with equal values
      const split =
        selectedUsers.length > 0
          ? parseFloat(
              (parseFloat(amount || 0) / (selectedUsers.length + 1)).toFixed(2)
            )
          : 0;

      const newSplits = {};
      selectedUsers.forEach((userId) => {
        newSplits[userId] = split;
      });
      setCustomSplits(newSplits);
    }
  };

  const handleCustomSplitChange = (userId, value) => {
    setCustomSplits({
      ...customSplits,
      [userId]: parseFloat(value) || 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category || !description || !amount || !date) {
      setError("Please fill in all fields");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (selectedUsers.length === 0) {
      setError("Please select at least one user to split with");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate individual expense amounts
      let individualExpenses = [];

      if (splitMethod === "equal") {
        const splitAmount = parseFloat(
          (parseFloat(amount) / (selectedUsers.length + 1)).toFixed(2)
        );

        // Add current user's expense
        individualExpenses.push({
          UserId: user.id,
          Category: category,
          Description: `${description} (Group expense)`,
          Amount: splitAmount,
          Date: date,
          IsGroupExpense: true,
          GroupExpenseId: Date.now(), // Generate a temporary group ID
        });

        // Add other users' expenses
        console.log("Selected users:", selectedUsers);
        selectedUsers.forEach((userId) => {
          individualExpenses.push({
            UserId: userId,
            Category: category,
            Description: `${description} (Group expense)`,
            Amount: splitAmount,
            Date: date,
            IsGroupExpense: true,
            GroupExpenseId: individualExpenses[0].GroupExpenseId,
          });
        });
      } else {
        // Custom split
        // Calculate current user's part (the remainder)
        const othersTotal = Object.values(customSplits).reduce(
          (sum, val) => sum + val,
          0
        );
        const currentUserAmount = parseFloat(amount) - othersTotal;

        if (currentUserAmount < 0) {
          setError("The sum of splits exceeds the total amount");
          setIsSubmitting(false);
          setTimeout(() => setError(""), 3000);
          return;
        }

        // Add current user's expense
        individualExpenses.push({
          UserId: user.id,
          Category: category,
          Description: `${description} (Group expense)`,
          Amount: currentUserAmount,
          Date: date,
          IsGroupExpense: true,
          GroupExpenseId: Date.now(),
        });

        // Add other users' expenses
        selectedUsers.forEach((userId) => {
          individualExpenses.push({
            UserId: userId,
            Category: category,
            Description: `${description} (Group expense)`,
            Amount: customSplits[userId],
            Date: date,
            IsGroupExpense: true,
            GroupExpenseId: individualExpenses[0].GroupExpenseId,
          });
        });
      }

      // Save all expenses
      console.log("Saving expenses:", individualExpenses);
      const promises = individualExpenses.map((expense) => addExpense(expense));
      const responses = await Promise.all(promises);
      console.log("Expenses saved:", responses);

      try {
        let splitAmountEqual;
        if (splitMethod === "equal") {
          splitAmountEqual = parseFloat(
            (parseFloat(amount) / (selectedUsers.length + 1)).toFixed(2)
          );
        }
        const splitWithData = selectedUsers.map((userId) => {
          const user = users.find((u) => u.id === userId);
          const userAmount =
            splitMethod === "equal"
              ? splitAmountEqual
              : customSplits[userId] || 0;

          return {
            name: user.name,
            email: user.email,
            amount: userAmount,
          };
        });
        const splitRequest = {
          createdBy: user.name,
          date: date,
          description: description,
          splitWith: splitWithData,
        };
        await splitExpense(splitRequest);
      } catch (err) {
        console.error("Failed to send split notifications", err);
        setError("Expense added but notifications failed");
        setTimeout(() => setError(""), 3000);
      }

      setIsSubmitting(false);
      onExpenseAdded(responses[0].data); // Pass back the current user's expense
      setFormVisible(false);
      setTimeout(() => onClose(), 300);
    } catch (err) {
      console.error("Error adding group expense", err);
      setError("Failed to add group expense. Please try again.");
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

  // Calculate total of custom splits
  const customSplitTotal = Object.values(customSplits).reduce(
    (sum, val) => sum + val,
    0
  );
  const currentUserAmount = parseFloat(amount || 0) - customSplitTotal;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 transition-all duration-300">
      <div
        className={`absolute inset-0 bg-gradient-to-br from-gray-900/70 to-black/70 backdrop-blur-md transition-opacity duration-300 ${
          formVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      ></div>

      <div
        className={`relative bg-gradient-to-br from-gray-800 to-gray-900 text-gray-200 p-5 rounded-xl shadow-2xl w-full max-w-4xl border border-gray-700 transform transition-all duration-500 ease-out max-h-[90vh] overflow-hidden ${
          formVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-8"
        }`}
      >
        <div className="absolute inset-0 bg-purple-500/5 rounded-xl backdrop-blur-sm"></div>

        <div className="relative h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
              Add Group Expense
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

          <form
            onSubmit={handleSubmit}
            className="h-full overflow-y-auto custom-scrollbar"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Column - Basic Info */}
              <div className="space-y-4">
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
                      <div className="absolute z-10 w-full mt-1 bg-gray-800/90 backdrop-blur-md border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar animate-fadeIn">
                        <div className="p-2">
                          <div className="flex mb-2">
                            <input
                              type="text"
                              value={customCategory}
                              onChange={(e) =>
                                setCustomCategory(e.target.value)
                              }
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Total Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-gray-400">
                        ₹
                      </span>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Split Method
                  </label>
                  <div className="flex space-x-2 p-2 bg-gray-700/30 rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleSplitMethodChange("equal")}
                      className={`py-2 px-4 rounded-lg ${
                        splitMethod === "equal"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      } transition-colors duration-200 flex-1 text-center`}
                    >
                      Equal Split
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSplitMethodChange("custom")}
                      className={`py-2 px-4 rounded-lg ${
                        splitMethod === "custom"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      } transition-colors duration-200 flex-1 text-center`}
                    >
                      Custom Split
                    </button>
                  </div>
                </div>
              </div>

              {/* Second Column - Users and Split */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Split With
                  </label>

                  {isLoadingUsers ? (
                    <div className="flex justify-center p-4">
                      <svg
                        className="animate-spin h-5 w-5 text-gray-400"
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
                    </div>
                  ) : users.length === 0 ? (
                    <div className="p-3 bg-gray-700/50 rounded-lg text-gray-400 text-center">
                      No other users found
                    </div>
                  ) : (
                    <div className="h-32 overflow-y-auto custom-scrollbar p-1">
                      {users.map((u) => (
                        <div
                          key={u.id}
                          className={`flex items-center justify-between p-2 mb-1 rounded-lg cursor-pointer ${
                            selectedUsers.includes(u.id)
                              ? "bg-blue-900/30 border border-blue-700"
                              : "bg-gray-700/50 hover:bg-gray-700/70"
                          } transition-colors duration-200`}
                          onClick={() => toggleUserSelection(u.id)}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-2">
                              {u.name?.charAt(0) ||
                                u.username?.charAt(0) ||
                                "U"}
                            </div>
                            <span>{u.name || u.username}</span>
                          </div>
                          <div>
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(u.id)}
                              onChange={() => {}} // Handled by the parent div click
                              className="h-5 w-5 text-blue-600 rounded border-gray-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {splitMethod === "custom" && selectedUsers.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Custom Split Amounts
                    </label>
                    <div className="space-y-2 h-32 overflow-y-auto custom-scrollbar p-1">
                      {selectedUsers.map((userId) => {
                        const user = users.find((u) => u.id === userId);
                        return (
                          <div
                            key={userId}
                            className="flex items-center bg-gray-700/50 p-2 rounded-lg"
                          >
                            <div className="flex-1">
                              <span className="text-gray-300">
                                {user?.name || user?.username || "User"}
                              </span>
                            </div>
                            <div className="relative w-24">
                              <span className="absolute left-3 top-2 text-gray-400">
                                ₹
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                value={customSplits[userId] || ""}
                                onChange={(e) =>
                                  handleCustomSplitChange(
                                    userId,
                                    e.target.value
                                  )
                                }
                                className="w-full p-1 pl-7 bg-gray-800 rounded border border-gray-600 text-right"
                              />
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex items-center justify-between py-2 px-3 bg-gray-700/70 rounded-lg mt-2">
                        <span className="font-medium">Your share</span>
                        <span
                          className={`font-bold ${
                            currentUserAmount < 0
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          ₹{currentUserAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 px-3 bg-gray-800/70 rounded-lg">
                        <span className="font-medium">Total</span>
                        <span className="font-bold">
                          ₹{parseFloat(amount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4 pt-4 mt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedUsers.length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
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
                    Split Expense
                  </span>
                )}
              </button>
            </div>

            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                Group expenses are securely stored and shared with selected
                users
              </p>
            </div>
          </form>
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

          /* Custom scrollbar styling */
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(75, 85, 99, 0.1);
            border-radius: 8px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(
              to bottom,
              rgba(139, 92, 246, 0.5),
              rgba(59, 130, 246, 0.5)
            );
            border-radius: 8px;
            border: 1px solid rgba(31, 41, 55, 0.5);
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(
              to bottom,
              rgba(139, 92, 246, 0.7),
              rgba(59, 130, 246, 0.7)
            );
          }

          /* For Firefox */
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(139, 92, 246, 0.5) rgba(75, 85, 99, 0.1);
          }
        `}</style>
      </div>
    </div>
  );
};

export default AddGroupExpense;
