import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import api from "../lib/api";

const AuthContext = createContext(null);
const LOGIN_FLAG = "interlink_logged_in";

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// delete all supabase keys in brwoser storage during logout
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

    const fetchAppUser = useCallback(async () => {
      try {
        const response = await api.get("/auth/me");
        setSuspendedMessage(""); 
        setAppUser(response.data);
        return response.data;
      } catch (err) {
        console.error("[AuthContext] fetchAppUser failed:", err);
        setAppUser(null);

        // Handle suspended account — force full logout
        if (err?.response?.status === 403) {
          const message = err?.response?.data?.message
            || "Your account has been suspended. Please contact support.";
          setSuspendedMessage(message);

          loggedInRef.current = false;
          sessionStorage.removeItem(LOGIN_FLAG);
          setUser(null);
          clearSupabaseLocalStorage();
          try { await supabase.auth.signOut(); } catch (_) {}
        }

        return null;
      }
    }, []);

    //bootstrap + listener (runs once)
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

      // The auth state listener — runs whenever Supabase's session changes

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (!mounted) return;

          console.log("[AuthContext] onAuthStateChange:", event, "flag:", loggedInRef.current);

          //if user logouts clears frontend and backend user,remove loginflag,markuser as not logged in 
          if (event === "SIGNED_OUT") {
            setUser(null);
            setAppUser(null);
            sessionStorage.removeItem(LOGIN_FLAG);
            loggedInRef.current = false;
            return;
          }

  
          if (!loggedInRef.current) {
              console.log("[AuthContext] provider check:", session?.user?.app_metadata?.provider, "identities:", session?.user?.app_metadata?.providers);
              //Check if it's Google login return
              const isOAuthReturn = event === "SIGNED_IN" && session?.user?.app_metadata?.providers?.includes("google");

              //If NOT Google login - ignore
              if (!isOAuthReturn) {
                console.log("[AuthContext] ignoring event (not logged in):", event);
                return;
              }

            // If it IS Google login - accept it
            console.log("[AuthContext] Google OAuth sign-in detected, setting login flag");
            loggedInRef.current = true;
            sessionStorage.setItem(LOGIN_FLAG, "true");
          }
          
          // Ignore logging in  during signup process to get teh jwt token 
          if (event === "SIGNED_IN") {
            if (sessionStorage.getItem("is_signing_up") === "true") {
              console.log("[AuthContext] ignoring SIGNED_IN during signup flow");
              return;
            }
          }
          //Set user when valid auth event happens
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

    // call backends Fetch /auth/me when user changes 
    useEffect(() => {
      if (user && loggedInRef.current) {
        fetchAppUser().finally(() => setLoading(false));
      } else {
        setAppUser(null);
        setLoading(false);
      }
    }, [user, fetchAppUser]);



  //  login 
    const login = async (email, password) => {

    // Set the ref and sessionStorage before calling Supabase
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


  //  logout 
  const logout = async () => {
    console.log("[AuthContext] logout called");

    // Hit backend first while we still have a valid token
    try {
        await api.post("/auth/logout");
    } catch (err) {
        console.error("[AuthContext] backend logout failed (non-fatal):", err);
    }

    // Then proceed with existing cleanup
    loggedInRef.current = false;
    sessionStorage.removeItem(LOGIN_FLAG);
    setUser(null);
    setAppUser(null);
    clearSupabaseLocalStorage();

    try {
        await supabase.auth.signOut({ scope: "global" });
    } catch (err) {
        console.error("[AuthContext] signOut error (non-fatal):", err);
    }

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
        suspendedMessage,        // expose it
        setSuspendedMessage,     // so Login.jsx can clear it
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}