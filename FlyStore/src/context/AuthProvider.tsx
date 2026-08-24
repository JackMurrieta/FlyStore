// src/context/AuthProvider.tsx

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { ReactNode } from "react";

import { api } from "../services/apiClient";

import type { LoginDto, RegisterDto, User, RegisterResult } from "../types";
import { isProfileComplete } from "../types";

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

  const navigate = useNavigate();

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
      console.log('[AuthProvider] Iniciando login...');
      const response = await api.auth.login(dto);
      console.log('[AuthProvider] Login exitoso, usuario:', response.user.email);
      setUser(response.user);

      // Redirigir según el estado del perfil
      const profileComplete = isProfileComplete(response.user);
      console.log('[AuthProvider] Perfil completo:', profileComplete);

      // Usar setTimeout para asegurar que la redirección ocurra después de actualizar el estado
      setTimeout(() => {
        if (!profileComplete) {
          console.log('[AuthProvider] Navegando a /cuenta (perfil incompleto)');
          navigate('/cuenta', { replace: true });
        } else {
          console.log('[AuthProvider] Navegando a / (perfil completo)');
          navigate('/', { replace: true });
        }
      }, 100);
    } catch (err) {
      console.error('[AuthProvider] Error en login:', err);
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
      console.log('[AuthProvider] Iniciando registro...');
      const result = await api.auth.register(dto);
      setRegisterResult(result);

      // Si no requiere confirmación, obtener el usuario
      if (result === 'ok') {
        console.log('[AuthProvider] Registro exitoso, obteniendo sesión...');
        const session = await api.auth.getSession();
        if (session.user) {
          console.log('[AuthProvider] Sesión obtenida, usuario:', session.user.email);
          setUser(session.user);

          // Redirigir según el estado del perfil
          const profileComplete = isProfileComplete(session.user);
          console.log('[AuthProvider] Perfil completo:', profileComplete);

          // Usar setTimeout para asegurar que la redirección ocurra después de actualizar el estado
          setTimeout(() => {
            if (!profileComplete) {
              console.log('[AuthProvider] Navegando a /cuenta (perfil incompleto)');
              navigate('/cuenta', { replace: true });
            } else {
              console.log('[AuthProvider] Navegando a / (perfil completo)');
              navigate('/', { replace: true });
            }
          }, 100);
        }
      } else {
        console.log('[AuthProvider] Registro requiere confirmación de email');
      }
    } catch (err) {
      console.error('[AuthProvider] Error en registro:', err);
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
      // Cuando regrese de Google, la sesión se verificará en el useEffect
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
      navigate('/', { replace: true }); // Redirigir a la página de inicio
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
