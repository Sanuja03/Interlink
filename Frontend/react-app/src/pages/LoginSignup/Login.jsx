import "./Login.css";

import interlink from "../../assets/interlink.png";
import signin from "../../assets/signin.png";
import homeicon from "../../assets/homeicon.png";

import api from "../../lib/api";
import { useAuth } from "../../context/Authcontext";
import { supabase } from "../../lib/supabase";

import { useForm } from "react-hook-form";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";


const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState("");
  const { login, isAuthenticated, role, loading, suspendedMessage, setSuspendedMessage } = useAuth();//useEffect runs only if these changes 
  
  //form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });

   //calls login funtion in Authcontext)
  const onSubmit = async (data) => {
    try {
      setLoginError("");
      setSuspendedMessage(""); 
      await login(data.email.trim(), data.password);
      
    
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setLoginError(err?.message || "Invalid email or password");
    }
  };

  // after page renders loading of auth finishes,authenticted,role is set choose where to send the user (prev page,role's dashboard,home)
  useEffect(() => {
    if (loading) return;
    if (isAuthenticated && role) {
      const dashboardMap = {
        candidate: "/candidate/dashboard",
        company_admin: "/company/dashboard",
        interviewer: "/interviewer/dashboard",
        super_admin: "/admin/dashboard",
      };
      const from = location.state?.from?.pathname || dashboardMap[role] || "/";//choose where to send a user [If there is no previous page and no matching role, go to home page.]
      navigate(from, { replace: true });//navigate to the relevant dashboard or previous page or home page after login, replace history so user can't go back to login with back button
    }
  }, [isAuthenticated, role, loading, navigate, location]);//array which says run this useEffect if any of tehse changes 

  // handle Google OAuth callback
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const provider = session.user?.app_metadata?.provider;
          if (provider === "google") {
            try {
              await api.get("/auth/me", {
                headers: { Authorization: `Bearer ${session.access_token}` },//Send Supabase JWT token to backend
              });
            } catch (err) {
              if (err?.response?.status === 403) {
                await supabase.auth.signOut();
                setLoginError("Your account has been suspended. Please contact support.");
              } else if (err?.response?.status === 500 || err?.response?.status === 404) {
                await supabase.auth.signOut();
                setLoginError("No account found for this Google email. Please sign up first.");
              }
            }
          }
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

 

  return (
    <div className="page">
      <div className="home-button">
        <a href="/">
          <img src={homeicon} alt="Home" />
        </a>
      </div>

      <div className="container">
        <div className="header">
          <div className="text">
            <img src={interlink} alt="InterLink Logo" className="interlinklogo" />
            <h1>Welcome Back!</h1>
            <p><i>Connecting Talent with Opportunity</i></p>
          </div>
        </div>

          <form className="form" onSubmit={handleSubmit(onSubmit)}>

          {/* show these paras if suspendedMessage or LoginError has values */}
            {suspendedMessage && (<p className="error-text" style={{ color: "#d32f2f"}}>{suspendedMessage}</p>)}
            {loginError && <p className="error-text">{loginError}</p>}

            {/* take email input,validate,showerrors */}
            <div className="input-group">
              {errors.email && <p className="error-text">{errors.email.message}</p>}
              <label>email address</label>
              <input
                type="email"
                placeholder="Enter your email"
                className={`input-field ${errors.email ? "input-error" : ""}`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
              />
            </div>

            <div className="input-group">
              {errors.password && <p className="error-text">{errors.password.message}</p>}
              <label>password</label>
              <input
                type="password"
                placeholder="Password"
                className={`input-field ${errors.password ? "input-error" : ""}`}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
            </div>

            <div className="forgot-password">
              <p><Link to="/forgot-password">Forgot Password</Link></p>
            </div>

            <div>
              <button className="login-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </div>

            <div className="or-container">
              <span>OR</span>
            </div>

            <div className="google-signin">
              <img
                src={signin}
                alt="Sign in with Google"
                style={{ cursor: "pointer" }}
                onClick={async () => {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: window.location.origin + "/login",
                    },
                  });
                  if (error) setLoginError(error.message);
                }}
              />
            </div>

            <div>
              <p>
                Don't have an account? <Link to="/?section=howitworks">Signup</Link>
              </p>
            </div>
         </form>
         
      </div>
    </div>
  );
};

export default Login;