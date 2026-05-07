import { useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const data = await login(form);
      navigate(data.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials");
    }
  };

  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    try {
      setError("");
      const token = credentialResponse?.credential;
      if (!token) {
        setError("No token received from Google");
        return;
      }
      const data = await googleLogin(token);
      navigate(data.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Google login failed");
    }
  }, [googleLogin, navigate]);

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>Welcome Back</h2>
        <p>Please enter your details to sign in</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Username</label>
          <input
            className="auth-input"
            placeholder="Enter your username"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            className="auth-input"
            placeholder="••••••••"
            type="password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
            <Link to="/forgot-password" style={{ fontSize: "0.75rem", color: "var(--text-muted)", textDecoration: "none" }}>
              Forgot password?
            </Link>
          </div>
        </div>

        <button type="submit" className="auth-button">Sign In</button>
      </form>

      <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google login failed")}
          useOneTap={false}
        />
      </div>

      <div className="auth-footer">
        Don't have an account? <Link to="/register">Create one</Link>
      </div>
    </div>
  );
}

export default Login;