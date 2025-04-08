import React from "react";

const TotalSpend = ({ total }) => {
  return (
    <div
      className="bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm rounded-lg shadow-lg p-5 border border-gray-700 transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-900/20 animate-fade-in-up"
      style={{ animationDelay: "300ms" }}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Total Spend
        </h3>
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse-slow">
          ₹{total.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default TotalSpend;
