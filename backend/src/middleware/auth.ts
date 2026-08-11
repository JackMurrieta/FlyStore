// backend/src/middleware/auth.ts
import { createClient } from '@supabase/supabase-js'
import type { Context, Next } from 'hono'
import type { Env } from '../services/supabase.ts'

export async function requireAuth(c: Context<{ Bindings: Env }>, next: Next) {
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
        return c.json({ error: 'No autenticado' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')

    // Cliente con la anon key, solo para VALIDAR el token del usuario.
    // No es el mismo cliente que hace las escrituras con service_role.
    const supabaseAuth = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY)
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token)

    if (error || !user) {
        return c.json({ error: 'Token invalido' }, 401)
    }

    c.set('userId', user.id) // disponible en las rutas siguientes
    await next()
}