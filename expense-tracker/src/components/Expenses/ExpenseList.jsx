import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getExpenses, deleteExpense } from "../../services/api";
import AddExpense from "./AddExpense";
import ExpenseFilters from "./ExpenseFilters";
import SpendingOverview from "./SpendingOverview";
import CategoryGroup from "./CategoryGroup";
import TotalSpend from "./TotalSpend";
import ExpenseHeader from "./ExpenseHeader";
import "./ExpenseList.css";

const ExpenseList = () => {
  const { logout, user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [animateCard, setAnimateCard] = useState(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (user) {
        try {
          setLoading(true);
          const { data } = await getExpenses();
          setExpenses(data);
          // Animate stats appearance after data loads
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
      // Animate card removal
      setAnimateCard(id);
      setTimeout(async () => {
        await deleteExpense(id);
        setExpenses(expenses.filter((expense) => expense.id !== id));
        setDeleteConfirm(null);
        setAnimateCard(null);
      }, 300);
    } catch (error) {
      console.error("Error deleting expense:", error);
      setAnimateCard(null);
    }
  };

  // Filter and sort expenses
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

  // Group expenses by category
  const groupedExpenses = sortedExpenses.reduce((acc, expense) => {
    const category = expense.category || expense.Category;
    if (!acc[category]) {
      acc[category] = { expenses: [], total: 0 };
    }
    acc[category].expenses.push(expense);
    acc[category].total += expense.amount;
    return acc;
  }, {});

  // Get unique categories for filter
  const categories = [
    ...new Set(expenses.map((e) => e.category || e.Category)),
  ];

  // Compute overall total spend
  const overallTotal = sortedExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Calculate percentage for each category
  const calculatePercentage = (categoryTotal) => {
    return overallTotal > 0 ? (categoryTotal / overallTotal) * 100 : 0;
  };

  // Get month names for spending trends
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

  const monthsData = getMonthsData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200 flex flex-col items-center p-4 md:p-6">
      <div className="w-full max-w-4xl">
        {/* Header with animated gradient text */}
        <ExpenseHeader logout={logout} setShowAddExpense={setShowAddExpense} />

        {/* Filters and Search Section with improved animations */}

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
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400 animate-pulse">
              Loading your expenses...
            </p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="bg-gray-800 bg-opacity-60 rounded-lg p-8 text-center shadow-lg border border-gray-700 transform transition-all duration-500 animate-fade-in-up">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-500 mb-4 animate-bounce-slow"
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
            <p className="text-gray-400 text-lg mb-4">No expenses found.</p>
            <button
              onClick={() => setShowAddExpense(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/50 transform hover:scale-105"
            >
              Add Your First Expense
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Spending Overview Card (New) */}
            <SpendingOverview monthsData={monthsData} showStats={showStats} />

            {/* Expense Categories */}

            {Object.keys(groupedExpenses).length === 0 ? (
              <div className="bg-gray-800 bg-opacity-60 rounded-lg p-8 text-center shadow-lg border border-gray-700 animate-fade-in-up">
                <p className="text-gray-400">No expenses match your filters.</p>
              </div>
            ) : (
              Object.keys(groupedExpenses).map((category, categoryIndex) => (
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
                />
              ))
            )}

            <TotalSpend total={overallTotal} />
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpense
          onClose={() => setShowAddExpense(false)}
          onExpenseAdded={(newExpense) => {
            setExpenses([...expenses, newExpense]);
            // Optional animation for new expense - you'd need to track the newest ID
            setTimeout(() => {
              const element = document.getElementById(
                `expense-${newExpense.id}`
              );
              if (element) element.classList.remove("bg-green-900");
            }, 2000);
          }}
          existingCategories={categories}
        />
      )}
    </div>
  );
};

export default ExpenseList;
