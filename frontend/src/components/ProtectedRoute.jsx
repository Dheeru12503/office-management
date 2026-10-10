import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loadingScreen">
      <div className="spinner" />
      <span className="loadingText">Authenticating…</span>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role)
    return <Navigate to={user.role === "EMPLOYER" ? "/employer" : "/employee"} replace />;
  return children;
}
