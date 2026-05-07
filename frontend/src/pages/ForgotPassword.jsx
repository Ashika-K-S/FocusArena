import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    if (!email) return setError("Email is required");
    
    try {
      setLoading(true);
      setError("");
      const res = await api.post("auth/send-otp/", { email });
      setMessage(res.data.message || "OTP sent to your email");
      setStep(2);
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return setError("OTP is required");
    
    try {
      setLoading(true);
      setError("");
      const res = await api.post("auth/verify-otp/", { email, code: otp });
      setMessage(res.data.message || "OTP verified successfully");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password) return setError("New password is required");
    if (password.length < 6) return setError("Password must be at least 6 characters");

    try {
      setLoading(true);
      setError("");
      const res = await api.post("auth/reset-password/", { email, password });
      setMessage("Password reset successful! Redirecting...");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>Reset Password</h2>
        <p>
          {step === 1 && "Enter your email to receive an OTP"}
          {step === 2 && "Enter the 6-digit code sent to your email"}
          {step === 3 && "Create a new secure password"}
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div style={{ 
        background: "#f0fdf4", 
        border: "1px solid #bbf7d0", 
        color: "#166534", 
        padding: "0.75rem", 
        borderRadius: "0.5rem", 
        fontSize: "0.875rem", 
        marginBottom: "1.25rem" 
      }}>{message}</div>}

      {step === 1 && (
        <form onSubmit={handleSendOTP}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              className="auth-input"
              type="email"
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOTP}>
          <div className="form-group">
            <label>OTP Code</label>
            <input 
              className="auth-input"
              placeholder="123456" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
          
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button 
              type="button"
              className="auth-button"
              style={{ background: "transparent", color: "var(--primary)", border: "1px solid var(--primary)", marginTop: 0 }}
              onClick={() => handleSendOTP()}
              disabled={cooldown > 0 || loading}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword}>
          <div className="form-group">
            <label>New Password</label>
            <input 
              className="auth-input"
              type="password"
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      <div className="auth-footer">
        Remember your password? <Link to="/login">Sign In</Link>
      </div>
    </div>
  );
}

export default ForgotPassword;