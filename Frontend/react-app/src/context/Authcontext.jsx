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

// ── Helper: nuke every Supabase token from localStorage ──
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

  // A ref that is immediately set to false on logout.
  // Unlike sessionStorage (which the listener reads async), a ref
  // is updated synchronously in the same JS tick as the logout call,
  // so there is zero window for a stale event to slip through.
  const loggedInRef = useRef(sessionStorage.getItem(LOGIN_FLAG) === "true");

  const fetchAppUser = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");
      setAppUser(response.data);
      return response.data;
    } catch (err) {
      console.error("[AuthContext] fetchAppUser failed:", err);
      setAppUser(null);
      return null;
    }
  }, []);

  // ── Bootstrap + listener (runs once) ──
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log("[AuthContext] initAuth — flag:", loggedInRef.current);

        if (!loggedInRef.current) {
          // Not supposed to be logged in — don't even look at Supabase
          if (mounted) {
            setUser(null);
            setAppUser(null);
          }
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          console.log("[AuthContext] restoring session for", session.user.email);
          setUser(session.user);
        } else {
          console.log("[AuthContext] no valid session — clearing flag");
          setUser(null);
          setAppUser(null);
          sessionStorage.removeItem(LOGIN_FLAG);
          loggedInRef.current = false;
        }
      } catch (err) {
        console.error("[AuthContext] initAuth error:", err);
        if (mounted) { setUser(null); setAppUser(null); }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log("[AuthContext] onAuthStateChange:", event, "flag:", loggedInRef.current);

        if (event === "SIGNED_OUT") {
          setUser(null);
          setAppUser(null);
          sessionStorage.removeItem(LOGIN_FLAG);
          loggedInRef.current = false;
          return;
        }

        // ▸ THE CRITICAL GUARD ◂
        // If the ref says "not logged in", reject every event.
        // This is synchronous — no race window.
        if (!loggedInRef.current) {
          console.log("[AuthContext] ignoring event (not logged in):", event);
          return;
        }
        

        if (event === "SIGNED_IN") {
            if (sessionStorage.getItem("is_signing_up") === "true") {
              console.log("[AuthContext] ignoring SIGNED_IN during signup flow");
              return;
            }
          }
          
          if (
            (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") &&
            session?.user
          ) {
            setUser(session.user);
          }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── Fetch /auth/me when user changes ──
  useEffect(() => {
    if (user && loggedInRef.current) {
      fetchAppUser().finally(() => setLoading(false));
    } else {
      setAppUser(null);
      setLoading(false);
    }
  }, [user, fetchAppUser]);

  // ─────────────────────────────────────────────────────
  //  login
  // ─────────────────────────────────────────────────────
  const login = async (email, password) => {
    // Set BOTH the ref and sessionStorage before calling Supabase
    loggedInRef.current = true;
    sessionStorage.setItem(LOGIN_FLAG, "true");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      loggedInRef.current = false;
      sessionStorage.removeItem(LOGIN_FLAG);
      throw error;
    }

    return true;
  };

  // ─────────────────────────────────────────────────────
  //  logout  (the order here is critical)
  // ─────────────────────────────────────────────────────
  const logout = async () => {
    console.log("[AuthContext] logout called");

    // 1. Flip the ref synchronously — this immediately blocks the
    //    onAuthStateChange listener from accepting any more events
    loggedInRef.current = false;

    // 2. Remove the sessionStorage flag
    sessionStorage.removeItem(LOGIN_FLAG);

    // 3. Clear React state
    setUser(null);
    setAppUser(null);

    // 4. Nuke Supabase tokens from localStorage BEFORE calling signOut.
    //    This way, even if signOut fires a TOKEN_REFRESHED before
    //    SIGNED_OUT, there's nothing in storage to refresh from.
    clearSupabaseLocalStorage();

    // 5. Now tell Supabase to sign out (server-side revocation)
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch (err) {
      console.error("[AuthContext] signOut error (non-fatal):", err);
    }

    // 6. One more cleanup in case signOut wrote something back
    clearSupabaseLocalStorage();

    console.log("[AuthContext] logout complete");
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}