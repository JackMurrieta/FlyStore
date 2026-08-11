import { supabase } from './supabase'
import type { AuthError } from '@supabase/supabase-js'
import type { LoginDto } from '../models/DTO/LoginDto'
import type { RegisterDto } from '../models/DTO/RegisterDto'

/**
 * 'ok'            → sesión activa de inmediato
 * 'confirm_email' → Supabase envió correo de confirmación, sin sesión aún
 */
export type RegisterResult = 'ok' | 'confirm_email'

/* ════════════════════════════════
   Email / pin
════════════════════════════════ */

export async function login({ correo, password }: LoginDto): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: password,
  })
  if (error) throw new Error(mapError(error))
}

export async function register({ nombre, telefono, direccion, correo, password }: RegisterDto): Promise<RegisterResult> {
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password: password,
    options: {
      data: { nombre, telefono, direccion },
    },
  })

  if (error) throw new Error(mapError(error))

  /*
   * Supabase no lanza error cuando el correo ya existe y está sin confirmar.
   * Devuelve un usuario con identities vacíos como medida de seguridad.
   */
  if (data.user?.identities?.length === 0) {
    throw new Error('Este correo ya está registrado.')
  }

  return data.session ? 'ok' : 'confirm_email'
}

/* ════════════════════════════════
   OAuth — Google
════════════════════════════════ */

export async function loginWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  if (error) throw new Error(mapError(error))
}

/* ════════════════════════════════
   Cerrar sesión
════════════════════════════════ */

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(mapError(error))
}

/* ════════════════════════════════
   Mapeo de errores de Supabase
════════════════════════════════ */

function mapError(error: AuthError): string {
  const code = (error as AuthError & { code?: string }).code

  switch (code) {
    case 'invalid_credentials': return 'Correo o contraseña incorrectos.'
    case 'email_not_confirmed': return 'Confirma tu correo antes de iniciar sesión.'
    case 'user_already_exists': return 'Este correo ya está registrado.'
    case 'weak_password': return 'La contraseña no cumple con los requisitos de seguridad.'
    case 'email_address_not_authorized': return 'Este correo no está autorizado.'
    case 'over_email_send_rate_limit': return 'Demasiados correos enviados. Intenta más tarde.'
    case 'over_request_rate_limit': return 'Demasiados intentos. Espera unos segundos.'
    case 'provider_disabled': return 'El inicio de sesión con Google no está habilitado.'
    case 'session_not_found': return 'La sesión expiró. Inicia sesión nuevamente.'
    case 'user_not_found': return 'No existe una cuenta con este correo.'
    case 'same_password': return 'La contraseña nueva debe ser diferente a la actual.'
    case 'flow_state_expired': return 'El enlace expiró. Solicita uno nuevo.'
  }

  const msg = error.message
  if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (msg.includes('Email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.'
  if (msg.includes('User already registered')) return 'Este correo ya está registrado.'
  if (msg.includes('Password should be')) return 'La contraseña no cumple con los requisitos de seguridad.'
  if (msg.includes('Signup requires a valid password')) return 'La contraseña es requerida.'
  if (msg.includes('Unable to validate email')) return 'El formato del correo no es válido.'
  if (msg.includes('For security purposes')) return 'Demasiados intentos. Espera unos segundos.'
  if (msg.includes('Email rate limit exceeded')) return 'Demasiados intentos. Espera unos minutos.'
  if (msg.includes('provider is not enabled')) return 'El inicio de sesión con Google no está habilitado.'

  return 'Ocurrió un error inesperado. Intenta de nuevo.'
}
