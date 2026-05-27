import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Editor from "@monaco-editor/react";
import { Trophy, Clock3, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import useFocusTracking from "../hooks/useFocusTracking";
function BattleRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [output, setOutput] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  useFocusTracking(
  roomCode,
  setTabWarnings,
  setShowTabWarning
);
  const currentProblem = room?.problems?.[selectedProblem];
  const battleEnded = room?.status === "FINISHED";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const hasInitializedCode = useRef(false);
  const fetchRoom = useCallback(async () => {
    try {
      const response = await api.get(`/rooms/${roomCode}/`);
      setRoom(response.data);
      if (!hasInitializedCode.current && response.data.problems?.length > 0) {
        setCode(response.data.problems[0].starter_code || "");
        hasInitializedCode.current = true;
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load battle");
    }
  }, [roomCode]);
  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await api.get(`/rooms/${roomCode}/leaderboard/`);
      setLeaderboard(response.data);
    } catch (err) {
      console.error(err);
    }
  }, [roomCode]);
  const fetchSubmissions = useCallback(async () => {
    try {
      const response = await api.get(`/rooms/${roomCode}/submissions/`);
      setSubmissions(response.data);
    } catch (err) {
      console.error(err);
    }
  }, [roomCode]);
  useEffect(() => {
    fetchRoom();
    fetchLeaderboard();
    fetchSubmissions();
    const interval = setInterval(() => {
      fetchLeaderboard();
      fetchRoom();
      fetchSubmissions();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchRoom, fetchLeaderboard, fetchSubmissions]);
  useEffect(() => {
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/rooms/${roomCode}/`);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "leaderboard_update") {
        fetchLeaderboard();
      }
    };
    socket.onopen = () => console.log("WebSocket connected");
    socket.onclose = () => console.log("WebSocket disconnected");
    return () => socket.close();
  }, [roomCode, fetchLeaderboard]);

  useEffect(() => {
    if (!room?.started_at) return;
    const updateTimer = () => {
      const startedAt = new Date(room.started_at);
      const endTime = startedAt.getTime() + room.time_limit * 60 * 1000;
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [room]);
  const handleRunCode = async () => {
    try {
      setOutput("Running code...");
      setTestResults([]);
      const response = await api.post(`/rooms/${roomCode}/run/`, {
        problem_id: currentProblem?.id,
        code,
        language: "python",
      });
      setTestResults(response.data.results || []);
      setOutput(`Execution Status: ${response.data.status}`);
    } catch (err) {
      console.error(err);
      setOutput(err.response?.data?.error || "Execution failed");
    }
  };
  const handleSubmit = async () => {
    if (battleEnded) return;
    try {
      const response = await api.post(`/rooms/${roomCode}/submit/`, {
        problem_id: currentProblem?.id,
        code,
        language: "python",
      });
      setTestResults(response.data.results || []);
      setOutput(`Submission Status: ${response.data.status}`);
      fetchLeaderboard();
    } catch (err) {
      console.error(err);
      setOutput(err.response?.data?.error || "Submission failed");
    }
  };
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background:
            "radial-gradient(circle at top, #1e293b 0%, #020617 100%)",
          color: "white",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "2rem",
            borderRadius: "1rem",
          }}
        >
          <AlertCircle color="#ef4444" />
          <h2>{error}</h2>
        </div>
      </div>
    );
  }
  if (!room) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "1rem",
          background:
            "radial-gradient(circle at top, #1e293b 0%, #020617 100%)",
          color: "white",
        }}
      >
        <Loader2 size={40} />
        <h2>Loading Battle...</h2>
      </div>
    );
  }
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        background: "radial-gradient(circle at top, #1e293b 0%, #020617 100%)",
        color: "white",
      }}
    >
      {showTabWarning && (
        <motion.div
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          style={{
            position: "fixed",
            top: "30px",
            right: "30px",
            zIndex: 9999,
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.4)",
            backdropFilter: "blur(12px)",
            padding: "1rem 1.4rem",
            borderRadius: "1rem",
            boxShadow: "0 0 30px rgba(239,68,68,0.35)",
            color: "white",
          }}
        >
          <h4
            style={{
              marginBottom: "0.4rem",
            }}
          >
            Tab Switching Detected
          </h4>
          <p
            style={{
              color: "#fecaca",
              fontSize: "0.9rem",
            }}
          >
            Warning Count: {tabWarnings}
          </p>
        </motion.div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "3rem", fontWeight: "800" }}>Battle Arena</h1>
          <p style={{ color: "#94a3b8" }}>Room: {room.room_code}</p>
        </div>
        <div
          style={{
            padding: "1rem 1.5rem",
            borderRadius: "1rem",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <Clock3 color="#a855f7" />
            <div>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                Remaining Time
              </p>
              <h2 style={{ fontSize: "1.8rem", fontWeight: "800" }}>
                {battleEnded ? "Finished" : formatTime()}
              </h2>
              <p
                style={{
                  marginTop: "0.5rem",
                  color: tabWarnings > 0 ? "#ef4444" : "#94a3b8",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                }}
              >
                Warnings: {tabWarnings}
              </p>
            </div>
          </div>
        </div>
      </div>
      {battleEnded && (
        <div
          style={{
            marginBottom: "2rem",
            padding: "1rem",
            borderRadius: "1rem",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            textAlign: "center",
          }}
        >
          <h2>Battle Finished</h2>
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr",
          gap: "2rem",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            {room?.problems?.map((problem, index) => (
              <button
                key={problem.id}
                onClick={() => {
                  setSelectedProblem(index);
                  setCode(problem.starter_code || "");
                  setOutput("");
                  setTestResults([]);
                }}
                style={{
                  padding: "0.9rem 1.4rem",
                  borderRadius: "1rem",
                  border: "none",
                  cursor: "pointer",
                  background: selectedProblem === index ? "#7c3aed" : "#1e293b",
                  color: "white",
                  fontWeight: "700",
                  fontSize: "1rem",
                }}
              >
                Problem {String.fromCharCode(65 + index)}
              </button>
            ))}
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: "1.5rem",
              padding: "2rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <Trophy color="#facc15" size={32} />
              <div>
                <h2 style={{ fontSize: "2rem", fontWeight: "800" }}>
                  {currentProblem?.title}
                </h2>
                <p style={{ color: "#94a3b8" }}>
                  Solve the problem before time runs out
                </p>
                <div
                  style={{
                    marginTop: "0.8rem",
                    display: "flex",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      background: "#1e293b",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "0.7rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    Difficulty: {currentProblem?.difficulty}
                  </span>
                  <span
                    style={{
                      background: "#7c3aed",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "0.7rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    {currentProblem?.points} pts
                  </span>
                </div>
              </div>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                padding: "1.5rem",
                borderRadius: "1rem",
                lineHeight: "1.8",
              }}
            >
              {currentProblem?.description}
            </div>
          </div>
          <div
            style={{
              height: "500px",
              borderRadius: "1rem",
              overflow: "hidden",
              marginBottom: "1rem",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                scrollBeyondLastLine: false,
                readOnly: battleEnded,
                automaticLayout: true,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
            <button
              onClick={handleRunCode}
              disabled={battleEnded}
              style={{
                flex: 1,
                padding: "1rem",
                borderRadius: "1rem",
                border: "none",
                background: battleEnded ? "#475569" : "#2563eb",
                color: "white",
                fontWeight: "700",
                cursor: battleEnded ? "not-allowed" : "pointer",
              }}
            >
              Run Code
            </button>
            <button
              onClick={handleSubmit}
              disabled={battleEnded}
              style={{
                flex: 1,
                padding: "1rem",
                borderRadius: "1rem",
                border: "none",
                background: battleEnded ? "#475569" : "#7c3aed",
                color: "white",
                fontWeight: "700",
                cursor: battleEnded ? "not-allowed" : "pointer",
                opacity: battleEnded ? 0.7 : 1,
              }}
            >
              {battleEnded ? "Battle Ended" : "Submit Solution"}
            </button>
          </div>
          <div
            style={{
              background: "#020617",
              borderRadius: "1rem",
              padding: "1.5rem",
            }}
          >
            <pre style={{ color: "#22c55e", whiteSpace: "pre-wrap" }}>
              {output || "No output yet"}
            </pre>
            {testResults.length > 0 && (
              <div
                style={{
                  marginTop: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {testResults.map((test, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "1rem",
                      borderRadius: "1rem",
                      background: test.passed
                        ? "rgba(34,197,94,0.08)"
                        : "rgba(239,68,68,0.08)",
                      border: test.passed
                        ? "1px solid rgba(34,197,94,0.3)"
                        : "1px solid rgba(239,68,68,0.3)",
                    }}
                  >
                    <h4>Test Case #{index + 1}</h4>
                    <p>
                      <strong>Input:</strong> {test.input}
                    </p>
                    <p>
                      <strong>Expected:</strong> {test.expected}
                    </p>
                    <p>
                      <strong>Got:</strong> {test.got}
                    </p>
                    <p
                      style={{
                        color: test.passed ? "#22c55e" : "#ef4444",
                        fontWeight: "700",
                      }}
                    >
                      {test.passed ? "PASSED" : "FAILED"}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {submissions.length > 0 && (
              <div style={{ marginTop: "2rem" }}>
                <h3
                  style={{
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  Submission History
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {submissions.map((sub, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "0.75rem 1rem",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: "0.75rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div>
                        <p style={{ fontSize: "0.9rem", fontWeight: "600" }}>
                          {sub.challenge}
                        </p>
                        <p style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                          {new Date(sub.submitted_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "800",
                          color:
                            sub.status === "CORRECT" ? "#22c55e" : "#ef4444",
                        }}
                      >
                        {sub.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              padding: "1.5rem",
              borderRadius: "1.25rem",
            }}
          >
            {battleEnded && leaderboard.length > 0 && (
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  borderRadius: "1rem",
                  background: "rgba(250,204,21,0.12)",
                  border: "1px solid rgba(250,204,21,0.3)",
                }}
              >
                <h2 style={{ color: "#facc15" }}>Winner 🏆</h2>
                <h3>{leaderboard[0].username}</h3>
              </div>
            )}
            <h3 style={{ marginBottom: "1rem" }}>Leaderboard</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {leaderboard.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: "1rem",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "1rem",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: index === 0 ? "#f59e0b" : "#334155",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "800",
                          fontSize: "0.9rem",
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p style={{ fontWeight: "700", fontSize: "1rem" }}>
                          {item.username}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          {item.solved_count} Solved • {item.penalty}m Penalty
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p
                        style={{
                          fontWeight: "800",
                          fontSize: "1.2rem",
                          color: "var(--primary)",
                        }}
                      >
                        {item.total_points}
                      </p>
                      <p
                        style={{
                          fontSize: "0.65rem",
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Points
                      </p>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}
                  >
                    {Object.entries(item.problems || {}).map(
                      ([label, status]) => (
                        <div
                          key={label}
                          title={`${label}: ${status}`}
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                            fontWeight: "800",
                            background:
                              status === "CORRECT"
                                ? "#22c55e"
                                : status === "WRONG"
                                  ? "#ef4444"
                                  : status === "ERROR"
                                    ? "#f97316"
                                    : "#1e293b",
                            color:
                              status === "NOT_SOLVED" ? "#475569" : "white",
                            border:
                              status === "NOT_SOLVED"
                                ? "1px solid rgba(255,255,255,0.05)"
                                : "none",
                          }}
                        >
                          {label}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {battleEnded && timeLeft === 0 && leaderboard.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(2, 6, 23, 0.9)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justify_content: "center",
            zIndex: 9999,
            padding: "2rem",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card"
            style={{
              maxWidth: "600px",
              width: "100%",
              textAlign: "center",
              border: "1px solid var(--primary)",
              boxShadow: "0 0 40px rgba(99, 102, 241, 0.2)",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🏆</div>
            <h1
              className="text-gradient"
              style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}
            >
              Battle Concluded
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
              Final rankings for Arena {roomCode}
            </p>
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: "1rem",
                padding: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                    }}
                  >
                    Champion
                  </p>
                  <p
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "800",
                      color: "var(--primary)",
                    }}
                  >
                    {leaderboard[0].username}
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {leaderboard.slice(0, 3).map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.75rem",
                      background:
                        i === 0 ? "rgba(99, 102, 241, 0.1)" : "transparent",
                      borderRadius: "0.5rem",
                    }}
                  >
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <span
                        style={{
                          fontWeight: "800",
                          color: i === 0 ? "#f59e0b" : "#94a3b8",
                        }}
                      >
                        #{i + 1}
                      </span>
                      <span style={{ fontWeight: "600" }}>{item.username}</span>
                    </div>
                    <span style={{ fontWeight: "700" }}>
                      {item.total_points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn btn-primary"
              style={{ width: "100%", padding: "1rem" }}
            >
              Return to Dashboard
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
export default BattleRoom;
