// ============================================================
// FILE: src/pages/LoginSignup/Login.jsx
// PURPOSE: Uses AuthContext for login + proper redirect logic
// ============================================================
import "./Login.css";

import interlink from "../../assets/interlink.png";
import signin from "../../assets/signin.png";
import homeicon from "../../assets/homeicon.png";

import { useAuth } from "../../context/Authcontext";
import { useForm } from "react-hook-form";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, role, loading } = useAuth();
  const [loginError, setLoginError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });

  // Redirect when genuinely authenticated
  useEffect(() => {
    if (loading) return;

    if (isAuthenticated && role) {
      const dashboardMap = {
        candidate: "/candidate/dashboard",
        company_admin: "/company/dashboard",
        interviewer: "/interviewer/dashboard",
        super_admin: "/admin/dashboard",
      };
      const from = location.state?.from?.pathname || dashboardMap[role] || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, role, loading, navigate, location]);

  const onSubmit = async (data) => {
    try {
      setLoginError("");
      await login(data.email.trim(), data.password);
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setLoginError(err?.message || "Invalid email or password");
    }
  };

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
          {loginError && <p className="error-text">{loginError}</p>}

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
            <img src={signin} alt="Sign in with Google" />
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