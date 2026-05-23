import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "60vh" }}>
        <div className="loader">Verifying Permissions...</div>
      </div>
    );
  }
  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/dashboard" />;
  }
  return children;
}
export default AdminRoute;
