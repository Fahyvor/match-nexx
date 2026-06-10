import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import type { RootState } from "../redux/store";

const ProtectedRoute = ({ role }: { role?: string }) => {
  const user = useSelector((state: RootState) => state.user.user);
  const token = useSelector((state: RootState) => state.user.token);

  const isAuthenticated = !!token;
  const userRole = user?.role;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return <div>You don't have permission to access this route.</div>;
  }

  return <Outlet />;
};

export default ProtectedRoute;