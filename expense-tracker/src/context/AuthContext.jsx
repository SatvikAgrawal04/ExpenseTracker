import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();

  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5049/api/Users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser({ id: data.id, name: data.name, email: data.email });
        navigate("/expenses");
      } else {
        throw new Error(data.message || "Invalid credentials");
      }
    } catch (error) {
      return { error: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch("http://localhost:5049/api/Users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser({ id: data.id, name: data.name, email: data.email });
        console.log(user);
        // navigate("/expenses");
      }
      return data;
    } catch (error) {
      return { error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:5049/api/Users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const userData = await response.json();
          console.log(userData);
          setUser(userData);
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };

    if (token) fetchUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
