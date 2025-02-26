import api from "./api";

export const loginUser = async (email, password) => {
  const response = await api.post("/Users/login", { email, password });
  return response.data;
};

export const registerUser = async (name, email, password) => {
  const response = await api.post("/Users/register", { name, email, password });
  return response.data;
};

export const getUser = async () => {
  const response = await api.get("/Users/me");
  return response.data;
};
