import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getExpenses, deleteExpense } from "../../services/api";
import AddExpense from "./AddExpense";
import ExpenseFilters from "./ExpenseFilters";
import SpendingOverview from "./SpendingOverview";
import CategoryGroup from "./CategoryGroup";
import TotalSpend from "./TotalSpend";
import ExpenseHeader from "./ExpenseHeader";
import AddGroupExpense from "./AddGroupExpense";
import "./ExpenseList.css";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { PieChartIcon, X } from "lucide-react";

const ExpenseList = () => {
  const { logout, user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [animateCard, setAnimateCard] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showPieChart, setShowPieChart] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddGroupExpense, setShowAddGroupExpense] = useState(false);

  const COLORS = [
    "#1E40AF",
    "#3B82F6",
    "#60A5FA",
    "#93C5FD",
    "#BFDBFE",
    "#A855F7",
    "#EF4444",
    "#F59E0B",
    "#10B981",
    "#6366F1",
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      if (user) {
        try {
          setLoading(true);
          const { data } = await getExpenses();
          setExpenses(data);
          setTimeout(() => setShowStats(true), 500);
        } catch (error) {
          console.error("Failed to fetch expenses:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchExpenses();
  }, [user]);

  const handleDelete = async (id) => {
    try {
      setAnimateCard(id);
      setTimeout(async () => {
        await deleteExpense(id);
        setExpenses(expenses.filter((expense) => expense.id !== id));
        setAnimateCard(null);
      }, 300);
    } catch (error) {
      console.error("Error deleting expense:", error);
      setAnimateCard(null);
    }
  };

  const handleExpenseAdded = (newExpense) => {
    setExpenses([...expenses, newExpense]);
    setShowAddExpense(false);
    setTimeout(() => {
      const element = document.getElementById(`expense-${newExpense.id}`);
      if (element) element.classList.remove("bg-green-900");
    }, 2000);
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory =
      filterCategory === "" ||
      (expense.category || expense.Category) === filterCategory;
    const matchesSearch =
      searchTerm === "" ||
      (expense.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortBy === "amount") {
      return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
    }
    return 0;
  });

  const groupedExpenses = sortedExpenses.reduce((acc, expense) => {
    const category = expense.category || expense.Category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = { expenses: [], total: 0 };
    }
    acc[category].expenses.push(expense);
    acc[category].total += expense.amount;
    return acc;
  }, {});

  const categories = [
    ...new Set(
      expenses.map((e) => e.category || e.Category || "Uncategorized")
    ),
  ];

  const overallTotal = sortedExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const calculatePercentage = (categoryTotal) => {
    return overallTotal > 0 ? (categoryTotal / overallTotal) * 100 : 0;
  };

  const getMonthsData = () => {
    const monthsData = {};
    sortedExpenses.forEach((expense) => {
      const month = new Date(expense.date).toLocaleString("default", {
        month: "short",
      });
      if (!monthsData[month]) monthsData[month] = 0;
      monthsData[month] += expense.amount;
    });
    return monthsData;
  };

  const getPieChartData = () => {
    return Object.keys(groupedExpenses).map((category, index) => ({
      name: category,
      value: groupedExpenses[category].total,
      color: COLORS[index % COLORS.length],
    }));
  };

  const monthsData = getMonthsData();
  const pieChartData = getPieChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200 flex flex-col items-center p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <ExpenseHeader
          setShowAddExpense={setShowAddExpense}
          setShowAddGroupExpense={setShowAddGroupExpense}
          logout={logout}
        />
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowPieChart(true)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-600/30 transform hover:scale-105 flex items-center justify-center gap-2 backdrop-blur-sm"
            disabled={expenses.length === 0}
            aria-label="View expense visualization"
          >
            <PieChartIcon size={18} />
            Visualize Expenses
          </button>
        </div>
        <ExpenseFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          categories={categories}
        />
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400 animate-pulse text-lg">
              Loading your expenses...
            </p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-10 text-center shadow-xl border border-gray-700/50 transform transition-all duration-500 animate-fade-in-up hover:border-gray-600/50 hover:shadow-blue-900/10">
            <div className="h-20 w-20 mx-auto text-gray-500 mb-6 animate-bounce-slow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p className="text-gray-300 text-xl mb-6 font-light">
              No expenses found.
            </p>
            <button
              onClick={() => setShowAddExpense(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/50 transform hover:scale-105 font-medium"
            >
              Add Your First Expense
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <SpendingOverview monthsData={monthsData} showStats={showStats} />
            {Object.keys(groupedExpenses).length === 0 ? (
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg border border-gray-700/50 animate-fade-in-up">
                <p className="text-gray-300 text-lg">
                  No expenses match your filters.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {Object.keys(groupedExpenses).map(
                    (category, categoryIndex) => (
                      <CategoryGroup
                        key={category}
                        category={category}
                        expenses={groupedExpenses[category].expenses}
                        total={groupedExpenses[category].total}
                        percentage={calculatePercentage(
                          groupedExpenses[category].total
                        )}
                        categoryIndex={categoryIndex}
                        animateCard={animateCard}
                        onDelete={handleDelete}
                        formatCurrency={formatCurrency}
                      />
                    )
                  )}
                </div>
                <TotalSpend
                  total={overallTotal}
                  formatCurrency={formatCurrency}
                />
              </>
            )}
          </div>
        )}
      </div>
      {showAddExpense && (
        <AddExpense
          onClose={() => setShowAddExpense(false)}
          onExpenseAdded={handleExpenseAdded}
          existingCategories={categories}
        />
      )}
      {showAddGroupExpense && (
        <AddGroupExpense
          onClose={() => setShowAddGroupExpense(false)}
          onExpenseAdded={handleExpenseAdded}
          existingCategories={categories}
        />
      )}
      {showPieChart && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700/50 transform transition-all duration-300 animate-scale-up">
            <div className="p-5 border-b border-gray-700/70 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-100">
                Expense Breakdown by Category
              </h3>
              <button
                onClick={() => setShowPieChart(false)}
                className="text-gray-400 hover:text-white transition-colors hover:bg-gray-700/50 p-2 rounded-full"
                aria-label="Close chart"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {pieChartData.length === 0 ? (
                <div className="text-center py-16 text-gray-300">
                  No expense data to visualize
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <p className="text-center text-gray-300 text-lg">
                      Total Expenses:{" "}
                      <span className="font-semibold text-white">
                        {formatCurrency(overallTotal)}
                      </span>
                    </p>
                  </div>
                  <div className="h-72 w-full mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          dataKey="value"
                          labelLine={true}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          animationDuration={800}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              stroke="rgba(0,0,0,0.1)"
                              strokeWidth={1}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: "rgba(30, 41, 59, 0.9)",
                            border: "1px solid #475569",
                            borderRadius: "0.5rem",
                            color: "#e2e8f0",
                            padding: "8px 12px",
                          }}
                        />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{ color: "#e2e8f0" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {pieChartData.map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/60 hover:bg-gray-700/80 transition-all backdrop-blur-sm border border-gray-600/20 hover:border-gray-600/40"
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-100 truncate">
                            {category.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {formatCurrency(category.value)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {((category.value / overallTotal) * 100).toFixed(1)}
                            %
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-gray-700/70 flex justify-end">
              <button
                onClick={() => setShowPieChart(false)}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
