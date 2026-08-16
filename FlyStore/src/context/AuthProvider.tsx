// src/context/AuthProvider.tsx

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "../services/supabase";

import {
  login as loginService,
  register as registerService,
  loginWithGoogle as loginWithGoogleService,
  logout as logoutService,
  type RegisterResult,
} from "../services/authService";

import type { LoginDto } from "../models/DTO/auth/LoginDto";
import type { RegisterDto } from "../models/DTO/auth/RegisterDto";

export interface AuthUser {
  id: string;
  correo: string;
  nombre: string;
  telefono: string;
  direccion: string;
}

interface AuthContextType {
  user: AuthUser | null;

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
  const [user, setUser] = useState<AuthUser | null>(null);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [registerResult, setRegisterResult] = useState<RegisterResult | null>(
    null,
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ? fromSupabase(data.session.user) : null);

      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? fromSupabase(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(dto: LoginDto) {
    setError("");
    setSubmitting(true);

    try {
      await loginService(dto);
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
      const result = await registerService(dto);

      setRegisterResult(result);
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
      await loginWithGoogleService();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error con Google.");

      setSubmitting(false);
    }
  }

  async function logout() {
    setError("");
    setSubmitting(true);

    try {
      await logoutService();
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

function fromSupabase(user: User): AuthUser {
  return {
    id: user.id,

    correo: user.email ?? "",

    nombre: user.user_metadata?.nombre ?? "",

    telefono: user.user_metadata?.telefono ?? "",

    direccion: user.user_metadata?.direccion ?? "",
  };
}
