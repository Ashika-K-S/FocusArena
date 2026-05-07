import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

function Dashboard() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("auth/profile/")
      .then(res => setProfile(res.data))
      .catch(err => {
        console.error("Profile fetch error:", err);
        setError("Failed to load profile");
      });
  }, []);

  return (
    <div style={{ width: "100%", maxWidth: "800px", margin: "2rem" }}>
      <div className="auth-card" style={{ maxWidth: "none" }}>
        
        <div
          className="auth-header"
          style={{
            textAlign: "left",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <h2>Dashboard</h2>
            <p>Welcome back to your workspace</p>
          </div>

          {/* 🔥 RIGHT SIDE ACTIONS */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            
            {/* ✅ Manage Sessions Button */}
            <Link
              to="/sessions"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                background: "#eef2ff",
                color: "#4338ca",
                border: "1px solid #c7d2fe",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: "500"
              }}
            >
              Sessions
            </Link>

            {/* 🔴 Logout Button */}
            <button
              onClick={logout}
              className="auth-button"
              style={{
                width: "auto",
                marginTop: 0,
                padding: "0.5rem 1.25rem",
                background: "#fee2e2",
                color: "#b91c1c",
                border: "1px solid #fecaca"
              }}
            >
              Logout
            </button>

          </div>
        </div>

        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            background: "#f9fafb",
            borderRadius: "0.75rem",
            border: "1px solid var(--card-border)"
          }}
        >
          {error && <div className="error-message">{error}</div>}

          {profile ? (
            <div>
              <p style={{ fontSize: "1rem", color: "var(--text-main)", fontWeight: "500" }}>
                Logged in as <span style={{ color: "var(--primary)", marginRight: "0.5rem" }}>{profile.user}</span>
                {profile.role === 'ADMIN' && (
                  <span style={{ 
                    padding: "0.2rem 0.5rem", 
                    background: "#fef08a", 
                    color: "#854d0e", 
                    borderRadius: "0.25rem",
                    fontSize: "0.75rem",
                    fontWeight: "600"
                  }}>ADMIN</span>
                )}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)" }}></div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Online</p>
              </div>

              {/* 🔥 ADMIN ONLY SECTION */}
              {profile.role === 'ADMIN' && (
                <div style={{ 
                  marginTop: "2rem", 
                  padding: "1rem", 
                  background: "#fff", 
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem"
                }}>
                  <h3 style={{ fontSize: "1rem", color: "#111827", marginBottom: "1rem" }}>Admin Controls</h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                    You have administrative access. You can manage system settings here.
                  </p>
                  <button className="auth-button" style={{ margin: 0, width: "auto", padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                    Manage Users
                  </button>
                </div>
              )}
            </div>
          ) : !error && (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Loading your profile...
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;