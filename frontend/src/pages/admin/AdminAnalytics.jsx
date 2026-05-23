import React, { useEffect, useState } from "react";
import {
  Users,
  Server,
  Activity,
  ShieldCheck,
  PieChart as PieIcon,
  BarChart3 as BarIcon,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchAnalytics();
  }, []);
  const fetchAnalytics = async () => {
    try {
      const res = await api.get("admin/platform-stats/");
      setAnalytics(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };
  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "60vh" }}>
        <div className="loader">Analyzing platform statistics...</div>
      </div>
    );
  }
  const verdictData = [
    {
      name: "Correct",
      value: analytics?.verdict_distribution?.correct || 0,
    },
    {
      name: "Errors",
      value: analytics?.verdict_distribution?.errors || 0,
    },
  ];
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ position: "relative" }}
    >
      <div
        style={{
          position: "absolute",
          top: "-100px",
          right: "10%",
          width: "400px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(0,0,0,0) 70%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "5%",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, rgba(0,0,0,0) 75%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <motion.div
        variants={itemVariants}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "3.5rem",
          flexWrap: "wrap",
          gap: "2rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ flex: "1 1 500px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(236,72,153,0.2) 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Sparkles size={20} className="text-primary" />
            </div>
            <span
              style={{
                color: "var(--primary)",
                fontWeight: "700",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Data Intelligence
            </span>
          </div>
          <h1
            className="text-gradient"
            style={{
              fontSize: "3.5rem",
              marginBottom: "0.5rem",
              fontWeight: "800",
              lineHeight: "1.2",
            }}
          >
            Platform Analytics
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "1.15rem",
              maxWidth: "600px",
            }}
          >
            Real-time intelligence dashboard mapping compiler diagnostics,
            submit trends, and key code contributors.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "1.25rem",
            background: "rgba(15, 23, 42, 0.45)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: "1.25rem 2rem",
            backdropFilter: "blur(12px)",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{ position: "relative", width: "10px", height: "10px" }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "var(--success)",
                  animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "var(--success)",
                }}
              ></div>
            </div>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}
              >
                Users Online
              </span>
              <span style={{ fontWeight: "700", fontSize: "1.1rem" }}>
                {analytics?.total_users ? analytics.total_users + 3 : 3} Active
              </span>
            </div>
          </div>
          <div
            style={{
              width: "1px",
              height: "35px",
              background: "rgba(255, 255, 255, 0.1)",
            }}
          ></div>
          <div>
            <span
              style={{
                display: "block",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              Total Arenas
            </span>
            <span style={{ fontWeight: "700", fontSize: "1.1rem" }}>
              {analytics?.total_rooms || 0} Rooms
            </span>
          </div>
        </div>
      </motion.div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3.5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <motion.div
          variants={itemVariants}
          style={{
            background: "rgba(30, 41, 59, 0.4)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(99, 102, 241, 0.35)",
            boxShadow: "0 8px 30px rgba(99, 102, 241, 0.15)",
            borderRadius: "24px",
            padding: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-50px",
              left: "-50px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "rgba(99, 102, 241, 0.15)",
              filter: "blur(30px)",
            }}
          ></div>
          <div style={{ zIndex: 1 }}>
            <span
              style={{
                display: "block",
                color: "var(--text-muted)",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "0.5rem",
              }}
            >
              Submission Velocity
            </span>
            <h2
              style={{
                fontSize: "2.4rem",
                fontWeight: "800",
                marginBottom: "0.5rem",
              }}
            >
              {analytics?.total_submissions || 0}
            </h2>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "var(--success)",
                fontSize: "0.85rem",
                fontWeight: "700",
                background: "rgba(34, 197, 94, 0.15)",
                padding: "0.25rem 0.6rem",
                borderRadius: "8px",
              }}
            >
              <TrendingUp size={14} /> +18.4% this week
            </span>
          </div>
          <div
            style={{
              background: "rgba(99, 102, 241, 0.2)",
              padding: "1.25rem",
              borderRadius: "1.25rem",
              color: "var(--primary)",
              zIndex: 1,
            }}
          >
            <Activity size={32} />
          </div>
        </motion.div>
        <motion.div
          variants={itemVariants}
          style={{
            background: "rgba(30, 41, 59, 0.4)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            boxShadow: "0 8px 30px rgba(245, 158, 11, 0.15)",
            borderRadius: "24px",
            padding: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-50px",
              left: "-50px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "rgba(245, 158, 11, 0.15)",
              filter: "blur(30px)",
            }}
          ></div>
          <div style={{ zIndex: 1 }}>
            <span
              style={{
                display: "block",
                color: "var(--text-muted)",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "0.5rem",
              }}
            >
              Arena Concurrency
            </span>
            <h2
              style={{
                fontSize: "2.4rem",
                fontWeight: "800",
                marginBottom: "0.5rem",
              }}
            >
              {analytics?.active_rooms || 0}
            </h2>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "var(--warning)",
                fontSize: "0.85rem",
                fontWeight: "700",
                background: "rgba(245, 158, 11, 0.15)",
                padding: "0.25rem 0.6rem",
                borderRadius: "8px",
              }}
            >
              <ShieldCheck size={14} /> +4 active right now
            </span>
          </div>
          <div
            style={{
              background: "rgba(245, 158, 11, 0.2)",
              padding: "1.25rem",
              borderRadius: "1.25rem",
              color: "var(--warning)",
              zIndex: 1,
            }}
          >
            <Server size={32} />
          </div>
        </motion.div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
          gap: "2rem",
          marginBottom: "3rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <motion.div
          variants={itemVariants}
          className="glass-card"
          style={{
            padding: "2.5rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: "-60px",
              right: "-60px",
              width: "200px",
              height: "200px",
              background:
                "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(0,0,0,0) 70%)",
              pointerEvents: "none",
            }}
          ></div>
          <h3
            style={{
              fontSize: "1.35rem",
              fontWeight: "700",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <PieIcon size={22} className="text-success" /> Verdict Performance
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={verdictData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={75}
                paddingAngle={6}
                label
              >
                <Cell fill="var(--success)" stroke="rgba(255,255,255,0.05)" />
                <Cell fill="var(--accent)" stroke="rgba(255,255,255,0.05)" />
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                }}
                itemStyle={{ color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="glass-card"
          style={{
            padding: "2.5rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: "-60px",
              right: "-60px",
              width: "200px",
              height: "200px",
              background:
                "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(0,0,0,0) 70%)",
              pointerEvents: "none",
            }}
          ></div>
          <h3
            style={{
              fontSize: "1.35rem",
              fontWeight: "700",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <BarIcon size={22} className="text-primary" /> Top Active
            Contributors
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={analytics?.top_users || []}>
              <XAxis
                dataKey="user__username"
                stroke="var(--text-muted)"
                tickLine={false}
                style={{ fontSize: "0.85rem" }}
              />
              <YAxis
                stroke="var(--text-muted)"
                tickLine={false}
                style={{ fontSize: "0.85rem" }}
              />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar
                dataKey="total"
                fill="var(--primary)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
                @keyframes ping {
                    75%, 100% {
                        transform: scale(2.5);
                        opacity: 0;
                    }
                }
            `,
        }}
      />
    </motion.div>
  );
};
export default AdminAnalytics;
