import {
  useEffect,
  useRef,
  useContext,
} from "react";

import api from "../api/axios";

import { AuthContext } from "../context/AuthContext";

const useFocusTracking = (
  roomCode,
  setTabWarnings,
  setShowTabWarning
) => {

  const { user } =
    useContext(AuthContext);

  const lastViolationRef =
    useRef(0);

  useEffect(() => {

    // =========================
    // DISABLE TRACKING FOR ADMINS
    // =========================

    if (user?.role === "ADMIN") {
      return;
    }

    const sendViolation = async (
      type
    ) => {

      const now = Date.now();

      // Prevent spam requests
      if (
        now -
          lastViolationRef.current <
        3000
      ) {
        return;
      }

      lastViolationRef.current =
        now;

      try {

        const response =
          await api.post(
            "/rooms/focus/track/",
            {
              room_code: roomCode,
              violation_type: type,
            }
          );

        setTabWarnings(
          response.data.warning_count
        );

        setShowTabWarning(true);

        setTimeout(() => {

          setShowTabWarning(false);

        }, 3000);

      } catch (err) {

        console.log(err);
      }
    };

    // =========================
    // TAB SWITCH DETECTION
    // =========================

    const handleVisibilityChange =
      () => {

        if (document.hidden) {

          sendViolation(
            "TAB_SWITCH"
          );
        }
      };

    // =========================
    // WINDOW BLUR DETECTION
    // =========================

    const handleWindowBlur = () => {

      sendViolation(
        "WINDOW_BLUR"
      );
    };

    // =========================
    // FULLSCREEN EXIT DETECTION
    // =========================

    const handleFullscreenChange =
      () => {

        if (
          !document.fullscreenElement
        ) {

          sendViolation(
            "FULLSCREEN_EXIT"
          );
        }
      };

    // =========================
    // ENTER FULLSCREEN
    // =========================

    const enterFullscreen =
      async () => {

        try {

          if (
            !document.fullscreenElement
          ) {

            await document.documentElement.requestFullscreen();
          }

        } catch (err) {

          console.log(err);
        }
      };

    enterFullscreen();

    // =========================
    // EVENT LISTENERS
    // =========================

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "blur",
      handleWindowBlur
    );

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    // =========================
    // CLEANUP
    // =========================

    return () => {

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "blur",
        handleWindowBlur
      );

      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };

  }, [
    roomCode,
    user,
    setTabWarnings,
    setShowTabWarning,
  ]);

};

export default useFocusTracking;