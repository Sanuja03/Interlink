
import axios from "axios";
import { supabase } from "./supabase";

const LOGIN_FLAG = "interlink_logged_in";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// attach fresh Supabase JWT 
api.interceptors.request.use(
  async (config) => {
    // Skip auto(token is attached manually)
    if (sessionStorage.getItem("is_signing_up") === "true") {
      return config;
    }

    // Don't touch Supabase at all if user isn't logged in
    if (sessionStorage.getItem(LOGIN_FLAG) !== "true") {
      return config;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (_) {
      // Send request without token
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// handle 401 by refreshing token 
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip retry/logout logic for signup endpoints and during signup flow
    const isSignupCall = originalRequest.url?.includes("/complete-candidate-signup") ||
                         originalRequest.url?.includes("/complete-company-signup");
    const isSigningUp = sessionStorage.getItem("is_signing_up") === "true";

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      sessionStorage.getItem(LOGIN_FLAG) === "true" &&
      !isSignupCall &&
      !isSigningUp
    ) {
      originalRequest._retry = true;

      try {
        const { data: { session }, error: refreshError } =
          await supabase.auth.refreshSession();

        if (refreshError || !session) {
          sessionStorage.removeItem(LOGIN_FLAG);
          window.location.href = "/Login";
          return Promise.reject(error);
        }

        originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
        return api(originalRequest);
      } catch (refreshErr) {
        sessionStorage.removeItem(LOGIN_FLAG);
        window.location.href = "/Login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;