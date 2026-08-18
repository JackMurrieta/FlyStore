// src/context/AuthProvider.tsx

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { ReactNode } from "react";

import { api } from "../services/apiClient";

import type { LoginDto, RegisterDto, User, RegisterResult } from "../types";

interface AuthContextType {
  user: User | null;

  isAuthenticated: boolean;

  loading: boolean;

  submitting: boolean;

  error: string;

  registerResult: RegisterResult | null;

  clearError(): void;

  login(dto: LoginDto): Promise<void>;

  register(dto: RegisterDto): Promise<void>;

  loginWithGoogle(): Promise<void>;

  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [registerResult, setRegisterResult] = useState<RegisterResult | null>(
    null,
  );

  useEffect(() => {
    // Verificar sesión actual en el backend
    api.auth.getSession()
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  async function login(dto: LoginDto) {
    setError("");
    setSubmitting(true);

    try {
      const response = await api.auth.login(dto);
      setUser(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
    } finally {
      setSubmitting(false);
    }
  }

  async function register(dto: RegisterDto) {
    setError("");
    setRegisterResult(null);
    setSubmitting(true);

    try {
      const result = await api.auth.register(dto);
      setRegisterResult(result);

      // Si no requiere confirmación, obtener el usuario
      if (result === 'ok') {
        const session = await api.auth.getSession();
        setUser(session.user);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear la cuenta.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function loginWithGoogle() {
    setError("");
    setSubmitting(true);

    try {
      await api.auth.loginWithGoogle();
      // La redirección a Google OAuth ocurre automáticamente
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error con Google.");
      setSubmitting(false);
    }
  }

  async function logout() {
    setError("");
    setSubmitting(true);

    try {
      await api.auth.logout();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cerrar sesión.");
    } finally {
      setSubmitting(false);
    }
  }

  const value = useMemo(
    () => ({
      user,

      isAuthenticated: !!user,

      loading,

      submitting,

      error,

      registerResult,

      clearError: () => setError(""),

      login,

      register,

      loginWithGoogle,

      logout,
    }),
    [user, loading, submitting, error, registerResult],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  }

  return context;
}
