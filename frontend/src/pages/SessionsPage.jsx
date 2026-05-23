import { useEffect, useState } from "react";
import {
  Shield,
  Monitor,
  Smartphone,
  Globe,
  Clock,
  LogOut,
  AlertTriangle,
  History,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../api/axios";
const SessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchSessions = async () => {
    try {
      const res = await api.get("auth/sessions/");
      setSessions(res.data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSessions();
  }, []);
  const handleLogoutAll = async () => {
    if (!window.confirm("Are you sure you want to log out from all devices?"))
      return;
    try {
      await api.post("auth/logout-all/");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
    }
  };
  const handleLogoutCurrent = async () => {
    try {
      await api.post("auth/logout/");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
    }
  };
  const getDeviceIcon = (device) => {
    if (!device) return <Monitor size={20} />;
    const d = device.toLowerCase();
    if (d.includes("iphone") || d.includes("android") || d.includes("mobile"))
      return <Smartphone size={20} />;
    return <Monitor size={20} />;
  };
  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "60vh" }}>
        <div className="loader">Analyzing active sessions...</div>
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ marginBottom: "2.5rem" }}>
        <h1
          className="text-gradient"
          style={{
            fontSize: "2.5rem",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Shield className="text-primary" size={32} /> Security Center
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Manage your active sessions and protect your arena account.
        </p>
      </div>
      <div className="glass-card" style={{ padding: "0" }}>
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <History size={20} className="text-primary" /> Active Connections
          </h2>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: "600",
              background: "rgba(99, 102, 241, 0.1)",
              color: "var(--primary)",
              padding: "0.25rem 0.75rem",
              borderRadius: "1rem",
            }}
          >
            {sessions.length} Devices
          </span>
        </div>
        <div style={{ padding: "1rem" }}>
          {sessions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ color: "var(--text-muted)" }}>
                No active sessions found.
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {sessions.map((session, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1.25rem",
                    borderRadius: "1rem",
                    background: session.current
                      ? "rgba(99, 102, 241, 0.05)"
                      : "rgba(255, 255, 255, 0.02)",
                    border: session.current
                      ? "1px solid rgba(99, 102, 241, 0.2)"
                      : "1px solid var(--border-color)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        background: session.current
                          ? "var(--primary)"
                          : "var(--bg-surface)",
                        padding: "0.75rem",
                        borderRadius: "0.75rem",
                        color: "white",
                      }}
                    >
                      {getDeviceIcon(session.device)}
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <p style={{ fontWeight: "600" }}>
                          {session.device || "Unknown Device"}
                        </p>
                        {session.current && (
                          <span
                            style={{
                              fontSize: "0.625rem",
                              background: "var(--success)",
                              color: "white",
                              padding: "0.1rem 0.4rem",
                              borderRadius: "0.25rem",
                              fontWeight: "700",
                            }}
                          >
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          <Globe size={12} /> {session.ip}
                        </p>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          <Clock size={12} />{" "}
                          {new Date(session.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    {session.current ? (
                      <button
                        onClick={handleLogoutCurrent}
                        className="btn btn-danger"
                        style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                      >
                        <LogOut size={14} /> Log Out
                      </button>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          color: "var(--success)",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                        }}
                      >
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "currentColor",
                          }}
                        />
                        Active
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          style={{
            padding: "1.5rem",
            borderTop: "1px solid var(--border-color)",
            background: "rgba(239, 68, 68, 0.02)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "flex-start",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ color: "var(--error)", marginTop: "0.25rem" }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <p style={{ fontWeight: "600", fontSize: "0.875rem" }}>
                Danger Zone
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                If you suspect unauthorized access, log out from all devices
                immediately and update your password.
              </p>
            </div>
          </div>
          <button
            onClick={handleLogoutAll}
            className="btn btn-danger"
            style={{ width: "100%", padding: "1rem" }}
          >
            <LogOut size={18} /> Terminate All Other Sessions
          </button>
        </div>
      </div>
    </motion.div>
  );
};
export default SessionsPage;
