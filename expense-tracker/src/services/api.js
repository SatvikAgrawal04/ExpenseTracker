import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5049/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getExpenses = () => api.get("/Expenses");
export const addExpense = (expense) => api.post("/Expenses", expense);
export const deleteExpense = (id) => api.delete(`/Expenses/${id}`);
export const getUsers = () => api.get("/Users");
export const splitExpense = (data) => {
  console.log(":::::::SENDING MAIL::::::");
  api.post("/expenses/split", data);
};
