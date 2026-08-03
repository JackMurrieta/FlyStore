import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/auth/useAuth";

import { ROUTES } from "../routes/routes";

export function ProtectedRoute() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return <>Cargando...</>;

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  return <Outlet />;
}
