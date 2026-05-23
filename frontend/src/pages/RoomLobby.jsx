import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  Terminal,
  Share2,
  Play,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
function RoomLobby() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [profile, setProfile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState("");
  const fetchRoom = async () => {
    try {
      const response = await api.get(`/rooms/${roomCode}/`);
      setRoom(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to locate this arena. It may have been decommissioned.");
    }
  };
  const fetchProfile = async () => {
    try {
      const response = await api.get("/auth/profile/");
      setProfile(response.data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchProfile();
    fetchRoom();
    const interval = setInterval(fetchRoom, 5000);
    return () => clearInterval(interval);
  }, [roomCode]);
  useEffect(() => {
    if (room?.status !== "ACTIVE" || !room?.started_at) return;
    const interval = setInterval(() => {
      const started = new Date(room.started_at).getTime();
      const now = new Date().getTime();
      const diff = 10 - Math.floor((now - started) / 1000);
      if (diff <= 0) {
        setCountdown(0);
        setTimeout(() => {
          navigate(`/battle/${roomCode}`);
        }, 1000);
        clearInterval(interval);
      } else {
        setCountdown(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [room]);
  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  const startRoom = async () => {
    try {
      setStarting(true);
      await api.post(`/rooms/${roomCode}/start/`);
      await fetchRoom();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to start arena");
    } finally {
      setStarting(false);
    }
  };
  const isCreator = profile?.user === room?.creator;
  if (error) {
    return (
      <div className="flex-center" style={{ minHeight: "60vh" }}>
        <div
          className="glass-card"
          style={{
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          <ShieldCheck
            size={48}
            color="var(--error)"
            style={{
              marginBottom: "1rem",
            }}
          />
          <h2
            style={{
              marginBottom: "1rem",
            }}
          >
            Arena Error
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              marginBottom: "2rem",
            }}
          >
            {error}
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-primary"
            style={{
              width: "100%",
            }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  if (!room || !profile) {
    return (
      <div
        className="flex-center"
        style={{
          minHeight: "60vh",
        }}
      >
        <div className="loader">Synchronizing with Arena {roomCode}...</div>
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fade-in"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2.5rem",
        }}
      >
        <div>
          <h1
            className="text-gradient"
            style={{
              fontSize: "2.5rem",
              marginBottom: "0.25rem",
            }}
          >
            Arena Lobby
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Terminal size={16} />
            Protocol:
            <span
              className="text-primary"
              style={{
                fontWeight: "600",
              }}
            >
              Competitive Focus
            </span>
          </p>
        </div>
        <div
          className="glass-card"
          style={{
            padding: "0.5rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            borderStyle: "dashed",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.625rem",
                color: "var(--text-muted)",
                fontWeight: "700",
                textTransform: "uppercase",
              }}
            >
              Arena Access Code
            </p>
            <p
              style={{
                fontSize: "1.25rem",
                fontWeight: "800",
                letterSpacing: "0.1em",
                fontFamily: "monospace",
              }}
            >
              {room.room_code}
            </p>
          </div>
          <button
            onClick={copyCode}
            className="btn btn-secondary"
            style={{
              padding: "0.5rem",
              background: copied ? "var(--success)" : "rgba(255,255,255,0.05)",
              color: copied ? "white" : "inherit",
            }}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
      </div>
      <div className="grid-cols-2">
        <div className="glass-card">
          <h2
            style={{
              fontSize: "1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <Target className="text-primary" size={20} />
            Mission Parameters
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {[
              {
                label: "Difficulty",
                value: room.difficulty,
                icon: Zap,
                color: "#f59e0b",
              },
              {
                label: "Status",
                value: room.status,
                icon: ShieldCheck,
                color: room.status === "ACTIVE" ? "#10b981" : "#6366f1",
              },
              {
                label: "Commander",
                value: room.creator,
                icon: Users,
                color: "#6366f1",
              },
            ].map((param, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  borderRadius: "0.75rem",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <param.icon
                    size={18}
                    style={{
                      color: param.color,
                    }}
                  />
                  <span
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.875rem",
                    }}
                  >
                    {param.label}
                  </span>
                </div>
                <span
                  style={{
                    fontWeight: "600",
                  }}
                >
                  {param.value}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: "2rem",
            }}
          >
            {room.status === "WAITING" && isCreator && (
              <button
                onClick={startRoom}
                disabled={starting}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "1.25rem",
                  fontSize: "1.1rem",
                  opacity: starting ? 0.7 : 1,
                }}
              >
                <Play size={20} fill="currentColor" />
                {starting ? "Initializing..." : "Initialize Combat Protocol"}
              </button>
            )}
            {!isCreator && room.status === "WAITING" && (
              <div
                style={{
                  marginTop: "1rem",
                  textAlign: "center",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                }}
              >
                Waiting for commander to initialize battle...
              </div>
            )}
            {room.status === "ACTIVE" && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  borderRadius: "0.75rem",
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  textAlign: "center",
                  fontWeight: "700",
                  color: "#10b981",
                }}
              >
                {countdown > 0 ? (
                  <>Battle begins in {countdown}s</>
                ) : (
                  <>Battle Started</>
                )}
              </div>
            )}
          </div>
        </div>
        <div
          className="glass-card"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <Users className="text-primary" size={20} />
            Active Participants
          </h2>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <AnimatePresence>
              {room.participants.map((participant, index) => (
                <motion.div
                  key={participant}
                  initial={{
                    opacity: 0,
                    x: -10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: index * 0.1,
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: `linear-gradient(
                          135deg,
                          var(--primary)
                          ${index * 20}%,
                          var(--accent) 100%
                        )`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: "800",
                    }}
                  >
                    {participant.substring(0, 2).toUpperCase()}
                  </div>
                  <span
                    style={{
                      fontWeight: "500",
                    }}
                  >
                    {participant}
                  </span>
                  {participant === room.creator && (
                    <span
                      style={{
                        fontSize: "0.625rem",
                        background: "rgba(245, 158, 11, 0.1)",
                        color: "var(--warning)",
                        padding: "0.1rem 0.4rem",
                        borderRadius: "0.25rem",
                        fontWeight: "700",
                        marginLeft: "auto",
                      }}
                    >
                      COMMANDER
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <button
            onClick={copyCode}
            className="btn btn-secondary"
            style={{
              marginTop: "1.5rem",
              width: "100%",
            }}
          >
            <Share2 size={18} />
            {copied ? "Code Copied" : "Invite More Challengers"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
export default RoomLobby;
