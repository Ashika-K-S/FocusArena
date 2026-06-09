import React, { useEffect, useState } from "react";
import {
  Users,
  Code,
  Activity,
  Terminal,
  Shield,
  Filter,
  Search,
  Calendar,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    errors: 0,
    activeRooms: 0,
  });
  const [searchUser, setSearchUser] = useState("");
  const [verdictFilter, setVerdictFilter] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  useEffect(() => {
    fetchSubmissions();
    const ws = new WebSocket("ws://localhost:8000/ws/admin/submissions/");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSubmissions((prev) => {
        const exists = prev.find((s) => s.id === data.id);
        if (exists) {
          return prev.map((s) => (s.id === data.id ? data : s));
        }
        return [data, ...prev];
      });
    };
    return () => ws.close();
  }, []);
  useEffect(() => {
    applyFilters();
  }, [submissions, searchUser, verdictFilter]);
  const fetchSubmissions = async () => {
    try {
      const res = await api.get("admin/submissions/");
      const data = res.data.results || res.data;
      setSubmissions(data);
      calculateStats(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const calculateStats = (data) => {
    const accepted = data.filter((s) => s.status === "CORRECT").length;
    const errors = data.filter((s) => s.status !== "CORRECT").length;
    const activeRooms = new Set(
      data.filter((s) => s.room_code !== "N/A").map((s) => s.room_code),
    ).size;
    setStats({ total: data.length, accepted, errors, activeRooms });
  };
  const applyFilters = () => {
    let filtered = [...submissions];
    if (searchUser) {
      filtered = filtered.filter((submission) =>
        submission.username.toLowerCase().includes(searchUser.toLowerCase()),
      );
    }
    if (verdictFilter) {
      filtered = filtered.filter(
        (submission) => submission.status === verdictFilter,
      );
    }
    setFilteredSubmissions(filtered);
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "CORRECT":
        return { bg: "rgba(34, 197, 94, 0.15)", text: "var(--success)" };
      case "WRONG_ANSWER":
        return { bg: "rgba(239, 68, 68, 0.15)", text: "var(--accent)" };
      case "TIME_LIMIT_EXCEEDED":
        return { bg: "rgba(245, 158, 11, 0.15)", text: "var(--warning)" };
      case "RUNTIME_ERROR":
        return { bg: "rgba(168, 85, 247, 0.15)", text: "#a855f7" };
      default:
        return { bg: "rgba(59, 130, 246, 0.15)", text: "#3b82f6" };
    }
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: "3rem" }}>
        <h1
          className="text-gradient"
          style={{ fontSize: "3rem", marginBottom: "0.5rem" }}
        >
          Global Submissions
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Real-time monitoring panel observing code executions and compilers
          across all active arenas.
        </p>
      </motion.div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        <motion.div
          variants={itemVariants}
          className="glass-card"
          style={{ display: "flex", alignItems: "center", gap: "1rem" }}
        >
          <div
            style={{
              background: "rgba(99, 102, 241, 0.2)",
              padding: "1rem",
              borderRadius: "1rem",
              color: "var(--primary)",
            }}
          >
            <Activity size={28} />
          </div>
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Total Submissions
            </p>
            <h3 style={{ fontSize: "1.8rem" }}>{stats.total}</h3>
          </div>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="glass-card"
          style={{ display: "flex", alignItems: "center", gap: "1rem" }}
        >
          <div
            style={{
              background: "rgba(34, 197, 94, 0.2)",
              padding: "1rem",
              borderRadius: "1rem",
              color: "var(--success)",
            }}
          >
            <Award size={28} />
          </div>
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Accepted Solutions
            </p>
            <h3 style={{ fontSize: "1.8rem" }}>{stats.accepted}</h3>
          </div>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="glass-card"
          style={{ display: "flex", alignItems: "center", gap: "1rem" }}
        >
          <div
            style={{
              background: "rgba(239, 68, 68, 0.2)",
              padding: "1rem",
              borderRadius: "1rem",
              color: "var(--accent)",
            }}
          >
            <Terminal size={28} />
          </div>
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Compiler Errors
            </p>
            <h3 style={{ fontSize: "1.8rem" }}>{stats.errors}</h3>
          </div>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="glass-card"
          style={{ display: "flex", alignItems: "center", gap: "1rem" }}
        >
          <div
            style={{
              background: "rgba(245, 158, 11, 0.2)",
              padding: "1rem",
              borderRadius: "1rem",
              color: "var(--warning)",
            }}
          >
            <Shield size={28} />
          </div>
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Active Rooms
            </p>
            <h3 style={{ fontSize: "1.8rem" }}>{stats.activeRooms}</h3>
          </div>
        </motion.div>
      </div>
      <motion.div
        variants={itemVariants}
        style={{
          display: "flex",
          gap: "1.25rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", minWidth: "280px", flex: "1" }}>
          <Search
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
            placeholder="Search coder username..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "3rem", width: "100%" }}
          />
        </div>
        <div style={{ position: "relative", minWidth: "200px" }}>
          <Filter
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
            size={18}
          />
          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "3rem", width: "100%" }}
          >
            <option value="">All Verdicts</option>
            <option value="CORRECT">ACCEPTED</option>
            <option value="WRONG_ANSWER">WRONG ANSWER</option>
            <option value="TIME_LIMIT_EXCEEDED">TIME LIMIT EXCEEDED</option>
            <option value="RUNTIME_ERROR">RUNTIME ERROR</option>
          </select>
        </div>
      </motion.div>
      <motion.div
        variants={itemVariants}
        className="glass-card"
        style={{ padding: "0", overflow: "hidden" }}
      >
        {loading ? (
          <div
            style={{
              padding: "6rem",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            <div className="loader">Analyzing live submissions stream...</div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div
            style={{
              padding: "5rem 2rem",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            No compiler submissions match your active filter scope.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <th style={thStyle}>Coder</th>
                  <th style={thStyle}>Challenge</th>
                  <th style={thStyle}>Arena Room</th>
                  <th style={thStyle}>Language</th>
                  <th style={thStyle}>Verdict</th>
                  <th style={thStyle}>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission) => {
                  const verdictStyle = getStatusColor(submission.status);
                  return (
                    <tr
                      key={submission.id}
                      onClick={() => setSelectedSubmission(submission)}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        transition: "background 0.2s",
                        cursor: "pointer",
                      }}
                      className="table-row-hover"
                    >
                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                          }}
                        >
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              background: "var(--primary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                            }}
                          >
                            {submission.username
                              ? submission.username.charAt(0).toUpperCase()
                              : "?"}
                          </div>
                          <span style={{ fontWeight: "600" }}>
                            {submission.username}
                          </span>
                        </div>
                      </td>
                      <td
                              className="text-primary"
                              style={{ ...tdStyle, fontWeight: "600" }}
                            >
                        {submission.challenge}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            fontFamily: "monospace",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "6px",
                            background: "rgba(255,255,255,0.05)",
                            fontSize: "0.85rem",
                          }}
                        >
                          {submission.room_code}
                        </span>
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          textTransform: "uppercase",
                          fontSize: "0.85rem",
                          fontWeight: "700",
                          color: "var(--text-muted)",
                        }}
                      >
                        {submission.language}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            background: verdictStyle.bg,
                            color: verdictStyle.text,
                            padding: "0.25rem 0.75rem",
                            borderRadius: "999px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                          }}
                        >
                          {submission.status}
                        </span>
                      </td>
                          <td
                    style={{
                      ...tdStyle,
                      color: "var(--text-muted)",
                      fontSize: "0.875rem",
                    }}
                  >
                                <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <Calendar size={14} />{" "}
                          {new Date(submission.submitted_at).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSubmission(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              backdropFilter: "blur(4px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card"
              style={{
                width: "640px",
                padding: "2.5rem",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-50px",
                  right: "-50px",
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  background: "rgba(99,102,241,0.08)",
                  filter: "blur(30px)",
                }}
              ></div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Code size={24} className="text-primary" /> Submission
                  Diagnosis
                </h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    fontSize: "2rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  &times;
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <DetailRow
                  label="Coder Participant"
                  value={selectedSubmission.username}
                />
                <DetailRow
                  label="Algorithmic Challenge"
                  value={selectedSubmission.challenge}
                />
                <DetailRow
                  label="Language Environment"
                  value={selectedSubmission.language.toUpperCase()}
                />
                <DetailRow
                  label="Active Arena"
                  value={`Room #${selectedSubmission.room_code}`}
                />
                <div>
                  <span
                    style={{
                      display: "block",
                      color: "var(--text-muted)",
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Diagnostics Verdict
                  </span>
                  <span
                    style={{
                      background: getStatusColor(selectedSubmission.status).bg,
                      color: getStatusColor(selectedSubmission.status).text,
                      padding: "0.4rem 1rem",
                      borderRadius: "999px",
                      fontSize: "0.85rem",
                      fontWeight: "800",
                      display: "inline-block",
                    }}
                  >
                    {selectedSubmission.status}
                  </span>
                </div>
                <DetailRow
                  label="Submission Timestamp"
                  value={new Date(
                    selectedSubmission.submitted_at,
                  ).toLocaleString()}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
const DetailRow = ({ label, value }) => (
  <div
    style={{
      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
      paddingBottom: "0.75rem",
    }}
  >
    <span
      style={{
        display: "block",
        color: "var(--text-muted)",
        fontSize: "0.85rem",
        textTransform: "uppercase",
        marginBottom: "0.25rem",
      }}
    >
      {label}
    </span>
    <span style={{ fontSize: "1.1rem", fontWeight: "600" }}>{value}</span>
  </div>
);
const thStyle = {
  padding: "1.25rem 1.5rem",
  fontSize: "0.875rem",
  fontWeight: "600",
  color: "var(--text-muted)",
};
const tdStyle = {
  padding: "1.25rem 1.5rem",
  fontSize: "0.95rem",
};
export default SubmissionsPage;
