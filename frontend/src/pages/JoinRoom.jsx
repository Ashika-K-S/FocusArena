import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { LogIn, Key, ChevronLeft, ArrowRight, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
function JoinRoom() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!roomCode.trim()) {
      setError("Please enter a valid arena code");
      return;
    }
    if (roomCode.length < 4) {
      setError("Arena code is too short");
      return;
    }
    try {
      await api.post("/rooms/join/", {
        room_code: roomCode.toUpperCase(),
      });
      navigate(`/room/${roomCode.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to join arena");
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: "500px", margin: "0 auto" }}
    >
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary"
        style={{
          marginBottom: "1.5rem",
          padding: "0.5rem 1rem",
          border: "none",
        }}
      >
        <ChevronLeft size={18} /> Back to Dashboard
      </button>
      <div className="glass-card">
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)",
              width: "64px",
              height: "64px",
              borderRadius: "1.25rem",
              margin: "0 auto 1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 16px rgba(244, 63, 94, 0.3)",
            }}
          >
            <LogIn color="white" size={32} />
          </div>
          <h1
            className="text-gradient"
            style={{ fontSize: "2.25rem", marginBottom: "0.5rem" }}
          >
            Join Battle
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Enter the secret code to join an active arena
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
            <ShieldAlert size={18} />
            <span style={{ fontSize: "0.875rem" }}>{error}</span>
          </motion.div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Arena Code</label>
            <div style={{ position: "relative" }}>
              <Key
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
                placeholder="e.g. ARENA-123"
                style={{
                  paddingLeft: "2.75rem",
                  textTransform: "uppercase",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  letterSpacing: "0.1em",
                  textAlign: "center",
                }}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                required
              />
            </div>
          </div>
          <div
            style={{
              marginTop: "2rem",
              padding: "1rem",
              borderRadius: "0.75rem",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-color)",
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              textAlign: "center",
            }}
          >
            Battles are real-time. Make sure you're ready before joining.
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "1rem",
              fontSize: "1rem",
              marginTop: "2rem",
              background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
              boxShadow: "0 4px 14px 0 rgba(244, 63, 94, 0.39)",
            }}
          >
            Join Arena <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
export default JoinRoom;
