import { Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";

/**
 * Wrapper que provee contextos a toda la aplicación
 * Debe estar DENTRO del Router para poder usar hooks de navegación
 */
export function AppWithProviders() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
