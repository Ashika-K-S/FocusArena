import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const ContestFeedback = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, [roomId]);

  const fetchFeedback = async () => {
    try {
      const response = await api.get(
        `/ai/feedback/${roomId}/`
      );

      setFeedback(response.data.feedback);
    } catch (error) {
      console.error(error);
      setFeedback("No AI feedback available.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
        }}
      >
        Loading AI Feedback...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "800",
          marginBottom: "1.5rem",
        }}
      >
        AI Contest Performance Analysis
      </h1>

      <div
        style={{
          padding: "1.5rem",
          borderRadius: "1rem",
          background: "rgba(255,255,255,0.05)",
          whiteSpace: "pre-wrap",
          lineHeight: "1.8",
        }}
      >
        {feedback}
      </div>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: "1.5rem",
          padding: "0.9rem 1.5rem",
          border: "none",
          borderRadius: "0.8rem",
          cursor: "pointer",
        }}
      >
        Back To Dashboard
      </button>
    </div>
  );
};

export default ContestFeedback;