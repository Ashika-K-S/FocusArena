import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Server, Users, ShieldCheck, Trash2, Eye, Award } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/axios";
const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();
  const fetchRooms = async () => {
    try {
      const res = await api.get("/admin/rooms/");
      setRooms(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchRooms();
  }, []);
  const handleDeleteRoom = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this room?",
    );
    if (!confirmDelete) return;
    try {
      await api.delete(`/admin/rooms/${id}/delete/`);
      fetchRooms();
    } catch (err) {
      console.log(err);
    }
  };
  const handleEndRoom = async (id) => {
    try {
      await api.patch(`/admin/rooms/${id}/end/`);
      fetchRooms();
    } catch (err) {
      console.log(err);
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
  const getStatusStyle = (status) => {
    switch (status) {
      case "ACTIVE":
        return { bg: "rgba(34, 197, 94, 0.12)", text: "var(--success)" };
      case "FINISHED":
        return { bg: "rgba(239, 68, 68, 0.12)", text: "var(--accent)" };
      default:
        return { bg: "rgba(245, 158, 11, 0.12)", text: "var(--warning)" };
    }
  };
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: "3rem" }}>
        <h1
          className="text-gradient"
          style={{ fontSize: "3rem", marginBottom: "0.5rem" }}
        >
          Manage Arenas
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Monitor active coding rooms, oversee live concurrency, and manage
          completed arenas.
        </p>
      </motion.div>
      {rooms.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="glass-card"
          style={{
            padding: "4rem 2rem",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "1.2rem",
          }}
        >
          No contest rooms are currently active on the platform.
        </motion.div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {rooms.map((room) => {
            const statusStyle = getStatusStyle(room.status);
            return (
              <motion.div
                key={room.id}
                variants={itemVariants}
                className="glass-card table-row-hover"
                style={{
                  padding: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "800",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Room #{room.room_code}
                    </h2>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      Host: <strong>{room.created_by}</strong>
                    </span>
                  </div>
                  <span
                    style={{
                      background: statusStyle.bg,
                      color: statusStyle.text,
                      padding: "0.25rem 0.75rem",
                      borderRadius: "999px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                    }}
                  >
                    {room.status}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "var(--text-muted)",
                      fontSize: "0.95rem",
                    }}
                  >
                    <Users size={16} />
                    <span>
                      Participants: <strong>{room.participants_count}</strong> /{" "}
                      {room.max_participants}
                    </span>
                  </div>
                  {room.time_limit_minutes && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "var(--text-muted)",
                        fontSize: "0.95rem",
                      }}
                    >
                      <Award size={16} />
                      <span>Duration: {room.time_limit_minutes} minutes</span>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {room.status === "ACTIVE" && (
                    <button
                      onClick={() => handleEndRoom(room.id)}
                      className="btn btn-secondary"
                      style={{
                        flex: 1,
                        padding: "0.6rem 1rem",
                        fontSize: "0.85rem",
                        borderColor: "rgba(245, 158, 11, 0.25)",
                        color: "var(--warning)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <ShieldCheck size={14} /> End Room
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/admin/rooms/${room.id}`)}
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      padding: "0.6rem 1rem",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="btn btn-secondary"
                    style={{
                      padding: "0.6rem 1rem",
                      fontSize: "0.85rem",
                      borderColor: "rgba(239, 68, 68, 0.25)",
                      color: "var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
export default ManageRooms;
