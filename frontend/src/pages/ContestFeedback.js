import { useEffect, useState } from "react";
import api from "../api/axios";

const ContestFeedback = ({ roomId }) => {

  const [feedback, setFeedback] =
    useState("");

  useEffect(() => {

    fetchFeedback();

  }, []);

  const fetchFeedback = async () => {

    try {

      const response =
        await api.get(
          `/api/ai/feedback/${roomId}/`
        );

      setFeedback(
        response.data.feedback
      );

    } catch (err) {

      console.log(err);
    }
  };

  return (
    <div>
      <h2>AI Contest Feedback</h2>

      <p>{feedback}</p>
    </div>
  );
};

export default ContestFeedback;