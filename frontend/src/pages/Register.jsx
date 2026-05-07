import { useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "../api/axios";

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await api.post("auth/register/", form);
      setSuccess(true);
    } catch (err) {
      setError(Object.values(err.response?.data || {}).flat().join(", ") || "Registration failed");
    }
  };

  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    try {
      setError("");
      const token = credentialResponse?.credential;
      if (!token) return;
      const data = await googleLogin(token);
      navigate(data.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Google login failed");
    }
  }, [googleLogin, navigate]);

  if (success) {
    return (
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="auth-header">
          <h2 style={{ color: "var(--success)" }}>Success!</h2>
          <p>Your account has been created successfully.</p>
        </div>
        <Link to="/login" className="auth-button" style={{ display: "block", textDecoration: "none" }}>
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>Create Account</h2>
        <p>Join FocusArena today</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input className="auth-input" placeholder="Choose a username" onChange={e => setForm({...form, username: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input className="auth-input" placeholder="name@example.com" type="email" onChange={e => setForm({...form, email: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input className="auth-input" placeholder="••••••••" type="password" onChange={e => setForm({...form, password: e.target.value})} required />
        </div>
        <button type="submit" className="auth-button">Create Account</button>
      </form>

      <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google login failed")}
          useOneTap={false}
        />
      </div>

      <div className="auth-footer">
        Already have an account? <Link to="/login">Sign In</Link>
      </div>
    </div>
  );
}

export default Register;
