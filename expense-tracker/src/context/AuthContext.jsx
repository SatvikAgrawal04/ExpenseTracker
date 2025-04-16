import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnA-Ig0xDHpT7sNqrinCiDa7_3LYE0-oA",
  authDomain: "expense-tracker-babb9.firebaseapp.com",
  projectId: "expense-tracker-babb9",
  storageBucket: "expense-tracker-babb9.firebasestorage.app",
  messagingSenderId: "667784880985",
  appId: "1:667784880985:web:57038c74f2e006f45ba248",
  measurementId: "G-K42DCXMT3X",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

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
        return { success: true };
      } else {
        throw new Error(data.message || "Invalid credentials");
      }
    } catch (error) {
      return { error: error.message };
    }
  };

  const sso = async (firebaseUserData) => {
    console.log("Processing SSO login for:", firebaseUserData.email);
    try {
      // Make API call with user data from Firebase
      const response = await fetch("http://localhost:5049/api/Users/sso", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: firebaseUserData.displayName,
          email: firebaseUserData.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "SSO authentication failed");
      }

      const data = await response.json();
      console.log("SSO response data:", data);

      // Store the token from your backend
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser({ id: data.id, name: data.name, email: data.email });
      navigate("/expenses");
      return { success: true };
    } catch (error) {
      console.error("SSO login error:", error);
      return { error: error.message || "SSO login failed" };
    }
  };

  // Firebase Google Sign In
  const loginWithGoogle = async (options = {}) => {
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      // The signed-in user info
      const user = result.user;
      console.log("Firebase Google Auth successful", user);

      // Process SSO with your backend
      const ssoResult = await sso(user);

      // Handle redirection if specified
      if (ssoResult.success && options.redirectPath) {
        navigate(options.redirectPath);
      }

      return ssoResult;
    } catch (error) {
      console.error("Firebase Google Auth error:", error);
      return {
        error: error.message || "Google authentication failed",
        code: error.code,
      };
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
        navigate("/expenses");
        return { success: true };
      }
      return data;
    } catch (error) {
      return { error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Sign out from Firebase
      await firebaseAuth.signOut();
      console.log("Firebase user signed out successfully");

      // Clear local auth state
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);

      console.log("Logging out from the application");

      // Navigate to login page
      navigate("/login");
    } catch (error) {
      console.error("Firebase sign out error:", error);
    }
  };

  // Check user session with token
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;

      try {
        const response = await fetch("http://localhost:5049/api/Users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };

    fetchUser();

    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (firebaseUser && !user) {
        // User is signed in with Firebase but not in our system
        console.log("Firebase user detected, processing SSO");
        sso(firebaseUser);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        sso,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
