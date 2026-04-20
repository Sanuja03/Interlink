import "./Login.css";

import interlink from "../../assets/interlink.png";
import signin from "../../assets/signin.png";
import homeicon from "../../assets/homeicon.png";

import { supabase } from "../../lib/supabase";
import api from "../../lib/api";

import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

const Login = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
  });

  const onSubmit = async (data) => {
    try {
      const email = data.email.trim();
      const password = data.password;

      setLoginError("");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setLoginError("Invalid email or password");
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
        setLoginError("Invalid email or password");
        return;
      }

      const authUserId = authData.user.id;

      const response = await api.get("/auth/me");
      const appUser = response.data;

      console.log("AUTH USER ID:", authUserId);
      console.log("APP USER:", appUser);
      console.log("APP USER ROLE:", appUser?.role);

      if (!appUser) {
        setLoginError("Invalid email or password");
        return;
      }

      if (appUser.role === "company_admin") {
        navigate("/company/shortlisted-candidates");
        return;
      }

      if (appUser.role === "interviewer") {
        navigate("/interviewer/dashboard");
        return;
      }

      if (appUser.role === "candidate") {
        navigate("/candidate/dashboard");
        return;
      }

      if (appUser.role === "super_admin") {
        navigate("/admin/dashboard");
        return;
      }

      setLoginError("Invalid email or password");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setLoginError(
        err?.response?.data?.message ||
        err?.response?.data ||
        err.message ||
        "Login failed"
      );
    }
  }

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
            <p>
              <i>Connecting Talent with Opportunity</i>
            </p>
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
            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}
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
            <p>
              <a href="">Forgot Password</a>
            </p>
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
              Dont have an account? <Link to="/signup-company">Sign up</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;