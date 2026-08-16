import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { Env } from '../services/supabase'
import { requireAuth } from '../middleware/auth'
import { getSupabaseAdmin } from '../services/supabase'

const usuario = new Hono<{ Bindings: Env; Variables: { userId: string } }>()

// Todas las rutas de usuario requieren autenticación
usuario.use('/*', requireAuth)

// ============================================
// GET /api/usuario/perfil - Obtener perfil del usuario
// ============================================
usuario.get('/perfil', async (c) => {
  const userId = c.get('userId') // Obtenido del middleware requireAuth
  const supabase = getSupabaseAdmin(c.env)

  const { data: { user }, error } = await supabase.auth.admin.getUserById(userId)

  if (error || !user) {
    return c.json({ error: 'Usuario no encontrado' }, 404)
  }

  return c.json({
    id: user.id,
    email: user.email,
    nombre: user.user_metadata?.nombre || null,
    telefono: user.user_metadata?.telefono || null,
    direccion: user.user_metadata?.direccion || null,
    createdAt: user.created_at
  })
})

// ============================================
// PUT /api/usuario/nombre - Actualizar nombre
// ============================================
const updateNombreSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres')
})

usuario.put('/nombre', zValidator('json', updateNombreSchema), async (c) => {
  const userId = c.get('userId')
  const { nombre } = c.req.valid('json')
  const supabase = getSupabaseAdmin(c.env)

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { nombre }
  })

  if (error) {
    return c.json({ error: 'Error al actualizar nombre' }, 500)
  }

  return c.json({ ok: true, nombre: data.user.user_metadata?.nombre })
})

// ============================================
// PUT /api/usuario/telefono - Actualizar teléfono
// ============================================
const updateTelefonoSchema = z.object({
  telefono: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos')
})

usuario.put('/telefono', zValidator('json', updateTelefonoSchema), async (c) => {
  const userId = c.get('userId')
  const { telefono } = c.req.valid('json')
  const supabase = getSupabaseAdmin(c.env)

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { telefono }
  })

  if (error) {
    return c.json({ error: 'Error al actualizar teléfono' }, 500)
  }

  return c.json({ ok: true, telefono: data.user.user_metadata?.telefono })
})

// ============================================
// PUT /api/usuario/direccion - Actualizar dirección
// ============================================
const updateDireccionSchema = z.object({
  direccion: z.string().min(5, 'La dirección debe tener al menos 5 caracteres')
})

usuario.put('/direccion', zValidator('json', updateDireccionSchema), async (c) => {
  const userId = c.get('userId')
  const { direccion } = c.req.valid('json')
  const supabase = getSupabaseAdmin(c.env)

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { direccion }
  })

  if (error) {
    return c.json({ error: 'Error al actualizar dirección' }, 500)
  }

  return c.json({ ok: true, direccion: data.user.user_metadata?.direccion })
})

export default usuario
