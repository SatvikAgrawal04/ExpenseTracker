// src/components/expenses/ExpenseItem.jsx
import React from "react";

const ExpenseItem = ({
  expense,
  expenseIndex,
  isAnimating,
  deleteConfirm,
  onConfirmDelete,
  onRequestDelete,
  onCancelDelete,
}) => {
  return (
    <li
      id={`expense-${expense.id}`}
      className={`flex justify-between items-center p-3 ${
        isAnimating
          ? "bg-red-900/20 scale-95 opacity-50"
          : "bg-gray-700 bg-opacity-50"
      } rounded-lg hover:bg-gray-600 transition-all duration-300 group animate-fade-in`}
      style={{
        animationDelay: `${expenseIndex * 50 + 300}ms`,
      }}
    >
      <div>
        <p className="font-medium text-gray-200 group-hover:text-white transition-colors duration-300">
          {expense.description}
        </p>
        <p className="text-sm text-gray-400 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
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
          {new Date(expense.date).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <p className="font-semibold text-gray-200 group-hover:text-blue-300 transition-colors duration-300">
          ₹{expense.amount.toFixed(2)}
        </p>
        {deleteConfirm ? (
          <div className="flex space-x-2 animate-fade-in">
            <button
              onClick={onConfirmDelete}
              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
            >
              Confirm
            </button>
            <button
              onClick={onCancelDelete}
              className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={onRequestDelete}
            className="p-2 text-xs text-gray-400 rounded-full hover:bg-red-500 hover:text-white transition-all duration-300 transform hover:scale-110 focus:outline-none"
            aria-label="Delete expense"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </li>
  );
};

export default ExpenseItem;
