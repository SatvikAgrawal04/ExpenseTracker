// src/components/expenses/ExpenseFilters.jsx
import React from "react";

const ExpenseFilters = ({
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  categories,
}) => {
  return (
    <div className="bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-lg p-4 mb-6 shadow-lg border border-gray-700 transform transition-all duration-500 hover:shadow-blue-900/20 hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-center mb-4 space-y-3 md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Search
          </label>
          <div className="relative group">
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 bg-gray-700 bg-opacity-70 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300 border border-gray-600 focus:border-blue-400 group-hover:border-blue-400"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-3 top-2.5 text-gray-400 group-hover:text-blue-400 transition-colors duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Category
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full md:w-40 p-2 bg-gray-700 bg-opacity-70 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300 border border-gray-600 hover:border-blue-400"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Sort By
          </label>
          <div className="flex">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-32 p-2 bg-gray-700 bg-opacity-70 rounded-l-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300 border border-gray-600 hover:border-blue-400"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="bg-gray-700 bg-opacity-70 p-2 rounded-r-lg border-t border-r border-b border-gray-600 hover:bg-gray-600 transition-all duration-300 hover:border-blue-400"
            >
              {sortOrder === "asc" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseFilters;
