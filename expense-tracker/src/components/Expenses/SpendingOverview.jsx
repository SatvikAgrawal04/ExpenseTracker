import React from "react";

const SpendingOverview = ({ monthsData, showStats }) => {
  return (
    <div
      className={`bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-lg shadow-lg p-5 border border-gray-700 transition-all duration-1000 transform ${
        showStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <h3 className="text-lg font-semibold mb-3 text-blue-400">
        Spending Overview
      </h3>
      <div className="flex flex-wrap -mx-2">
        {Object.entries(monthsData).map(([month, amount], index) => (
          <div key={month} className="w-1/2 sm:w-1/3 md:w-1/4 px-2 mb-4">
            <div
              className="bg-gray-700 bg-opacity-50 rounded-lg p-3 h-full transform transition-all duration-500 hover:scale-105 hover:shadow-md hover:shadow-blue-900/20"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-sm text-gray-400">{month}</div>
              <div className="text-lg font-bold text-blue-400">
                ₹{amount.toFixed(2)}
              </div>
              {/* <div className="w-full bg-gray-600 h-1 mt-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-1 rounded-full transition-all duration-1000"
                  style={{
                    width: `${
                      (amount / Math.max(...Object.values(monthsData))) * 100
                    }%`,
                    animationDelay: `${index * 150 + 500}ms`,
                  }}
                ></div>
              </div> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpendingOverview;
