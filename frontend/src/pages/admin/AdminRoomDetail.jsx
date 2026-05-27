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
  Calendar,
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

  // =========================
  // FETCH ROOM DETAIL
  // =========================

  const fetchRoomDetail = async () => {

    try {

      const res = await api.get(
        `admin/rooms/${id}/`
      );

      setRoomData(res.data);

    } catch (err) {

      console.log(err);
    }
  };

  // =========================
  // FETCH SUBMISSIONS
  // =========================

  const fetchSubmissions = async () => {

    try {

      const res = await api.get(
        `admin/rooms/${id}/submissions/`
      );

      setSubmissions(res.data);

    } catch (err) {

      console.log(err);
    }
  };

  // =========================
  // FETCH LEADERBOARD
  // =========================

  const fetchLeaderboard = async (
    roomCode
  ) => {

    try {

      const res = await api.get(
        `/rooms/${roomCode}/leaderboard/`
      );

      setLeaderboard(res.data);

    } catch (err) {

      console.log(err);
    }
  };

  // =========================
  // KICK PARTICIPANT
  // =========================

  const handleKickParticipant = async (
    participantId
  ) => {

    const confirmKick = window.confirm(
      "Are you sure you want to kick this participant?"
    );

    if (!confirmKick) return;

    try {

      await api.delete(
        `/admin/rooms/${id}/participants/${participantId}/kick/`
      );

      fetchRoomDetail();

    } catch (err) {

      console.log(err);
    }
  };

  // =========================
  // TIMER
  // =========================

  const startTimer = () => {

    if (!roomData?.room?.started_at)
      return;

    const interval = setInterval(() => {

      const startTime = new Date(
        roomData.room.started_at
      ).getTime();

      const endTime =
        startTime +
        roomData.room.time_limit_minutes *
          60 *
          1000;

      const now = new Date().getTime();

      const distance = endTime - now;

      if (distance <= 0) {

        clearInterval(interval);

        setTimeLeft("Finished");

        return;
      }

      const minutes = Math.floor(
        (distance % (1000 * 60 * 60)) /
          (1000 * 60)
      );

      const seconds = Math.floor(
        (distance % (1000 * 60)) / 1000
      );

      setTimeLeft(
        `${minutes}m ${String(
          seconds
        ).padStart(2, "0")}s`
      );

    }, 1000);

    return () => clearInterval(interval);
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {

    fetchRoomDetail();

    fetchSubmissions();

    // AUTO REFRESH
    const interval = setInterval(() => {

      fetchRoomDetail();

    }, 2000);

    return () => clearInterval(interval);

  }, [id]);

  // =========================
  // TIMER EFFECT
  // =========================

  useEffect(() => {

    if (!roomData) return;

    if (
      roomData.room.status === "WAITING"
    ) {

      setTimeLeft("Not Started");

      return;
    }

    if (
      roomData.room.status === "FINISHED"
    ) {

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

  // =========================
  // LEADERBOARD
  // =========================

  useEffect(() => {

    if (roomData?.room?.room_code) {

      fetchLeaderboard(
        roomData.room.room_code
      );
    }

  }, [roomData?.room?.room_code]);

  // =========================
  // WEBSOCKET
  // =========================

  useEffect(() => {

    if (!roomData?.room?.room_code)
      return;

    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/leaderboard/${roomData.room.room_code}/`
    );

    socket.onmessage = (event) => {

      const data = JSON.parse(
        event.data
      );

      if (
        data.type === "submission_update"
      ) {

        setSubmissions((prev) => [
          data.submission,
          ...prev,
        ]);
      }

      else if (
        data.type === "leaderboard_update"
      ) {

        fetchLeaderboard(
          roomData.room.room_code
        );

        fetchRoomDetail();
      }
    };

    return () => socket.close();

  }, [roomData?.room?.room_code]);

  // =========================
  // LOADING
  // =========================

  if (!roomData) {

    return (
      <div
        className="flex-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="loader">
          Loading Arena...
        </div>
      </div>
    );
  }

  // =========================
  // STATUS COLOR
  // =========================

  const getStatusColor = (status) => {

    switch (status) {

      case "ACTIVE":

        return {
          bg: "rgba(34, 197, 94, 0.12)",
          text: "var(--success)",
        };

      case "FINISHED":

        return {
          bg: "rgba(239, 68, 68, 0.12)",
          text: "var(--accent)",
        };

      default:

        return {
          bg: "rgba(245, 158, 11, 0.12)",
          text: "var(--warning)",
        };
    }
  };

  const statusColors = getStatusColor(
    roomData.room.status
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "3rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >

        <div>

          <button
            onClick={() =>
              navigate("/admin/rooms")
            }
            className="btn btn-secondary"
            style={{
              marginBottom: "1rem",
            }}
          >
            <ArrowLeft size={16} />
            Back to Arenas
          </button>

          <h1
            className="text-gradient"
            style={{
              fontSize: "3rem",
              marginBottom: "0.5rem",
            }}
          >
            Arena Room Detail
          </h1>

          <p
            style={{
              color: "var(--text-muted)",
            }}
          >
            Review, manage, and moderate coding contest{" "}
            <strong>
              Room #
              {
                roomData.room.room_code
              }
            </strong>
            .
          </p>
        </div>

        <div
          style={{
            background:
              "rgba(15, 23, 42, 0.45)",

            border:
              "1px solid rgba(255,255,255,0.08)",

            borderRadius: "20px",

            padding: "1rem 1.75rem",

            display: "flex",

            alignItems: "center",

            gap: "0.75rem",
          }}
        >
          <Clock
            size={20}
            className="text-primary"
          />

          <div>

            <span
              style={{
                display: "block",
                fontSize: "0.75rem",
                color:
                  "var(--text-muted)",
              }}
            >
              TIME REMAINING
            </span>

            <span
              style={{
                fontSize: "1.3rem",
                fontWeight: "800",
                fontFamily: "monospace",
                color:
                  timeLeft ===
                  "Finished"
                    ? "var(--accent)"
                    : "var(--success)",
              }}
            >
              {timeLeft}
            </span>
          </div>
        </div>
      </div>

      {/* TOP GRID */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 2fr",
          gap: "2rem",
          marginBottom: "3rem",
        }}
      >

        {/* ROOM INFO */}

        <div
          className="glass-card"
          style={{ padding: "2rem" }}
        >

          <h2
            style={{
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Shield size={20} />
            Room Information
          </h2>

          <DetailRow
            label="Host Owner"
            value={
              roomData.room.created_by
            }
          />

          <DetailRow
            label="Difficulty"
            value={
              roomData.room.difficulty
            }
          />

          <DetailRow
            label="Time Limit"
            value={`${roomData.room.time_limit_minutes} Minutes`}
          />

          <DetailRow
            label="Max Capacity"
            value={`${roomData.room.max_participants} Players`}
          />

          <div>

            <span
              style={{
                display: "block",
                color:
                  "var(--text-muted)",
                fontSize: "0.85rem",
                marginBottom: "0.4rem",
              }}
            >
              STATUS
            </span>

            <span
              style={{
                background:
                  statusColors.bg,

                color:
                  statusColors.text,

                padding:
                  "0.3rem 0.7rem",

                borderRadius:
                  "999px",

                fontWeight: "700",

                fontSize: "0.75rem",
              }}
            >
              {
                roomData.room.status
              }
            </span>
          </div>
        </div>

        {/* LEADERBOARD */}

        <div
          className="glass-card"
          style={{ padding: "2rem" }}
        >

          <h2
            style={{
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Trophy size={20} />
            Contest Leaderboard
          </h2>

          <table
            style={{
              width: "100%",
            }}
          >

            <thead>

              <tr>

                <th style={thStyle}>
                  Rank
                </th>

                <th style={thStyle}>
                  User
                </th>

                <th style={thStyle}>
                  Points
                </th>

                <th style={thStyle}>
                  Solved
                </th>

              </tr>

            </thead>

            <tbody>

              {leaderboard.map(
                (
                  row,
                  index
                ) => (

                  <tr
                    key={index}
                  >

                    <td
                      style={
                        tdStyle
                      }
                    >
                      {index + 1}
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      {
                        row.username
                      }
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        color:
                          "var(--primary)",
                      }}
                    >
                      {
                        row.total_points
                      }
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      {
                        row.solved_count
                      }
                    </td>

                  </tr>
                )
              )}

            </tbody>
          </table>
        </div>
      </div>

      
        {/* PARTICIPANTS */}

<div
  className="glass-card"
  style={{
    padding: "2rem",
    marginBottom: "3rem",
  }}
>

  <h2
    style={{
      marginBottom: "1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    }}
  >
    <Users size={20} />
    Active Room Participants
  </h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fill,minmax(280px,1fr))",

      gap: "1.5rem",
    }}
  >

    {roomData.participants.map(
      (participant) => (

        <div
          key={
            participant.id
          }
          style={{
            padding: "1.5rem",

            background:
              participant.is_disqualified
                ? "rgba(127,29,29,0.25)"
                : "rgba(15,23,42,0.4)",

            border:
              participant.is_disqualified
                ? "1px solid rgba(239,68,68,0.45)"
                : "1px solid rgba(255,255,255,0.05)",

            borderRadius:
              "16px",

            transition:
              "all 0.3s ease",
          }}
        >

          {/* HEADER */}

          <div
            style={{
              display: "flex",

              justifyContent:
                "space-between",

              alignItems:
                "center",

              marginBottom:
                "0.8rem",

              flexWrap: "wrap",

              gap: "0.5rem",
            }}
          >

            <h3
              style={{
                margin: 0,
              }}
            >
              {
                participant.username
              }
            </h3>

            {
              participant.is_disqualified && (

                <div
                  style={{
                    background:
                      "rgba(220,38,38,0.15)",

                    color:
                      "#ef4444",

                    padding:
                      "0.35rem 0.7rem",

                    borderRadius:
                      "8px",

                    fontSize:
                      "0.75rem",

                    fontWeight:
                      "700",

                    letterSpacing:
                      "0.5px",
                  }}
                >
                  DISQUALIFIED
                </div>
              )
            }

          </div>

          {/* SCORE */}

          <p
            style={{
              color:
                participant.is_disqualified
                  ? "#ef4444"
                  : "var(--text-muted)",

              fontWeight:
                participant.is_disqualified
                  ? "700"
                  : "400",

              marginBottom:
                "1rem",
            }}
          >

            {
              participant.is_disqualified
                ? "User disqualified from contest"
                : (
                  <>
                    Score:{" "}
                    <strong
                      className="text-primary"
                    >
                      {
                        participant.score
                      }{" "}
                      Points
                    </strong>
                  </>
                )
            }

          </p>

          {/* WARNINGS */}

          <div
            style={{
              marginTop: "0.7rem",

              display: "flex",

              alignItems:
                "center",

              gap: "0.5rem",
            }}
          >

            <span
              style={{
                fontSize:
                  "0.8rem",

                color:
                  "var(--text-muted)",
              }}
            >
              Tab Warnings:
            </span>

            <span
              style={{
                background:
                  participant.tab_warnings >=
                  5
                    ? "rgba(220,38,38,0.2)"
                    : participant.tab_warnings >
                        0
                      ? "rgba(239,68,68,0.12)"
                      : "rgba(34,197,94,0.12)",

                color:
                  participant.tab_warnings >=
                  5
                    ? "#dc2626"
                    : participant.tab_warnings >
                        0
                      ? "#ef4444"
                      : "#22c55e",

                padding:
                  "0.25rem 0.6rem",

                borderRadius:
                  "999px",

                fontSize:
                  "0.75rem",

                fontWeight:
                  "700",
              }}
            >
              {
                participant.tab_warnings || 0
              }
            </span>

          </div>

          {/* KICK BUTTON */}

          <button
            onClick={() =>
              handleKickParticipant(
                participant.id
              )
            }
            className="btn btn-secondary"
            style={{
              width: "100%",

              marginTop: "1rem",

              color:
                participant.is_disqualified
                  ? "#ef4444"
                  : "var(--accent)",

              border:
                participant.is_disqualified
                  ? "1px solid rgba(239,68,68,0.35)"
                  : undefined,
            }}
          >
            Kick Participant
          </button>

        </div>
      )
    )}

  </div>
</div>

      {/* BOTTOM GRID */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 2fr",

          gap: "2rem",
        }}
      >

        {/* CHALLENGES */}

        <div
          className="glass-card"
          style={{ padding: "2rem" }}
        >

          <h2
            style={{
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Award size={20} />
            Contest Challenges
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection:
                "column",

              gap: "1rem",
            }}
          >

            {roomData.contest_challenges.map(
              (
                challenge,
                index
              ) => (

                <div
                  key={index}
                  style={{
                    padding:
                      "1rem",

                    borderRadius:
                      "12px",

                    background:
                      "rgba(15,23,42,0.4)",
                  }}
                >

                  <div
                    style={{
                      fontWeight:
                        "700",
                    }}
                  >
                    {
                      challenge.title
                    }
                  </div>

                  <div
                    style={{
                      color:
                        "var(--text-muted)",
                    }}
                  >
                    {
                      challenge.difficulty
                    }
                  </div>

                  <div
                    className="text-primary"
                    style={{
                      marginTop:
                        "0.5rem",
                    }}
                  >
                    {
                      challenge.points
                    }{" "}
                    pts
                  </div>
                </div>
              )
            )}

          </div>
        </div>

        {/* SUBMISSIONS */}

        <div
          className="glass-card"
          style={{ padding: "2rem" }}
        >

          <h2
            style={{
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Activity size={20} />
            Live Submissions Stream
          </h2>

          <table
            style={{
              width: "100%",
            }}
          >

            <thead>

              <tr>

                <th style={thStyle}>
                  User
                </th>

                <th style={thStyle}>
                  Problem
                </th>

                <th style={thStyle}>
                  Verdict
                </th>

                <th style={thStyle}>
                  Language
                </th>

                <th style={thStyle}>
                  Time
                </th>

              </tr>

            </thead>

            <tbody>

              {submissions.map(
                (
                  submission,
                  index
                ) => (

                  <tr
                    key={index}
                  >

                    <td
                      style={
                        tdStyle
                      }
                    >
                      {
                        submission.username
                      }
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      {
                        submission.challenge
                      }
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      <span
                        style={{
                          background:
                            submission.status ===
                            "CORRECT"
                              ? "rgba(34,197,94,0.12)"
                              : "rgba(239,68,68,0.12)",

                          color:
                            submission.status ===
                            "CORRECT"
                              ? "#22c55e"
                              : "#ef4444",

                          padding:
                            "0.2rem 0.5rem",

                          borderRadius:
                            "6px",

                          fontSize:
                            "0.75rem",

                          fontWeight:
                            "700",
                        }}
                      >
                        {
                          submission.status
                        }
                      </span>
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      {
                        submission.language
                      }
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      <div
                        style={{
                          display:
                            "flex",

                          alignItems:
                            "center",

                          gap:
                            "0.3rem",
                        }}
                      >
                        <Calendar size={12} />

                        {new Date(
                          submission.submitted_at
                        ).toLocaleTimeString()}
                      </div>
                    </td>

                  </tr>
                )
              )}

            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

const DetailRow = ({
  label,
  value,
}) => (

  <div
    style={{
      borderBottom:
        "1px solid rgba(255,255,255,0.05)",

      paddingBottom: "0.5rem",

      marginBottom: "1rem",
    }}
  >

    <span
      style={{
        display: "block",

        color:
          "var(--text-muted)",

        fontSize: "0.8rem",

        marginBottom: "0.2rem",
      }}
    >
      {label}
    </span>

    <span
      style={{
        fontWeight: "700",
      }}
    >
      {value}
    </span>
  </div>
);

const thStyle = {
  padding: "1rem",
  textAlign: "left",
  color: "var(--text-muted)",
  fontSize: "0.85rem",
};

const tdStyle = {
  padding: "1rem",
  borderBottom:
    "1px solid rgba(255,255,255,0.05)",
};

export default AdminRoomDetail;
