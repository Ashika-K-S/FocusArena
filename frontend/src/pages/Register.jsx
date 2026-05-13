import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User,
  ArrowRight, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      setError("");
      await api.post("auth/register/", form);
      setSuccess(true);
    } catch (err) {
      setError(Object.values(err.response?.data || {}).flat().join(", ") || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    try {
      setError("");
      const token = credentialResponse?.credential;
      if (!token) return;
      await googleLogin(token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Google login failed");
    }
  }, [googleLogin, navigate]);

  if (success) {
    return (
      <div className="flex-center" style={{ minHeight: '90vh' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card" 
          style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}
        >
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--success)'
          }}>
            <CheckCircle2 size={32} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }} className="text-gradient">Welcome Aboard!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Your account has been created successfully. You're ready to enter the FocusArena.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%', textDecoration: 'none' }}>
            Go to Login <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-center" style={{ minHeight: '90vh' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '450px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            background: 'var(--primary)', 
            width: '48px', 
            height: '48px', 
            borderRadius: '1rem', 
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UserPlus color="white" size={24} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }} className="text-gradient">Create Account</h2>
          <p style={{ color: 'var(--text-muted)' }}>Join the elite league of focused coders</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="btn btn-danger" 
            style={{ width: '100%', marginBottom: '1.5rem', justifyContent: 'flex-start', cursor: 'default', gap: '0.5rem' }}
          >
            <AlertCircle size={18} /> 
            <span style={{ fontSize: '0.875rem' }}>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input
                type="text"
                className="form-input"
                placeholder="arena_champion"
                style={{ paddingLeft: '2.75rem' }}
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input
                type="email"
                className="form-input"
                placeholder="champion@focusarena.com"
                style={{ paddingLeft: '2.75rem' }}
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                style={{ paddingLeft: '2.75rem' }}
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.875rem' }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>OR JOIN WITH</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login failed")}
            useOneTap={false}
            theme="filled_black"
            shape="pill"
          />
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;
