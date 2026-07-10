import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1=email, 2=OTP, 3=new password
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // sent reset OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();// in from submissions to prevent teh page from reloading since all states will be lost if it did 
    setLoading(true); //button becomes disabled when on submit 
    setError(""); 
    setMessage("");
    try {
      await api.post("/otp/send-reset-otp", { email: email.trim() });
      setMessage("If this email is registered, you'll receive a code.");
      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send code");//shows the backend msg or default
    }
    setLoading(false);
  };

  // verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError(""); 
    setMessage("");
    try {
      await api.post("/otp/verify-reset-otp", { email: email.trim(), otp: otp.trim() });
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid or expired code");
    }
    setLoading(false);
  };

  // set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await api.post("/otp/reset-password", {
        email: email.trim(),
        newPassword,
      });
      setMessage("Password updated! Redirecting to login...");
      setTimeout(() => navigate("/Login"), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update password");
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="container">
        <h1>{step === 3 ? "Set New Password" : "Forgot Password"}</h1>

        {error && <p className="error-text">{error}</p>}
        {/* if there is a value fro teh message show the para or nothing  */}
        {message && <p style={{ color: "green" }}>{message}</p>}

        {/* display Enter email page */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <p>Enter your email and we'll send you a reset code.</p>
            <div className="input-group">
              <label>Email address</label>
              <input type="email" className="input-field" placeholder="Enter your email"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {/* display Enter OTP screen */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <p>Enter the 6-digit code sent to {email}</p>
            <div className="input-group">
              <label>Reset Code</label>
              <input type="text" className="input-field" placeholder="Enter 6-digit code"
                maxLength={6} value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required />
            </div>
            <button className="login-button" type="submit" disabled={loading || otp.length !== 6}>
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </form>
        )}

        {/* display set New password screen  */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>

            <div className="input-group">
              <label>New Password</label>
              <input type="password" className="input-field" placeholder="Enter new password"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input type="password" className="input-field" placeholder="Confirm new password"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>

            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        <p><Link to="/Login">Back to Login</Link></p>
      </div>
    </div>
  );
};

export default ForgotPassword;