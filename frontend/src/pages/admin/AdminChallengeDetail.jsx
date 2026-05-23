import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Code,
  Eye,
  EyeOff,
  PlusCircle,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
const AdminChallengeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [testCases, setTestCases] = useState([]);
  const [inputData, setInputData] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  useEffect(() => {
    fetchTestCases();
  }, []);
  const fetchTestCases = async () => {
    try {
      const response = await api.get(`admin/challenges/${id}/testcases/`);
      setTestCases(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  const addTestCase = async () => {
    if (!inputData || !expectedOutput) return;
    try {
      await api.post(`admin/challenges/${id}/add-testcase/`, {
        input_data: inputData,
        expected_output: expectedOutput,
        is_hidden: isHidden,
      });
      setInputData("");
      setExpectedOutput("");
      setIsHidden(false);
      fetchTestCases();
    } catch (error) {
      console.log(error);
    }
  };
  const deleteTestCase = async (testcaseId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this testcase?",
    );
    if (!confirmDelete) return;
    try {
      await api.delete(`admin/testcases/${testcaseId}/`);
      fetchTestCases();
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
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: "1.5rem" }}>
        <button
          onClick={() => navigate("/admin/challenges")}
          className="btn btn-secondary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            fontSize: "0.85rem",
          }}
        >
          <ArrowLeft size={16} /> Back to Challenges
        </button>
      </motion.div>
      <motion.div variants={itemVariants} style={{ marginBottom: "3rem" }}>
        <h1
          className="text-gradient"
          style={{ fontSize: "3rem", marginBottom: "0.5rem" }}
        >
          Configure Testcases
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Establish validation pipelines, configure hidden sandboxes, and audit
          test parameters.
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
            <PlusCircle size={22} className="text-primary" /> Add New Testcase
          </h2>
          <div
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
                Stdin Input Data
              </label>
              <textarea
                placeholder="Arguments, arrays, or text limits expected on stdin..."
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                className="form-input"
                style={{
                  width: "100%",
                  minHeight: "120px",
                  resize: "vertical",
                  fontFamily: "monospace",
                }}
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
                Stdout Expected Output
              </label>
              <textarea
                placeholder="Exact string representation expected on stdout..."
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                className="form-input"
                style={{
                  width: "100%",
                  minHeight: "120px",
                  resize: "vertical",
                  fontFamily: "monospace",
                }}
              />
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.95rem",
              }}
            >
              <input
                type="checkbox"
                checked={isHidden}
                onChange={(e) => setIsHidden(e.target.checked)}
                style={{
                  width: "16px",
                  height: "16px",
                  accentColor: "var(--primary)",
                }}
              />
              <span>Hidden Sandbox Testcase</span>
            </label>
            <button
              onClick={addTestCase}
              className="btn btn-primary"
              style={{
                width: "100%",
                marginTop: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <Code size={18} /> Append Testcase
            </button>
          </div>
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
            <ShieldAlert size={22} className="text-primary" /> Validation
            Sandbox Parameters
          </h2>
          {testCases.length === 0 ? (
            <div
              className="glass-card"
              style={{
                padding: "4rem 2rem",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              No validation testcases are currently bound to this challenge.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {testCases.map((testcase, index) => (
                <div
                  key={testcase.id}
                  className="glass-card"
                  style={{
                    padding: "1.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem",
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
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        fontWeight: "700",
                      }}
                    >
                      TESTCASE #{index + 1}
                    </span>
                    <span
                      style={{
                        background: testcase.is_hidden
                          ? "rgba(245, 158, 11, 0.12)"
                          : "rgba(34, 197, 94, 0.12)",
                        color: testcase.is_hidden
                          ? "var(--warning)"
                          : "var(--success)",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "999px",
                        fontSize: "0.7rem",
                        fontWeight: "800",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      {testcase.is_hidden ? (
                        <EyeOff size={10} />
                      ) : (
                        <Eye size={10} />
                      )}
                      {testcase.is_hidden ? "HIDDEN" : "VISIBLE"}
                    </span>
                  </div>
                  <div>
                    <span
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Input Data
                    </span>
                    <pre
                      style={{
                        margin: 0,
                        padding: "0.75rem",
                        background: "rgba(15, 23, 42, 0.4)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: "8px",
                        fontFamily: "monospace",
                        fontSize: "0.9rem",
                        color: "var(--text-main)",
                        overflowX: "auto",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                      }}
                    >
                      {testcase.input_data}
                    </pre>
                  </div>
                  <div>
                    <span
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Expected Output
                    </span>
                    <pre
                      style={{
                        margin: 0,
                        padding: "0.75rem",
                        background: "rgba(15, 23, 42, 0.4)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: "8px",
                        fontFamily: "monospace",
                        fontSize: "0.9rem",
                        color: "var(--success)",
                        overflowX: "auto",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                      }}
                    >
                      {testcase.expected_output}
                    </pre>
                  </div>
                  <button
                    onClick={() => deleteTestCase(testcase.id)}
                    className="btn btn-secondary"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                      padding: "0.5rem 1rem",
                      fontSize: "0.85rem",
                      borderColor: "rgba(239, 68, 68, 0.25)",
                      color: "var(--accent)",
                      marginTop: "0.5rem",
                    }}
                  >
                    <Trash2 size={14} /> Delete Parameter
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
export default AdminChallengeDetail;
