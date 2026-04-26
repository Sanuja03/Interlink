// ============================================================
// FILE: src/context/AuthContext.jsx
// PURPOSE: Global auth state, token refresh, role access
// ============================================================

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import api from "../lib/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const LOGIN_FLAG = "interlink_logged_in";

// ── Helper: clear Supabase local storage ──
function clearSupabaseLocalStorage() {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sb-")) {
        localStorage.removeItem(key);
      }
    });
  } catch (_) {}
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [appUser, setAppUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suspendedMessage, setSuspendedMessage] = useState("");

  const loggedInRef = useRef(sessionStorage.getItem(LOGIN_FLAG) === "true");

  // ─────────────────────────────────────────
  // FETCH BACKEND USER
  // ─────────────────────────────────────────
  const fetchAppUser = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");
      setSuspendedMessage("");
      setAppUser(response.data);
      return response.data;
    } catch (err) {
      console.error("[AuthContext] fetchAppUser failed:", err);
      setAppUser(null);

      if (err?.response?.status === 403) {
        const message =
          err?.response?.data?.message ||
          "Your account has been suspended. Please contact support.";

        setSuspendedMessage(message);

        loggedInRef.current = false;
        sessionStorage.removeItem(LOGIN_FLAG);
        setUser(null);
        clearSupabaseLocalStorage();

        try {
          await supabase.auth.signOut();
        } catch (_) {}
      }

      return null;
    }
  }, []);

  // ─────────────────────────────────────────
  // INIT AUTH (🔥 FIXED HERE)
  // ─────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log("[AuthContext] initAuth");

        // 🔥 FIX: ALWAYS check Supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          console.log("[AuthContext] restoring session for", session.user.email);

          setUser(session.user);

          // 🔥 sync login flag
          loggedInRef.current = true;
          sessionStorage.setItem(LOGIN_FLAG, "true");
        } else {
          console.log("[AuthContext] no valid session");

          setUser(null);
          setAppUser(null);

          loggedInRef.current = false;
          sessionStorage.removeItem(LOGIN_FLAG);
        }
      } catch (err) {
        console.error("[AuthContext] initAuth error:", err);
        if (mounted) {
          setUser(null);
          setAppUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // ─────────────────────────────────────────
    // AUTH LISTENER
    // ─────────────────────────────────────────
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      console.log("[AuthContext] onAuthStateChange:", event);

      if (event === "SIGNED_OUT") {
        setUser(null);
        setAppUser(null);
        sessionStorage.removeItem(LOGIN_FLAG);
        loggedInRef.current = false;
        return;
      }

      if (
        (event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "INITIAL_SESSION") &&
        session?.user
      ) {
        setUser(session.user);

        loggedInRef.current = true;
        sessionStorage.setItem(LOGIN_FLAG, "true");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ─────────────────────────────────────────
  // FETCH /auth/me WHEN USER CHANGES
  // ─────────────────────────────────────────
  useEffect(() => {
    if (user) {
      fetchAppUser().finally(() => setLoading(false));
    } else {
      setAppUser(null);
      setLoading(false);
    }
  }, [user, fetchAppUser]);

  // ─────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────
  const login = async (email, password) => {
    loggedInRef.current = true;
    sessionStorage.setItem(LOGIN_FLAG, "true");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      loggedInRef.current = false;
      sessionStorage.removeItem(LOGIN_FLAG);
      throw error;
    }

    return true;
  };

  // ─────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────
  const logout = async () => {
    console.log("[AuthContext] logout called");

    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("[AuthContext] backend logout failed:", err);
    }

    loggedInRef.current = false;
    sessionStorage.removeItem(LOGIN_FLAG);
    setUser(null);
    setAppUser(null);
    clearSupabaseLocalStorage();

    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch (err) {
      console.error("[AuthContext] signOut error:", err);
    }

    clearSupabaseLocalStorage();
  };

  const hasRole = (role) => appUser?.role === role;
  const hasAnyRole = (...roles) => roles.includes(appUser?.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        appUser,
        loading,
        login,
        logout,
        hasRole,
        hasAnyRole,
        isAuthenticated: !!user && !!appUser,
        role: appUser?.role || null,
        suspendedMessage,
        setSuspendedMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}