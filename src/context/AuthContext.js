"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
    } else {
      setLoading(false);
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role?.toLowerCase() || "attendee"
        });
      } else {
        setCurrentUser(null);
      }
    }
  }, [session, status]);

  const login = async (email, password, role) => {
    try {
      //use NextAuth signIn - this actually authenticates against your database
      // Simulate API call
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        console.error("Login error:", result.error);
        //Handle specific error messages
        if (result.error === "CredentialsSignin") {
          return { success: false, error: "Invalid email or password" };
        }
        return { success: false, error: result.error };
      }

      if (result?.ok) {
        //Successful login - the session will be updated automatically
        //and the useEffect above will update currentUser
        return { success: true };
      }

      return { success: false, error: "Login failed" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "An error occurred during login" };
    }
  };

  const register = async (email, password, role, name) => {
    try {
      //First register the user via your API endpoint
      const response = await fetch("/api/auth/register", {
        method: "POST",
        header: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role: role.toUpperCase(),
          name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Registration failed"
        };
      }

      if (data.success) {
        //Auto login after successful registration
        const loginResult = await login(email, password);
        return loginResult;
      }
      return { success: false, error: data.error || "Registration failed" };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "An error occurred during registration" };
    }
  };

  const logout = async () => {
    try {
      //Use NextAuth signOut
      await signOut({
        redirect: false,
        callbackUrl: "/"
      });
      setCurrentUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!currentUser,
    isOrganizer: currentUser?.role === "organizer",
    isAdmin: currentUser?.role === "admin"
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
