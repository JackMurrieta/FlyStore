import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../services/supabase'
import {
  login as loginService,
  register as registerService,
  loginWithGoogle as loginWithGoogleService,
  logout as logoutService,
  type RegisterResult,
} from '../../services/authService'
import type { LoginDto } from '../../models/DTO/LoginDto'
import type { RegisterDto } from '../../models/DTO/RegisterDto'

export interface AuthUser {
  id: string
  correo: string
  nombre: string
  telefono: string
  direccion: string
}

export function useAuth() {
  const [user, setUser]                         = useState<AuthUser | null>(null)
  const [loading, setLoading]                   = useState(true)
  const [submitting, setSubmitting]             = useState(false)
  const [error, setError]                       = useState('')
  const [registerResult, setRegisterResult]     = useState<RegisterResult | null>(null)

  /* ── Sincroniza sesión de Supabase ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(fromSupabase(session.user))
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? fromSupabase(session.user) : null)
    })

    return () => subscription.unsubscribe()
  }, [])

  /* ── Acciones ── */

  const login = async (dto: LoginDto) => {
    setError('')
    setSubmitting(true)
    try {
      await loginService(dto)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión.')
    } finally {
      setSubmitting(false)
    }
  }

  const register = async (dto: RegisterDto) => {
    setError('')
    setRegisterResult(null)
    setSubmitting(true)
    try {
      const result = await registerService(dto)
      setRegisterResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta.')
    } finally {
      setSubmitting(false)
    }
  }

  const loginWithGoogle = async () => {
    setError('')
    setSubmitting(true)
    try {
      await loginWithGoogleService()
      // loginWithGoogle redirige; setSubmitting(false) solo corre si hay error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con Google.')
      setSubmitting(false)
    }
  }

  const logout = async () => {
    setError('')
    setSubmitting(true)
    try {
      await logoutService()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar sesión.')
    } finally {
      setSubmitting(false)
    }
  }

  return {
    user,
    loading,
    submitting,
    error,
    registerResult,
    clearError: () => setError(''),
    login,
    register,
    loginWithGoogle,
    logout,
  }
}

/* ── Mapea User de Supabase → AuthUser del proyecto ── */
function fromSupabase(user: User): AuthUser {
  return {
    id:        user.id,
    correo:    user.email ?? '',
    nombre:    user.user_metadata?.nombre    ?? '',
    telefono:  user.user_metadata?.telefono  ?? '',
    direccion: user.user_metadata?.direccion ?? '',
  }
}
