import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";



// Prevent ResizeObserver loop limit exceeded error from crashing the app in development
const preventResizeObserverError = (e) => {
  if (
    e.message === "ResizeObserver loop limit exceeded" ||
    e.message === "ResizeObserver loop completed with undelivered notifications."
  ) {
    e.stopImmediatePropagation();
    const resizeObserverErrDiv = document.getElementById(
      "webpack-dev-server-client-overlay-div"
    );
    const resizeObserverErr = document.getElementById(
      "webpack-dev-server-client-overlay"
    );
    if (resizeObserverErr) resizeObserverErr.style.display = "none";
    if (resizeObserverErrDiv) resizeObserverErrDiv.style.display = "none";
  }
};

window.addEventListener("error", preventResizeObserverError);
window.addEventListener("unhandledrejection", preventResizeObserverError);


ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </GoogleOAuthProvider>
);