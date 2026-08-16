import type { Context, Next } from 'hono'
import type { Env } from '../services/supabase'
import { getSupabaseAdmin } from '../services/supabase'
import { getSessionFromCookie } from '../utils/cookies'

/**
 * Middleware de autenticación basado en cookies HTTP-only
 * Extrae el JWT de la cookie y valida con Supabase
 * Adjunta userId al contexto para usarlo en las rutas
 */
export async function requireAuth(c: Context<{ Bindings: Env; Variables: { userId: string } }>, next: Next) {
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

    // Adjuntar userId al contexto para las rutas protegidas
    c.set('userId', user.id)
    await next()
}