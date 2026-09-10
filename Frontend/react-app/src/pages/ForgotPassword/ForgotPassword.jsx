import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../../lib/api";
import AuthLayout from "../LoginSignup/AuthLayout";

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
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one capital letter");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setError("Password must contain at least one symbol");
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

  // subtitle shown under the heading for each step
  const subtitles = {
    1: "Enter your email and we'll send you a reset code.",
    2: `Enter the 6-digit code sent to ${email}`,
    3: "Choose a new password for your account.",
  };

  return (
    <AuthLayout
      title={step === 3 ? "Set New Password" : "Forgot Password"}
      subtitle={subtitles[step]}
    >
        {error && <p className="error-text">{error}</p>}
        {/* if there is a value fro teh message show the para or nothing  */}
        {message && <p className="success-text">{message}</p>}

        {/* display Enter email page */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
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
              <div className="password-field">
                <input type={showNewPassword ? "text" : "password"} className="input-field" placeholder="Enter new password"
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <button type="button" className="password-toggle"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}>
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <div className="password-field">
                <input type={showConfirmPassword ? "text" : "password"} className="input-field" placeholder="Confirm new password"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <button type="button" className="password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        <p className="auth-backlink"><Link to="/Login">Back to Login</Link></p>
    </AuthLayout>
  );
};

export default ForgotPassword;