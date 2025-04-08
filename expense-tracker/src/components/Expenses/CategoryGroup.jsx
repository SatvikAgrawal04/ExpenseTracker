// src/components/expenses/CategoryGroup.jsx
import React, { useState } from "react";
import ExpenseItem from "./ExpenseItem";

const CategoryGroup = ({
  category,
  expenses,
  total,
  percentage,
  categoryIndex,
  animateCard,
  onDelete,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  return (
    <div
      className={`bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-gray-700 transition-all duration-500 hover:shadow-xl hover:shadow-blue-900/20 animate-fade-in-up`}
      style={{ animationDelay: `${categoryIndex * 150}ms` }}
    >
      <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-3">
        <h3 className="text-xl font-semibold text-gray-200 group flex items-center">
          <span className="mr-2 text-blue-400 opacity-75">#</span>
          {category}
        </h3>
        <div className="text-right">
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            ₹{total.toFixed(2)}
          </span>
          <div className="text-xs text-gray-400 mt-1">
            {percentage.toFixed(1)}% of total
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
          }}
        ></div>
      </div>

      <ul className="space-y-3">
        {expenses.map((expense, expenseIndex) => (
          <ExpenseItem
            key={expense.id}
            expense={expense}
            expenseIndex={expenseIndex}
            isAnimating={animateCard === expense.id}
            deleteConfirm={deleteConfirm === expense.id}
            onConfirmDelete={() => onDelete(expense.id)}
            onRequestDelete={() => setDeleteConfirm(expense.id)}
            onCancelDelete={() => setDeleteConfirm(null)}
          />
        ))}
      </ul>
    </div>
  );
};

export default CategoryGroup;
