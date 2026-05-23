import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div
        className="flex-center"
        style={{ height: "100vh", flexDirection: "column", gap: "1rem" }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid rgba(99, 102, 241, 0.1)",
            borderTopColor: "var(--primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.875rem",
            fontWeight: "500",
          }}
        >
          Synchronizing Arena Data...
        </p>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
export default ProtectedRoute;
