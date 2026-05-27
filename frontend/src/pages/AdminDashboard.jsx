import { useEffect, useState } from "react";
import {
  Users,
  Activity,
  ShieldCheck,
  Search,
  Mail,
  Calendar,
  Server,
} from "lucide-react";

import { motion } from "framer-motion";

import api from "../api/axios";

function AdminDashboard() {

  const [users, setUsers] = useState([]);

  const [stats, setStats] = useState({
    total_users: 0,
    total_rooms: 0,
    total_submissions: 0,
    active_rooms: 0,
  });

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] =
    useState(null);

  useEffect(() => {

    fetchData();

  }, []);

  // =========================
  // FETCH DASHBOARD DATA
  // =========================

  const fetchData = async () => {

    setLoading(true);

    try {

      const [usersRes, statsRes] =
        await Promise.all([
          api.get("admin/users/"),
          api.get("admin/stats/"),
        ]);

      setUsers(usersRes.data);

      setStats(statsRes.data);

      setLoading(false);

    } catch (err) {

      console.error(err);

      setError(
        "Failed to fetch admin data. Ensure you have admin privileges."
      );

      setLoading(false);
    }
  };

  // =========================
  // BLOCK USER
  // =========================

  const handleBlockUser = async (
    userId
  ) => {

    const reason = prompt(
      "Enter blocking reason"
    );

    if (!reason || !reason.trim()) {

      alert(
        "Blocking reason required"
      );

      return;
    }

    try {

      setActionLoading(userId);

      await api.patch(
        `/admin/users/${userId}/block/`,
        {
          reason,
        }
      );

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                is_blocked: true,
                blocked_reason: reason,
              }
            : user
        )
      );

    } catch (err) {

      console.log(err);

    } finally {

      setActionLoading(null);
    }
  };

  // =========================
  // UNBLOCK USER
  // =========================

  const handleUnblockUser = async (
    userId
  ) => {

    try {

      setActionLoading(userId);

      await api.patch(
        `/admin/users/${userId}/unblock/`
      );

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                is_blocked: false,
                blocked_reason: "",
              }
            : user
        )
      );

    } catch (err) {

      console.log(err);

    } finally {

      setActionLoading(null);
    }
  };

  // =========================
  // SEARCH FILTER
  // =========================

  const filteredUsers =
    users.filter(
      (user) =>
        user.username
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        user.email
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          )
    );

  // =========================
  // ANIMATION
  // =========================

  const containerVariants = {
    hidden: { opacity: 0 },

    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0,
    },

    visible: {
      y: 0,
      opacity: 1,
    },
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <div
        className="flex-center"
        style={{
          minHeight: "60vh",
        }}
      >
        <div className="loader">
          Initializing Admin Systems...
        </div>
      </div>
    );
  }

  return (

    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >

      {/* HEADER */}

      <motion.div
        variants={itemVariants}
        style={{
          marginBottom: "3rem",
        }}
      >

        <h1
          className="text-gradient"
          style={{
            fontSize: "3rem",
            marginBottom: "0.5rem",
          }}
        >
          Admin Control Center
        </h1>

        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "1.1rem",
          }}
        >
          Monitor platform activity,
          manage users, and oversee
          the FocusArena ecosystem.
        </p>

      </motion.div>

      {/* STATS */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "repeat(auto-fit, minmax(240px, 1fr))",

          gap: "1.5rem",

          marginBottom: "3rem",
        }}
      >

        {/* TOTAL USERS */}

        <motion.div
          variants={itemVariants}
          className="glass-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >

          <div
            style={{
              background:
                "rgba(99, 102, 241, 0.2)",

              padding: "1rem",

              borderRadius: "1rem",

              color: "var(--primary)",
            }}
          >
            <Users size={28} />
          </div>

          <div>

            <p
              style={{
                color:
                  "var(--text-muted)",

                fontSize: "0.875rem",
              }}
            >
              Total Users
            </p>

            <h3
              style={{
                fontSize: "1.8rem",
              }}
            >
              {stats.total_users}
            </h3>

          </div>

        </motion.div>

        {/* TOTAL ROOMS */}

        <motion.div
          variants={itemVariants}
          className="glass-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >

          <div
            style={{
              background:
                "rgba(16, 185, 129, 0.2)",

              padding: "1rem",

              borderRadius: "1rem",

              color: "var(--success)",
            }}
          >
            <Server size={28} />
          </div>

          <div>

            <p
              style={{
                color:
                  "var(--text-muted)",

                fontSize: "0.875rem",
              }}
            >
              Total Arenas
            </p>

            <h3
              style={{
                fontSize: "1.8rem",
              }}
            >
              {stats.total_rooms}
            </h3>

          </div>

        </motion.div>

        {/* SUBMISSIONS */}

        <motion.div
          variants={itemVariants}
          className="glass-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >

          <div
            style={{
              background:
                "rgba(244, 63, 94, 0.2)",

              padding: "1rem",

              borderRadius: "1rem",

              color: "var(--accent)",
            }}
          >
            <Activity size={28} />
          </div>

          <div>

            <p
              style={{
                color:
                  "var(--text-muted)",

                fontSize: "0.875rem",
              }}
            >
              Submissions
            </p>

            <h3
              style={{
                fontSize: "1.8rem",
              }}
            >
              {stats.total_submissions}
            </h3>

          </div>

        </motion.div>

        {/* ACTIVE ROOMS */}

        <motion.div
          variants={itemVariants}
          className="glass-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >

          <div
            style={{
              background:
                "rgba(245, 158, 11, 0.2)",

              padding: "1rem",

              borderRadius: "1rem",

              color: "var(--warning)",
            }}
          >
            <ShieldCheck size={28} />
          </div>

          <div>

            <p
              style={{
                color:
                  "var(--text-muted)",

                fontSize: "0.875rem",
              }}
            >
              Active Rooms
            </p>

            <h3
              style={{
                fontSize: "1.8rem",
              }}
            >
              {stats.active_rooms}
            </h3>

          </div>

        </motion.div>

      </div>

      {/* USER TABLE */}

      <motion.div
        variants={itemVariants}
      >

        <div
          style={{
            display: "flex",

            justifyContent:
              "space-between",

            alignItems: "center",

            marginBottom: "1.5rem",

            flexWrap: "wrap",

            gap: "1rem",
          }}
        >

          <h2
            style={{
              fontSize: "1.75rem",

              display: "flex",

              alignItems: "center",

              gap: "0.75rem",
            }}
          >
            <Users
              size={24}
              className="text-primary"
            />
            User Directory
          </h2>

          <div
            style={{
              position: "relative",

              minWidth: "300px",
            }}
          >

            <Search
              style={{
                position: "absolute",

                left: "1rem",

                top: "50%",

                transform:
                  "translateY(-50%)",

                color:
                  "var(--text-muted)",
              }}
              size={18}
            />

            <input
              type="text"
              placeholder="Search by username or email..."
              className="form-input"
              style={{
                paddingLeft: "3rem",
              }}
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        <div
          className="glass-card"
          style={{
            padding: "0",
            overflow: "hidden",
          }}
        >

          <div
            style={{
              overflowX: "auto",
            }}
          >

            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                textAlign: "left",
              }}
            >

              <thead>

                <tr
                  style={{
                    background:
                      "rgba(255,255,255,0.03)",

                    borderBottom:
                      "1px solid rgba(255,255,255,0.05)",
                  }}
                >

                  {[
                    "Username",
                    "Email Address",
                    "Role",
                    "Joined Date",
                    "Status",
                    "Actions",
                  ].map((title) => (

                    <th
                      key={title}
                      style={{
                        padding:
                          "1.25rem 1.5rem",

                        fontSize:
                          "0.875rem",

                        fontWeight:
                          "600",

                        color:
                          "var(--text-muted)",
                      }}
                    >
                      {title}
                    </th>

                  ))}

                </tr>

              </thead>

              <tbody>

                {filteredUsers.length >
                0 ? (

                  filteredUsers.map(
                    (u) => (

                      <tr
                        key={u.id}
                        style={{
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                        }}
                      >

                        {/* USERNAME */}

                        <td
                          style={{
                            padding:
                              "1.25rem 1.5rem",
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",

                              alignItems:
                                "center",

                              gap:
                                "0.75rem",
                            }}
                          >

                            <div
                              style={{
                                width:
                                  "32px",

                                height:
                                  "32px",

                                borderRadius:
                                  "50%",

                                background:
                                  u.role ===
                                  "ADMIN"
                                    ? "var(--warning)"
                                    : "var(--primary)",

                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                justifyContent:
                                  "center",

                                fontSize:
                                  "0.8rem",

                                fontWeight:
                                  "bold",
                              }}
                            >
                              {u.username
                                ? u.username
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()
                                : "?"}
                            </div>

                            <span
                              style={{
                                fontWeight:
                                  "600",
                              }}
                            >
                              {
                                u.username
                              }
                            </span>

                          </div>

                        </td>

                        {/* EMAIL */}

                        <td
                          style={{
                            padding:
                              "1.25rem 1.5rem",
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",

                              alignItems:
                                "center",

                              gap:
                                "0.5rem",

                              color:
                                "var(--text-muted)",
                            }}
                          >

                            <Mail
                              size={
                                14
                              }
                            />

                            {u.email}

                          </div>

                        </td>

                        {/* ROLE */}

                        <td
                          style={{
                            padding:
                              "1.25rem 1.5rem",
                          }}
                        >

                          <span
                            style={{
                              padding:
                                "0.25rem 0.6rem",

                              borderRadius:
                                "0.5rem",

                              fontSize:
                                "0.75rem",

                              fontWeight:
                                "700",

                              background:
                                u.role ===
                                "ADMIN"
                                  ? "rgba(245,158,11,0.1)"
                                  : "rgba(99,102,241,0.1)",

                              color:
                                u.role ===
                                "ADMIN"
                                  ? "var(--warning)"
                                  : "var(--primary)",
                            }}
                          >
                            {u.role}
                          </span>

                        </td>

                        {/* JOINED DATE */}

                        <td
                          style={{
                            padding:
                              "1.25rem 1.5rem",

                            color:
                              "var(--text-muted)",

                            fontSize:
                              "0.875rem",
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",

                              alignItems:
                                "center",

                              gap:
                                "0.5rem",
                            }}
                          >

                            <Calendar
                              size={
                                14
                              }
                            />

                            {new Date(
                              u.date_joined
                            ).toLocaleDateString()}

                          </div>

                        </td>

                        {/* STATUS */}

                        <td
                          style={{
                            padding:
                              "1.25rem 1.5rem",
                          }}
                        >

                          {u.is_blocked ? (

                            <div>

                              <span
                                style={{
                                  color:
                                    "#ef4444",

                                  display:
                                    "flex",

                                  alignItems:
                                    "center",

                                  gap:
                                    "0.4rem",

                                  fontSize:
                                    "0.875rem",

                                  fontWeight:
                                    "600",
                                }}
                              >

                                <div
                                  style={{
                                    width:
                                      "8px",

                                    height:
                                      "8px",

                                    borderRadius:
                                      "50%",

                                    background:
                                      "#ef4444",
                                  }}
                                ></div>

                                Blocked

                              </span>

                              {u.blocked_reason && (

                                <div
                                  style={{
                                    marginTop:
                                      "0.4rem",

                                    fontSize:
                                      "0.75rem",

                                    color:
                                      "#fca5a5",
                                  }}
                                >
                                  Reason:{" "}
                                  {
                                    u.blocked_reason
                                  }
                                </div>

                              )}

                            </div>

                          ) : (

                            <span
                              style={{
                                color:
                                  "var(--success)",

                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                gap:
                                  "0.4rem",

                                fontSize:
                                  "0.875rem",

                                fontWeight:
                                  "600",
                              }}
                            >

                              <div
                                style={{
                                  width:
                                    "8px",

                                  height:
                                    "8px",

                                  borderRadius:
                                    "50%",

                                  background:
                                    "var(--success)",
                                }}
                              ></div>

                              Active

                            </span>

                          )}

                        </td>

                        {/* ACTIONS */}

                        <td
                          style={{
                            padding:
                              "1.25rem 1.5rem",
                          }}
                        >

                          {u.role !==
                            "ADMIN" &&
                            (u.is_blocked ? (

                              <button
                                type="button"
                                disabled={
                                  actionLoading ===
                                  u.id
                                }
                                onClick={() =>
                                  handleUnblockUser(
                                    u.id
                                  )
                                }
                                style={{
                                  background:
                                    "transparent",

                                  border:
                                    "1px solid #22c55e",

                                  color:
                                    "#22c55e",

                                  padding:
                                    "0.45rem 1rem",

                                  borderRadius:
                                    "10px",

                                  cursor:
                                    "pointer",

                                  fontWeight:
                                    "700",

                                  opacity:
                                    actionLoading ===
                                    u.id
                                      ? 0.6
                                      : 1,
                                }}
                              >
                                {actionLoading ===
                                u.id
                                  ? "Processing..."
                                  : "Unblock"}
                              </button>

                            ) : (

                              <button
                                type="button"
                                disabled={
                                  actionLoading ===
                                  u.id
                                }
                                onClick={() =>
                                  handleBlockUser(
                                    u.id
                                  )
                                }
                                style={{
                                  background:
                                    "transparent",

                                  border:
                                    "1px solid #ef4444",

                                  color:
                                    "#ef4444",

                                  padding:
                                    "0.45rem 1rem",

                                  borderRadius:
                                    "10px",

                                  cursor:
                                    "pointer",

                                  fontWeight:
                                    "700",

                                  opacity:
                                    actionLoading ===
                                    u.id
                                      ? 0.6
                                      : 1,
                                }}
                              >
                                {actionLoading ===
                                u.id
                                  ? "Processing..."
                                  : "Block"}
                              </button>

                            ))}

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="6"
                      style={{
                        padding:
                          "3rem",

                        textAlign:
                          "center",

                        color:
                          "var(--text-muted)",
                      }}
                    >
                      No users found matching your search.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </motion.div>

      {/* ERROR */}

      {error && (

        <div
          className="btn btn-danger"
          style={{
            width: "100%",
            marginTop: "2rem",
            cursor: "default",
          }}
        >
          {error}
        </div>

      )}

    </motion.div>
  );
}

export default AdminDashboard;
