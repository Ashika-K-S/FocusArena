import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Users,
  Shield,
  Trophy,
  Activity,
  ArrowLeft,
  Award,
  HelpCircle,
  Calendar,
  PlusCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/axios";
const AdminRoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeLeft, setTimeLeft] = useState("");
  const fetchRoomDetail = async () => {
    try {
      const res = await api.get(`admin/rooms/${id}/`);
      setRoomData(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const fetchSubmissions = async () => {
    try {
      const res = await api.get(`admin/rooms/${id}/submissions/`);
      setSubmissions(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const handleKickParticipant = async (participantId) => {
    const confirmKick = window.confirm(
      "Are you sure you want to kick this participant?",
    );
    if (!confirmKick) return;
    try {
      await api.delete(
        `/admin/rooms/${id}/participants/${participantId}/kick/`,
      );
      fetchRoomDetail();
    } catch (err) {
      console.log(err);
    }
  };
  const fetchLeaderboard = async (roomCode) => {
    try {
      const res = await api.get(`/rooms/${roomCode}/leaderboard/`);
      setLeaderboard(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const startTimer = () => {
    if (!roomData?.room?.started_at) return;
    const interval = setInterval(() => {
      const startTime = new Date(roomData.room.started_at).getTime();
      const endTime = startTime + roomData.room.time_limit_minutes * 60 * 1000;
      const now = new Date().getTime();
      const distance = endTime - now;
      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft("Finished");
        return;
      }
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}m ${String(seconds).padStart(2, "0")}s`);
    }, 1000);
    return () => clearInterval(interval);
  };
  useEffect(() => {
    fetchRoomDetail();
    fetchSubmissions();
  }, [id]);
  useEffect(() => {
    if (!roomData) return;
    if (roomData.room.status === "WAITING") {
      setTimeLeft("Not Started");
      return;
    }
    if (roomData.room.status === "FINISHED") {
      setTimeLeft("Finished");
      return;
    }
    const cleanup = startTimer();
    return () => {
      if (cleanup) cleanup();
    };
  }, [
    roomData?.room?.started_at,
    roomData?.room?.status,
    roomData?.room?.time_limit_minutes,
  ]);
  useEffect(() => {
    if (roomData?.room?.room_code) {
      fetchLeaderboard(roomData.room.room_code);
    }
  }, [roomData?.room?.room_code]);
  useEffect(() => {
    if (!roomData?.room?.room_code) return;
    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/rooms/${roomData.room.room_code}`
    );
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "submission_update") {
        setSubmissions((prev) => [data.submission, ...prev]);
      } else if (data.type === "leaderboard_update") {
        fetchLeaderboard(roomData.room.room_code);
      }
    };
    return () => socket.close();
  }, [roomData?.room?.room_code]);
  if (!roomData) {
    return (
      <div className="flex-center" style={{ minHeight: "60vh" }}>
        <div className="loader">Analyzing room configurations...</div>
      </div>
    );
  }
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return { bg: "rgba(34, 197, 94, 0.12)", text: "var(--success)" };
      case "FINISHED":
        return { bg: "rgba(239, 68, 68, 0.12)", text: "var(--accent)" };
      default:
        return { bg: "rgba(245, 158, 11, 0.12)", text: "var(--warning)" };
    }
  };
  const statusColors = getStatusColor(roomData.room.status);
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: "1.5rem" }}>
        <button
          onClick={() => navigate("/admin/rooms")}
          className="btn btn-secondary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            fontSize: "0.85rem",
          }}
        >
          <ArrowLeft size={16} /> Back to Arenas
        </button>
      </motion.div>
      <motion.div
        variants={itemVariants}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "3rem",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
          <h1
            className="text-gradient"
            style={{ fontSize: "3rem", marginBottom: "0.5rem" }}
          >
            Arena Room Detail
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
            Review, manage, and moderate coding contest{" "}
            <strong>Room #{roomData.room.room_code}</strong>.
          </p>
        </div>
        <div
          style={{
            background: "rgba(15, 23, 42, 0.45)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: "1rem 1.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            backdropFilter: "blur(12px)",
          }}
        >
          <Clock size={20} className="text-primary" />
          <div>
            <span
              style={{
                display: "block",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              Time Remaining
            </span>
            <span
              style={{
                fontSize: "1.25rem",
                fontWeight: "800",
                fontFamily: "monospace",
                color:
                  timeLeft === "Finished" ? "var(--accent)" : "var(--success)",
              }}
            >
              {timeLeft}
            </span>
          </div>
        </div>
      </motion.div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "2rem",
          alignItems: "start",
          marginBottom: "3rem",
        }}
      >
        <motion.div
          variants={itemVariants}
          className="glass-card"
          style={{
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.35rem",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              paddingBottom: "0.75rem",
            }}
          >
            <Shield size={20} className="text-primary" /> Room Information
          </h2>
          <DetailRow label="Host Owner" value={roomData.room.created_by} />
          <div>
            <span
              style={{
                display: "block",
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                textTransform: "uppercase",
                marginBottom: "0.25rem",
              }}
            >
              Current Status
            </span>
            <span
              style={{
                background: statusColors.bg,
                color: statusColors.text,
                padding: "0.25rem 0.75rem",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: "800",
                display: "inline-block",
              }}
            >
              {roomData.room.status}
            </span>
          </div>
          <DetailRow
            label="Difficulty Preset"
            value={roomData.room.difficulty}
          />
          <DetailRow
            label="Max Capacity"
            value={`${roomData.room.max_participants} Players`}
          />
          <DetailRow
            label="Time Allowed"
            value={`${roomData.room.time_limit_minutes} Minutes`}
          />
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="glass-card"
          style={{ padding: "2rem" }}
        >
          <h2
            style={{
              fontSize: "1.35rem",
              fontWeight: "700",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Trophy size={20} className="text-primary" /> Contest Leaderboard
          </h2>
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
                  <th style={thStyle}>Rank</th>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Points</th>
                  <th style={thStyle}>Solved Challenges</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length > 0 ? (
                  leaderboard.map((row, index) => {
                    const isTop1 = index === 0;
                    const isTop2 = index === 1;
                    const isTop3 = index === 2;
                    const rankLabel = isTop1
                      ? "🥇 1"
                      : isTop2
                        ? "🥈 2"
                        : isTop3
                          ? "🥉 3"
                          : `${index + 1}`;
                    const rankColor = isTop1
                      ? "#FFD700"
                      : isTop2
                        ? "#C0C0C0"
                        : isTop3
                          ? "#CD7F32"
                          : "var(--text-muted)";
                    return (
                      <tr
                        key={index}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <td
                          style={{
                            ...tdStyle,
                            fontWeight: "800",
                            color: rankColor,
                          }}
                        >
                          {rankLabel}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: "600" }}>
                          {row.username}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            color: "var(--primary)",
                            fontWeight: "700",
                          }}
                        >
                          {row.total_points}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: "600" }}>
                          {row.solved_count} Solved
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        padding: "3rem",
                        textAlign: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      No participant rankings reported yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
      <motion.div
        variants={itemVariants}
        className="glass-card"
        style={{ padding: "2rem", marginBottom: "3rem" }}
      >
        <h2
          style={{
            fontSize: "1.35rem",
            fontWeight: "700",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Users size={20} className="text-primary" /> Active Room Participants
        </h2>
        {roomData.participants.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {roomData.participants.map((participant, index) => (
              <div
                key={index}
                style={{
                  padding: "1.5rem",
                  background: "rgba(15, 23, 42, 0.4)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "1.25rem",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span style={{ fontWeight: "700", fontSize: "1.05rem" }}>
                      {participant.username}
                    </span>
                    {participant.is_winner && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          background: "rgba(250, 204, 21, 0.12)",
                          color: "#facc15",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "6px",
                          fontWeight: "700",
                        }}
                      >
                        🏆 Winner
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    Score:{" "}
                    <strong className="text-primary">
                      {participant.score || 0} Points
                    </strong>
                  </span>
                  <div
                    style={{
                      marginTop: "0.7rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      Tab Warnings:
                    </span>
                    <span
                      style={{
                        background:
                          participant.tab_switch_count > 0
                            ? "rgba(239,68,68,0.12)"
                            : "rgba(34,197,94,0.12)",
                        color:
                          participant.tab_switch_count > 0
                            ? "#ef4444"
                            : "#22c55e",
                        padding: "0.25rem 0.6rem",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                      }}
                    >
                      {participant.tab_switch_count || 0}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleKickParticipant(participant.id)}
                  className="btn btn-secondary"
                  style={{
                    width: "100%",
                    padding: "0.5rem 1rem",
                    fontSize: "0.8rem",
                    borderColor: "rgba(239, 68, 68, 0.2)",
                    color: "var(--accent)",
                  }}
                >
                  Kick Participant
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            No players have entered the lobby room.
          </p>
        )}
      </motion.div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        <motion.div
          variants={itemVariants}
          className="glass-card"
          style={{ padding: "2rem" }}
        >
          <h2
            style={{
              fontSize: "1.35rem",
              fontWeight: "700",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Award size={20} className="text-primary" /> Contest Challenges
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {roomData.contest_challenges.map((challenge, index) => (
              <div
                key={index}
                style={{
                  padding: "1rem 1.25rem",
                  background: "rgba(15, 23, 42, 0.4)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "block",
                      fontWeight: "600",
                      fontSize: "0.95rem",
                    }}
                  >
                    {challenge.title}
                  </span>
                  <span
                    style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                  >
                    Difficulty: {challenge.difficulty}
                  </span>
                </div>
                <span
                  style={{
                    color: "var(--primary)",
                    fontWeight: "700",
                    fontSize: "0.95rem",
                  }}
                >
                  {challenge.points} pts
                </span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="glass-card"
          style={{ padding: "2rem" }}
        >
          <h2
            style={{
              fontSize: "1.35rem",
              fontWeight: "700",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Activity size={20} className="text-primary" /> Live Submissions
            Stream
          </h2>
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
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Problem</th>
                  <th style={thStyle}>Verdict</th>
                  <th style={thStyle}>Language</th>
                  <th style={thStyle}>Time</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length > 0 ? (
                  submissions.map((submission, index) => {
                    const isCorrect = submission.status === "CORRECT";
                    return (
                      <tr
                        key={index}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <td style={{ ...tdStyle, fontWeight: "600" }}>
                          {submission.username}
                        </td>
                        <td style={tdStyle}>{submission.challenge}</td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              background: isCorrect
                                ? "rgba(34,197,94,0.12)"
                                : "rgba(239,68,68,0.12)",
                              color: isCorrect
                                ? "var(--success)"
                                : "var(--accent)",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "6px",
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
                            textTransform: "uppercase",
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                            fontWeight: "700",
                          }}
                        >
                          {submission.language}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.3rem",
                            }}
                          >
                            <Calendar size={12} />{" "}
                            {new Date(
                              submission.submitted_at,
                            ).toLocaleTimeString()}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        padding: "3rem",
                        textAlign: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      No live submissions received in this room.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
const DetailRow = ({ label, value }) => (
  <div
    style={{
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      paddingBottom: "0.5rem",
    }}
  >
    <span
      style={{
        display: "block",
        color: "var(--text-muted)",
        fontSize: "0.8rem",
        textTransform: "uppercase",
        marginBottom: "0.15rem",
      }}
    >
      {label}
    </span>
    <span style={{ fontWeight: "700", fontSize: "1.05rem" }}>{value}</span>
  </div>
);
const thStyle = {
  padding: "1rem 1.25rem",
  fontSize: "0.85rem",
  fontWeight: "600",
  color: "var(--text-muted)",
};
const tdStyle = {
  padding: "1rem 1.25rem",
  fontSize: "0.9rem",
};
export default AdminRoomDetail;
