import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Settings2,
  Timer,
  BarChart,
  Sword,
  ChevronLeft,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../api/axios";
function CreateRoom() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    difficulty: "MEDIUM",
    time_limit: 30,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/rooms/create/", formData);
      navigate(`/room/${response.data.room_code}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to initialize the arena");
    } finally {
      setLoading(false);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: "600px", margin: "0 auto" }}
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
              background:
                "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
              width: "64px",
              height: "64px",
              borderRadius: "1.25rem",
              margin: "0 auto 1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 16px rgba(99, 102, 241, 0.3)",
            }}
          >
            <Sword color="white" size={32} />
          </div>
          <h1
            className="text-gradient"
            style={{ fontSize: "2.25rem", marginBottom: "0.5rem" }}
          >
            Arena Configuration
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Define the parameters for your battle
          </p>
        </div>
        {error && (
          <div
            className="btn btn-danger"
            style={{ width: "100%", marginBottom: "1.5rem", cursor: "default" }}
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label
              className="form-label"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <BarChart size={16} /> Difficulty Level
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.75rem",
              }}
            >
              {["EASY", "MEDIUM", "HARD"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, difficulty: level })
                  }
                  style={{
                    padding: "0.75rem",
                    borderRadius: "0.75rem",
                    border: "1px solid",
                    borderColor:
                      formData.difficulty === level
                        ? "var(--primary)"
                        : "var(--border-color)",
                    background:
                      formData.difficulty === level
                        ? "rgba(99, 102, 241, 0.1)"
                        : "rgba(255, 255, 255, 0.02)",
                    color:
                      formData.difficulty === level
                        ? "var(--primary)"
                        : "var(--text-muted)",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label
              className="form-label"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Timer size={16} /> Time Limit (minutes)
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                name="time_limit"
                className="form-input"
                min="5"
                max="180"
                value={formData.time_limit}
                onChange={handleChange}
                style={{
                  textAlign: "center",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                }}
                required
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "0.5rem",
                color: "var(--text-muted)",
                fontSize: "0.75rem",
              }}
            >
              <span>Min: 5m</span>
              <span>Max: 180m</span>
            </div>
          </div>
          <div
            style={{
              background: "rgba(99, 102, 241, 0.05)",
              padding: "1rem",
              borderRadius: "0.75rem",
              border: "1px solid rgba(99, 102, 241, 0.1)",
              marginBottom: "2rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "flex-start",
            }}
          >
            <Info
              size={18}
              className="text-primary"
              style={{ flexShrink: 0, marginTop: "2px" }}
            />
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
                lineHeight: "1.4",
              }}
            >
              Once created, you will receive a unique room code to share with
              participants. The arena will initialize immediately.
            </p>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "1rem", fontSize: "1rem" }}
            disabled={loading}
          >
            {loading ? "Initializing..." : "Initialize Arena"}{" "}
            <PlusCircle size={20} />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
export default CreateRoom;
