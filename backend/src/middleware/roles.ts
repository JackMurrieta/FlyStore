import type { Context, Next } from 'hono'
import type { Env } from '../services/supabase'
import { getSupabaseAdmin } from '../services/supabase'
import { getSessionFromCookie } from '../utils/cookies'

/**
 * Middleware que requiere autenticación y un rol específico
 * Adjunta userId y userRole al contexto
 */
export async function requireRole(allowedRoles: string[]) {
  return async (c: Context<{ Bindings: Env; Variables: { userId: string; userRole: string } }>, next: Next) => {
    const cookieHeader = c.req.header('Cookie')
    const session = getSessionFromCookie(cookieHeader)

    if (!session) {
      return c.json({ error: 'No autenticado. Inicia sesión.' }, 401)
    }

    const supabase = getSupabaseAdmin(c.env)

    // Validar el access token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(session.accessToken)

    if (error || !user) {
      return c.json({ error: 'Sesión inválida o expirada' }, 401)
    }

    // Obtener el rol del usuario desde la tabla usuarios
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (usuarioError || !usuario) {
      return c.json({ error: 'Usuario no encontrado' }, 404)
    }

    // Verificar si el rol del usuario está en los roles permitidos
    if (!allowedRoles.includes(usuario.rol)) {
      return c.json({
        error: 'No tienes permisos para acceder a este recurso',
        requiredRole: allowedRoles,
        yourRole: usuario.rol
      }, 403)
    }

    // Adjuntar userId y rol al contexto
    c.set('userId', user.id)
    c.set('userRole', usuario.rol)
    await next()
  }
}

/**
 * Middleware que solo requiere admin
 */
export function requireAdmin() {
  return requireRole(['admin'])
}

/**
 * Middleware que acepta admin o cliente
 */
export function requireAuthenticatedUser() {
  return requireRole(['admin', 'cliente'])
}
