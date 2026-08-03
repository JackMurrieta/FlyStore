// hooks/auth/useAuth.ts

import { useAuthContext } from "../../context/AuthProvider";

export function useAuth() {
  return useAuthContext();
}