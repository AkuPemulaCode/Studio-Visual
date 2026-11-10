import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { getHomePath } from "../utils/auth";

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireStaff = false,
}) {
  const { user, isAuthenticated, isAdmin, isWorker } = useAuth();
  const location = useLocation();
  const home = getHomePath(user?.role);

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/masuk" state={{ from }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to={home} replace />;
  }

  if (requireStaff && !isAdmin && !isWorker) {
    return <Navigate to={home} replace />;
  }

  return children;
}
