import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Users,
  Zap,
  Activity,
  Plus,
  LogIn,
  ChevronRight,
  History,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user?.role === "ADMIN") {
      navigate("/admin-dashboard");
      return;
    }
    Promise.all([
      api.get("auth/profile/"),
      api.get("dashboard/stats/"),
      api.get("dashboard/history/"),
      api.get("dashboard/analytics/"),
    ])
                .then(([profileRes, statsRes, historyRes, analyticsRes]) => {
            console.log("PROFILE:", profileRes.data);
            console.log("STATS:", statsRes.data);
            console.log("HISTORY:", historyRes.data);
            console.log("ANALYTICS:", analyticsRes.data);

            setProfile(profileRes.data);
            setStats(statsRes.data);

            setHistory(
              Array.isArray(historyRes.data)
                ? historyRes.data
                : historyRes.data?.results ||
                    historyRes.data?.history ||
                    []
            );

            setAnalytics(
              Array.isArray(analyticsRes.data)
                ? analyticsRes.data
                : analyticsRes.data?.results ||
                    analyticsRes.data?.analytics ||
                    []
            );

            setLoading(false);
          })
      .catch((err) => {
        console.error(err);
        setError("Failed to load dashboard");
        setLoading(false);
      });
  }, [user, navigate]);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };
  const statsData = [
    {
      label: "Total Contests",
      value: stats?.total_contests || 0,
      icon: Activity,
      color: "#6366f1",
    },
    {
      label: "Problems Solved",
      value: stats?.problems_solved || 0,
      icon: Trophy,
      color: "#10b981",
    },
    {
      label: "Competitions Won",
      value: stats?.competitions_won || 0,
      icon: Zap,
      color: "#f59e0b",
    },
    {
      label: "Global Rank",
      value: `#${stats?.global_rank || 0}`,
      icon: Users,
      color: "#f43f5e",
    },
  ];
  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "60vh" }}>
        <div className="loader">Loading your arena...</div>
      </div>
    );
  }
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: "3rem" }}>
        <h1
          className="text-gradient"
          style={{ fontSize: "3rem", marginBottom: "0.5rem" }}
        >
          Welcome Back, {profile?.user || user?.username}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Ready for another battle? Track your performance, rankings, and
          analytics in real time.
        </p>
      </motion.div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        {statsData.map((stat, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="glass-card"
            style={{
              padding: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div
              style={{
                background: `${stat.color}20`,
                padding: "0.75rem",
                borderRadius: "0.75rem",
                color: stat.color,
              }}
            >
              <stat.icon size={24} />
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                {stat.label}
              </p>
              <h3 style={{ fontSize: "1.7rem" }}>{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>
      <div
        className="grid-cols-2"
        style={{ gap: "2rem", marginBottom: "3rem" }}
      >
        <motion.div
          variants={itemVariants}
          className="glass-card"
          style={{
            background:
              "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(30, 41, 59, 0.7) 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2
              style={{
                fontSize: "1.75rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <Plus className="text-primary" /> Create Arena
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
              Host a multiplayer coding contest and challenge others in realtime
              battles.
            </p>
            <button
              onClick={() => navigate("/create-room")}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              Initialize Room <ChevronRight size={18} />
            </button>
          </div>
          <div
            style={{
              position: "absolute",
              right: "-20px",
              bottom: "-20px",
              opacity: 0.05,
              transform: "rotate(-15deg)",
            }}
          >
            <Trophy size={200} />
          </div>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="glass-card"
          style={{
            background:
              "linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(30, 41, 59, 0.7) 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2
              style={{
                fontSize: "1.75rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <LogIn className="text-primary" style={{ color: "#f43f5e" }} />{" "}
              Join Battle
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
              Enter an invitation code and participate in live coding contests
              with other players.
            </p>
            <button
              onClick={() => navigate("/join-room")}
              className="btn btn-secondary"
              style={{ width: "100%", borderColor: "#f43f5e30" }}
            >
              Enter Code <ChevronRight size={18} />
            </button>
          </div>
          <div
            style={{
              position: "absolute",
              right: "-20px",
              bottom: "-20px",
              opacity: 0.05,
              transform: "rotate(-15deg)",
            }}
          >
            <Users size={200} />
          </div>
        </motion.div>
      </div>
      <motion.div variants={itemVariants} style={{ marginBottom: "3rem" }}>
        <h2
          style={{
            fontSize: "1.75rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <TrendingUp size={24} className="text-primary" /> Performance
          Analytics
        </h2>
        <div
          className="glass-card"
          style={{ padding: "2rem", height: "400px" }}
        >
          <div style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height={300}>

            <LineChart data={Array.isArray(analytics) ? analytics : []}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="contest"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                }}
                itemStyle={{ color: "#6366f1" }}
              />
              <Line
                type="monotone"
                dataKey="points"
                stroke="#6366f1"
                strokeWidth={4}
                dot={{ fill: "#6366f1", strokeWidth: 2, r: 4, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
      <motion.div variants={itemVariants} style={{ marginTop: "3rem" }}>
        <h2
          style={{
            fontSize: "1.75rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <History size={24} className="text-primary" /> Recent Contests
        </h2>
        <div
          className="glass-card"
          style={{ padding: "0", overflow: "hidden" }}
        >
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
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "var(--text-muted)",
                  }}
                >
                  Room
                </th>
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "var(--text-muted)",
                  }}
                >
                  Points
                </th>
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "var(--text-muted)",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "var(--text-muted)",
                  }}
                >
                  Result
                </th>
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "var(--text-muted)",
                  }}
                >
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(history) && history.length > 0 ? (
                history.map((item, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      transition: "background 0.2s",
                    }}
                    className="table-row-hover"
                  >
                    <td
                      style={{
                        padding: "1.25rem 1.5rem",
                        fontWeight: "700",
                        color: "var(--primary)",
                      }}
                    >
                      {item.room_code}
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      {item.score || 0}
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.6rem",
                          borderRadius: "0.5rem",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          background:
                            item.status === "FINISHED"
                              ? "rgba(148, 163, 184, 0.1)"
                              : "rgba(34, 197, 94, 0.1)",
                          color:
                            item.status === "FINISHED" ? "#94a3b8" : "#22c55e",
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      {item.is_winner ? (
                        <span
                          style={{
                            color: "#facc15",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            fontWeight: "700",
                          }}
                        >
                          <Trophy size={14} /> Won
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>
                          Participated
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "1.25rem 1.5rem",
                        color: "var(--text-muted)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      padding: "3rem",
                      textAlign: "center",
                      color: "var(--text-muted)",
                    }}
                  >
                    No contest history found. Start a battle to see your
                    results!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
      {error && (
        <div
          className="btn btn-danger"
          style={{ width: "100%", marginTop: "2rem", cursor: "default" }}
        >
          {error}
        </div>
      )}
    </motion.div>
  );
}
export default Dashboard;
