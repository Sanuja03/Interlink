import "./Login.css";

import interlink from "../../assets/interlink.png";
import signin from "../../assets/signin.png";
import homeicon from "../../assets/homeicon.png";

import LandingPage from "../LandingPage/LandingPage";



import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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

  const onSubmit = (data) => {

    const email = data.email.trim();
    const password = data.password;


    if (email === "sanjalee@gmail.com" && password === "12345678") {
      setLoginError(""); //if correct credentials clear the error 
      navigate("/Dashboard");
      return;
    }

    // else  wrong credentials set a error msg
    setLoginError("Invalid email or password");
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
            <p>
              <i>Connecting Talent with Opportunity</i>
            </p>
          </div>
        </div>

        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          {/*Show login error if credentials are wrong*/}
          {loginError && <p className="error-text">{loginError}</p>}

          {/* email */}
          <div className="input-group">
            {errors.email && <p className="error-text">{errors.email.message}</p>} {/* if errors.email exists show the error msg */}
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

          {/* Password */}
          <div className="input-group">
            {errors.password && (<p className="error-text">{errors.password.message}</p>)}
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

          {/* Forgot password */}
          <div className="forgot-password">
            <p>
              <a href="">Forgot Password</a>
            </p>
          </div>

          {/* Login button */}
          <div>
            <button className="login-button" type="submit" disabled={isSubmitting}> {/*button cannot be clicked when submitting */}
              Login
            </button>
          </div>


          <div className="or-container">
            <span>OR</span>
          </div>

          {/* Google Sign in */}
          <div className="google-signin">
            <img src={signin} alt="Sign in with Google" />
          </div>

          <div>
            <p>
              Dont have an account? <a href="">Sign up</a>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Login;
