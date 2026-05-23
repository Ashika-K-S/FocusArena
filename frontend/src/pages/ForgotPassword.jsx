import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  KeyRound,
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  RefreshCcw,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
function ForgotPassword() {
  const [step, setStep] = useState(1); 
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
    if (password.length < 6)
      return setError("Password must be at least 6 characters");
    try {
      setLoading(true);
      setError("");
      await api.post("auth/reset-password/", { email, password });
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
  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };
  return (
    <div className="flex-center" style={{ minHeight: "90vh" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card"
        style={{ width: "100%", maxWidth: "420px" }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              background: "var(--primary)",
              width: "48px",
              height: "48px",
              borderRadius: "1rem",
              margin: "0 auto 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <KeyRound color="white" size={24} />
          </div>
          <h2
            style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
            className="text-gradient"
          >
            Security Protocol
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            {step === 1 && "Recover access to your arena account"}
            {step === 2 && "A 6-digit code was sent to your email"}
            {step === 3 && "Establish a new secure password"}
          </p>
        </div>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="btn btn-danger"
            style={{
              width: "100%",
              marginBottom: "1.5rem",
              justifyContent: "flex-start",
              cursor: "default",
              gap: "0.5rem",
            }}
          >
            <AlertCircle size={18} />
            <span style={{ fontSize: "0.875rem" }}>{error}</span>
          </motion.div>
        )}
        {message && !error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="btn"
            style={{
              width: "100%",
              marginBottom: "1.5rem",
              justifyContent: "flex-start",
              cursor: "default",
              gap: "0.5rem",
              background: "rgba(16, 185, 129, 0.1)",
              color: "var(--success)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
            }}
          >
            <CheckCircle2 size={18} />
            <span style={{ fontSize: "0.875rem" }}>{message}</span>
          </motion.div>
        )}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleSendOTP}
            >
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail
                    style={{
                      position: "absolute",
                      left: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                    }}
                    size={18}
                  />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    style={{ paddingLeft: "2.75rem" }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", padding: "0.875rem" }}
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send Verification Code"}{" "}
                <ArrowRight size={18} />
              </button>
            </motion.form>
          )}
          {step === 2 && (
            <motion.form
              key="step2"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleVerifyOTP}
            >
              <div className="form-group">
                <label className="form-label">Verification Code</label>
                <div style={{ position: "relative" }}>
                  <ShieldCheck
                    style={{
                      position: "absolute",
                      left: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                    }}
                    size={18}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter 6-digit code"
                    style={{
                      paddingLeft: "2.75rem",
                      letterSpacing: "0.25em",
                      fontWeight: "700",
                      textAlign: "center",
                    }}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "0.875rem",
                  marginBottom: "1rem",
                }}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Code"}{" "}
                <ArrowRight size={18} />
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: "100%", opacity: cooldown > 0 ? 0.5 : 1 }}
                onClick={() => handleSendOTP()}
                disabled={cooldown > 0 || loading}
              >
                <RefreshCcw size={16} className={loading ? "spin" : ""} />
                {cooldown > 0
                  ? `Resend available in ${cooldown}s`
                  : "Resend Verification Code"}
              </button>
            </motion.form>
          )}
          {step === 3 && (
            <motion.form
              key="step3"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleResetPassword}
            >
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: "relative" }}>
                  <Lock
                    style={{
                      position: "absolute",
                      left: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                    }}
                    size={18}
                  />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    style={{ paddingLeft: "2.75rem" }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", padding: "0.875rem" }}
                disabled={loading}
              >
                {loading ? "Resetting..." : "Update Password"}{" "}
                <CheckCircle2 size={18} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        <div
          style={{
            marginTop: "2rem",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "var(--text-muted)",
          }}
        >
          Remembered your password?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--primary)",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Return to Login
          </Link>
        </div>
      </motion.div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
export default ForgotPassword;
