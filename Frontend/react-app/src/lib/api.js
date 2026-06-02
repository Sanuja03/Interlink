import axios from "axios";
import { supabase } from "./supabase";

const LOGIN_FLAG = "interlink_logged_in";

//creates a customized version of axios called api
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Wait for Supabase to finish restoring the session from localStorage
async function waitForSession(maxAttempts = 20, delayMs = 50) {
  for (let i = 0; i < maxAttempts; i++) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return session;
    if (i === maxAttempts - 1) return null;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return null;
}

// request interceptor - attach fresh Supabase JWT to the request sent to backend
api.interceptors.request.use(
  async (config) => {
    
    if (sessionStorage.getItem("is_signing_up") === "true") {
      return config;
    }
    // dont ask subapase for a token if logged out 
    if (sessionStorage.getItem(LOGIN_FLAG) !== "true") {
      return config;
    }
    try {
      const session = await waitForSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }      
    } catch (_) {
      
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// rresponse interceptor - the response will be checked by axios and if 401(unauthorized) the belwo tries to attach a new token and send the reqest agaian
api.interceptors.response.use(
  (response) => response, 
  async (error) => { const originalRequest = error.config;
 
    const isSignupCall = originalRequest.url?.includes("/complete-candidate-signup") || originalRequest.url?.includes("/complete-company-signup");
    const isSigningUp = sessionStorage.getItem("is_signing_up") === "true";

    if (
      error.response?.status === 401 &&
      !originalRequest._retry && //prevent infinte loop 
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