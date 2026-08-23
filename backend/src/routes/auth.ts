import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { Env } from '../services/supabase'
import { getSupabaseAdmin } from '../services/supabase'
import { createSessionCookie, clearSessionCookie } from '../utils/cookies'

const auth = new Hono<{ Bindings: Env }>()

// ============================================
// Esquemas de validación con Zod
// ============================================

const loginSchema = z.object({
  correo: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password requerido')
})

const registerSchema = z.object({
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  correo: z.string().email('Email inválido'),
  password: z.string().min(6, 'Password debe tener al menos 6 caracteres')
})

// ============================================
// POST /api/auth/login - Email/Password
// ============================================
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { correo, password } = c.req.valid('json')
  const supabase = getSupabaseAdmin(c.env)

  // Autenticar con Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: password
  })

  if (error || !data.session || !data.user) {
    return c.json({ error: mapAuthError(error?.message || 'Error de autenticación') }, 401)
  }

  // Crear cookie HTTP-only con los tokens
  const cookie = createSessionCookie(data.session.access_token, data.session.refresh_token)

  return c.json(
    {
      ok: true,
      session: {
        expiresAt: data.session.expires_at,
        expiresIn: data.session.expires_in
      },
      user: {
        id: data.user.id,
        email: data.user.email,
        nombre: data.user.user_metadata?.nombre || null,
        telefono: data.user.user_metadata?.telefono || null,
        direccion: data.user.user_metadata?.direccion || null
      }
    },
    {
      headers: {
        'Set-Cookie': cookie
      }
    }
  )
})

// ============================================
// POST /api/auth/register - Registro
// ============================================
auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const { nombre, telefono, direccion, correo, password } = c.req.valid('json')
  const supabase = getSupabaseAdmin(c.env)

  // Registrar usuario en Supabase
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password: password,
    options: {
      data: { nombre, telefono, direccion },
      emailRedirectTo: `${c.req.header('Origin') || 'http://localhost:5173'}/auth/callback`
    }
  })

  if (error || !data.user) {
    return c.json({ error: mapAuthError(error?.message || 'Error al registrarse') }, 400)
  }

  // Verificar que el email no esté ya registrado
  if (data.user.identities?.length === 0) {
    return c.json({ error: 'Este correo ya está registrado' }, 400)
  }

  // Si Supabase requiere confirmación de email, no habrá sesión
  if (!data.session) {
    return c.json({
      ok: true,
      requiresEmailConfirmation: true,
      message: 'Revisa tu correo para confirmar tu cuenta'
    })
  }

  // Si hay sesión inmediata, crear cookie
  const cookie = createSessionCookie(data.session.access_token, data.session.refresh_token)

  return c.json(
    {
      ok: true,
      requiresEmailConfirmation: false,
      session: {
        expiresAt: data.session.expires_at,
        expiresIn: data.session.expires_in
      },
      user: {
        id: data.user.id,
        email: data.user.email,
        nombre: data.user.user_metadata?.nombre || null,
        telefono: data.user.user_metadata?.telefono || null,
        direccion: data.user.user_metadata?.direccion || null
      }
    },
    {
      headers: {
        'Set-Cookie': cookie
      }
    }
  )
})

// ============================================
// GET /api/auth/confirm - Confirmar email (callback de Supabase)
// ============================================
auth.get('/confirm', async (c) => {
  const tokenHash = c.req.query('token_hash')
  const type = c.req.query('type')

  if (!tokenHash || type !== 'email') {
    return c.json({ error: 'Token de confirmación inválido' }, 400)
  }

  const supabase = getSupabaseAdmin(c.env)

  // Verificar el token de confirmación
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'email'
  })

  if (error || !data.session || !data.user) {
    return c.json({ error: 'No se pudo confirmar el correo' }, 400)
  }

  // Crear cookie con la sesión
  const cookie = createSessionCookie(data.session.access_token, data.session.refresh_token)

  return c.json(
    {
      ok: true,
      session: {
        expiresAt: data.session.expires_at,
        expiresIn: data.session.expires_in
      },
      user: {
        id: data.user.id,
        email: data.user.email,
        nombre: data.user.user_metadata?.nombre || null,
        telefono: data.user.user_metadata?.telefono || null,
        direccion: data.user.user_metadata?.direccion || null
      }
    },
    {
      headers: {
        'Set-Cookie': cookie
      }
    }
  )
})

// ============================================
// POST /api/auth/exchange-token - Intercambiar tokens de URL por cookie
// ============================================
const exchangeTokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string()
})

auth.post('/exchange-token', zValidator('json', exchangeTokenSchema), async (c) => {
  const { access_token, refresh_token } = c.req.valid('json')
  const supabase = getSupabaseAdmin(c.env)

  // Verificar que el access token sea válido
  const { data: { user }, error } = await supabase.auth.getUser(access_token)

  if (error || !user) {
    return c.json({ error: 'Token inválido' }, 401)
  }

  // Crear cookie HTTP-only
  const cookie = createSessionCookie(access_token, refresh_token)

  // Obtener información de expiración
  const tokenExpiration = getTokenExpiration(access_token)

  return c.json(
    {
      ok: true,
      session: tokenExpiration ? {
        expiresAt: tokenExpiration.expiresAt,
        expiresIn: tokenExpiration.expiresIn
      } : null,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.user_metadata?.nombre || null,
        telefono: user.user_metadata?.telefono || null,
        direccion: user.user_metadata?.direccion || null
      }
    },
    {
      headers: {
        'Set-Cookie': cookie
      }
    }
  )
})

// ============================================
// POST /api/auth/resend-confirmation - Reenviar email de confirmación
// ============================================
const resendSchema = z.object({
  correo: z.string().email('Email inválido')
})

auth.post('/resend-confirmation', zValidator('json', resendSchema), async (c) => {
  const { correo } = c.req.valid('json')
  const supabase = getSupabaseAdmin(c.env)

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: correo,
    options: {
      emailRedirectTo: `${c.req.header('Origin') || 'http://localhost:5173'}/auth/callback`
    }
  })

  if (error) {
    return c.json({ error: mapAuthError(error.message) }, 400)
  }

  return c.json({
    ok: true,
    message: 'Email de confirmación reenviado. Revisa tu correo.'
  })
})

// ============================================
// POST /api/auth/google - OAuth Google
// ============================================
auth.post('/google', async (c) => {
  const supabase = getSupabaseAdmin(c.env)

  // Generar URL de OAuth
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${c.req.header('Origin') || 'http://localhost:5173'}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })

  if (error) {
    return c.json({ error: mapAuthError(error.message) }, 400)
  }

  return c.json({ url: data.url })
})

// ============================================
// POST /api/auth/refresh - Refrescar token
// ============================================
auth.post('/refresh', async (c) => {
  const supabase = getSupabaseAdmin(c.env)
  const cookieHeader = c.req.header('Cookie')

  // Extraer refresh token de la cookie
  const sessionMatch = cookieHeader?.match(/flystore_session=([^;]+)/)
  if (!sessionMatch) {
    return c.json({ error: 'No hay sesión activa' }, 401)
  }

  try {
    const sessionData = JSON.parse(decodeURIComponent(sessionMatch[1]))
    const { refreshToken } = sessionData

    if (!refreshToken) {
      return c.json({ error: 'Token de refresco no encontrado' }, 401)
    }

    // Refrescar sesión con Supabase
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    })

    if (error || !data.session || !data.user) {
      return c.json({ error: 'Sesión expirada' }, 401)
    }

    // Crear nueva cookie con tokens actualizados
    const cookie = createSessionCookie(data.session.access_token, data.session.refresh_token)

    return c.json(
      {
        ok: true,
        session: {
          expiresAt: data.session.expires_at,
          expiresIn: data.session.expires_in
        },
        user: {
          id: data.user.id,
          email: data.user.email,
          nombre: data.user.user_metadata?.nombre || null,
          telefono: data.user.user_metadata?.telefono || null,
          direccion: data.user.user_metadata?.direccion || null
        }
      },
      {
        headers: {
          'Set-Cookie': cookie
        }
      }
    )
  } catch {
    return c.json({ error: 'Cookie inválida' }, 401)
  }
})

// ============================================
// POST /api/auth/logout - Cerrar sesión
// ============================================
auth.post('/logout', async (c) => {
  const supabase = getSupabaseAdmin(c.env)
  const cookieHeader = c.req.header('Cookie')

  // Extraer access token de la cookie
  const sessionMatch = cookieHeader?.match(/flystore_session=([^;]+)/)
  if (sessionMatch) {
    try {
      const sessionData = JSON.parse(decodeURIComponent(sessionMatch[1]))
      const { accessToken } = sessionData

      // Invalidar sesión en Supabase
      await supabase.auth.admin.signOut(accessToken)
    } catch {
      // Ignorar errores de invalidación
    }
  }

  // Limpiar cookie
  const cookie = clearSessionCookie()

  return c.json(
    { ok: true },
    {
      headers: {
        'Set-Cookie': cookie
      }
    }
  )
})

// ============================================
// GET /api/auth/session - Obtener sesión actual
// ============================================
auth.get('/session', async (c) => {
  const supabase = getSupabaseAdmin(c.env)
  const cookieHeader = c.req.header('Cookie')

  const sessionMatch = cookieHeader?.match(/flystore_session=([^;]+)/)
  if (!sessionMatch) {
    return c.json({ user: null })
  }

  try {
    const sessionData = JSON.parse(decodeURIComponent(sessionMatch[1]))
    const { accessToken } = sessionData

    // Verificar token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return c.json({ user: null })
    }

    // Obtener información de expiración del token
    const tokenExpiration = getTokenExpiration(accessToken)

    return c.json({
      session: tokenExpiration ? {
        expiresAt: tokenExpiration.expiresAt,
        expiresIn: tokenExpiration.expiresIn
      } : null,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.user_metadata?.nombre || null,
        telefono: user.user_metadata?.telefono || null,
        direccion: user.user_metadata?.direccion || null
      }
    })
  } catch {
    return c.json({ user: null })
  }
})

// ============================================
// Utilidades
// ============================================

/**
 * Decodifica un JWT y extrae la fecha de expiración
 */
function getTokenExpiration(token: string): { expiresAt: number; expiresIn: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    const expiresAt = payload.exp
    const now = Math.floor(Date.now() / 1000)
    const expiresIn = expiresAt - now

    return { expiresAt, expiresIn }
  } catch {
    return null
  }
}

// ============================================
// Mapeo de errores de Supabase
// ============================================
function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos'
  if (message.includes('Email not confirmed')) return 'Confirma tu correo antes de iniciar sesión'
  if (message.includes('User already registered')) return 'Este correo ya está registrado'
  if (message.includes('Password should be')) return 'La contraseña no cumple con los requisitos de seguridad'
  if (message.includes('Signup requires a valid password')) return 'La contraseña es requerida'
  if (message.includes('Unable to validate email')) return 'El formato del correo no es válido'
  if (message.includes('For security purposes')) return 'Demasiados intentos. Espera unos segundos'
  if (message.includes('Email rate limit exceeded')) return 'Demasiados intentos. Espera unos minutos'
  if (message.includes('provider is not enabled')) return 'El inicio de sesión con Google no está habilitado'

  return 'Ocurrió un error inesperado. Intenta de nuevo'
}

export default auth
