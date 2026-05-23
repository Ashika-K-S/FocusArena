import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  FileText,
  Code,
  Trash2,
  Edit3,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/axios";
function ManageChallenges() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "EASY",
  });
  useEffect(() => {
    fetchChallenges();
  }, []);
  const fetchChallenges = async () => {
    try {
      const res = await api.get("admin/challenges/");
      setChallenges(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const createChallenge = async (e) => {
    e.preventDefault();
    try {
      await api.post("admin/challenges/create/", formData);
      setFormData({
        title: "",
        description: "",
        difficulty: "EASY",
      });
      fetchChallenges();
    } catch (err) {
      console.error(err);
    }
  };
  const deleteChallenge = async (id) => {
    try {
      await api.delete(`admin/challenges/${id}/delete/`);
      fetchChallenges();
    } catch (error) {
      console.log(error);
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
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return { bg: "rgba(34, 197, 94, 0.12)", text: "var(--success)" };
      case "MEDIUM":
        return { bg: "rgba(245, 158, 11, 0.12)", text: "var(--warning)" };
      default:
        return { bg: "rgba(239, 68, 68, 0.12)", text: "var(--accent)" };
    }
  };
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: "3rem" }}>
        <h1
          className="text-gradient"
          style={{ fontSize: "3rem", marginBottom: "0.5rem" }}
        >
          Manage Challenges
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Create, update, and manage the algorithmic coding challenges available
          in FocusArena.
        </p>
      </motion.div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        <motion.div
          variants={itemVariants}
          className="glass-card"
          style={{ padding: "2rem", position: "relative", overflow: "hidden" }}
        >
          <div
            style={{
              position: "absolute",
              top: "-50px",
              left: "-50px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "rgba(99, 102, 241, 0.1)",
              filter: "blur(30px)",
            }}
          ></div>
          <h2
            style={{
              fontSize: "1.5rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <PlusCircle size={22} className="text-primary" /> Create Challenge
          </h2>
          <form
            onSubmit={createChallenge}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                Challenge Title
              </label>
              <input
                type="text"
                placeholder="e.g. Reverse a Linked List"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="form-input"
                style={{ width: "100%" }}
                required
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                Problem Description
              </label>
              <textarea
                placeholder="Specify the requirements, input limits, and expected outputs..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="form-input"
                style={{
                  width: "100%",
                  minHeight: "150px",
                  resize: "vertical",
                }}
                required
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value })
                }
                className="form-input"
                style={{ width: "100%" }}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: "100%",
                marginTop: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <Code size={18} /> Initialize Challenge
            </button>
          </form>
        </motion.div>
        <motion.div
          variants={itemVariants}
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FileText size={22} className="text-primary" /> Active Challenge
            Catalog
          </h2>
          {challenges.length === 0 ? (
            <div
              className="glass-card"
              style={{
                padding: "4rem 2rem",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              No challenges currently in the database.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {challenges.map((challenge) => {
                const colors = getDifficultyColor(challenge.difficulty);
                return (
                  <div
                    key={challenge.id}
                    onClick={() =>
                      navigate(`/admin/challenges/${challenge.id}`)
                    }
                    className="glass-card table-row-hover"
                    style={{
                      padding: "1.5rem 2rem",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h3 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
                        {challenge.title}
                      </h3>
                      <span
                        style={{
                          background: colors.bg,
                          color: colors.text,
                          padding: "0.25rem 0.75rem",
                          borderRadius: "999px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                        }}
                      >
                        {challenge.difficulty}
                      </span>
                    </div>
                    <p
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.95rem",
                        lineHeight: "1.5",
                        display: "-webkit-box",
                        WebkitLineClamp: "2",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {challenge.description}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/challenges/${challenge.id}`);
                        }}
                        className="btn btn-secondary"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          padding: "0.5rem 1rem",
                          fontSize: "0.85rem",
                        }}
                      >
                        <Edit3 size={14} /> Configure
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const confirmDelete = window.confirm(
                            "Are you sure you want to delete this challenge?",
                          );
                          if (confirmDelete) {
                            deleteChallenge(challenge.id);
                          }
                        }}
                        className="btn btn-secondary"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          padding: "0.5rem 1rem",
                          fontSize: "0.85rem",
                          borderColor: "rgba(239, 68, 68, 0.25)",
                          color: "var(--accent)",
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
export default ManageChallenges;
