import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogIn,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";
function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await login(formData);
      if (response.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSuccess = useCallback(
    async (credentialResponse) => {
      try {
        setError("");
        const token = credentialResponse?.credential;
        if (!token) {
          setError("No token received from Google");
          return;
        }
        await googleLogin(token);
        navigate("/dashboard");
      } catch (err) {
        setError(err.response?.data?.error || "Google login failed");
      }
    },
    [googleLogin, navigate],
  );
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
            <LogIn color="white" size={24} />
          </div>
          <h2
            style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
            className="text-gradient"
          >
            Welcome Back
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            Enter your credentials to enter the arena
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
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
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
                type="text"
                className="form-input"
                placeholder="arena_champion"
                style={{ paddingLeft: "2.75rem" }}
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="form-group">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <label className="form-label" style={{ marginBottom: 0 }}>
                Password
              </label>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--primary)",
                  textDecoration: "none",
                }}
              >
                Forgot Password?
              </Link>
            </div>
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
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.875rem" }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In"} <ArrowRight size={18} />
          </button>
        </form>
        <div
          style={{
            margin: "2rem 0",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "var(--border-color)",
            }}
          ></div>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              fontWeight: "600",
            }}
          >
            OR CONTINUE WITH
          </span>
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "var(--border-color)",
            }}
          ></div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login failed")}
            useOneTap={false}
            theme="filled_black"
            shape="pill"
          />
        </div>
        <div
          style={{
            marginTop: "2rem",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "var(--text-muted)",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "var(--primary)",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Join the Arena
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
export default Login;
