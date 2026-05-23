import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  History,
  PlusCircle,
  LogOut,
  Trophy,
  User,
  ShieldCheck,
  Code,
  Globe,
  Activity,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";
const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userNavItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Sessions", icon: History, path: "/sessions" },
    { label: "Create Room", icon: PlusCircle, path: "/create-room" },
  ];
  const adminNavItems = [
    { label: "Control Center", icon: ShieldCheck, path: "/admin-dashboard" },
    { label: "Challenges", icon: Code, path: "/admin/challenges" },
    { label: "Rooms", icon: Globe, path: "/admin/rooms" },
    { label: "Submissions", icon: Activity, path: "/admin/submissions" },
    { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  ];
  const navItems = user?.role === "ADMIN" ? adminNavItems : userNavItems;
  return (
    <nav
      className="glass-card"
      style={{
        margin: "1rem",
        padding: "0.75rem 1.5rem",
        borderRadius: "1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: "1rem",
        zIndex: 100,
        backdropFilter: "blur(20px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <Link
          to="/dashboard"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              background: "var(--primary)",
              padding: "0.5rem",
              borderRadius: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trophy size={20} color="white" />
          </div>
          <span
            style={{
              fontFamily: "Outfit",
              fontSize: "1.25rem",
              fontWeight: "700",
              color: "white",
            }}
          >
            FocusArena
          </span>
        </Link>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="btn btn-secondary"
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                border: "none",
                background:
                  location.pathname === item.path
                    ? "rgba(99, 102, 241, 0.1)"
                    : "transparent",
                color:
                  location.pathname === item.path
                    ? "var(--primary)"
                    : "var(--text-muted)",
              }}
            >
              <item.icon size={18} />
              <span style={{ marginLeft: "0.25rem" }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.75rem",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={16} color="white" />
          </div>
          <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
            {user?.username || "User"}
          </span>
        </div>
        <button
          onClick={logout}
          className="btn btn-danger"
          style={{ padding: "0.5rem" }}
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
};
export default Navbar;
