import { Hono } from 'hono'
import type { Env } from '../../services/supabase'
import { getSupabaseAdmin } from '../../services/supabase'
import { requireAdmin } from '../../middleware/roles'

const adminProductos = new Hono<{ Bindings: Env; Variables: { userId: string; userRole: string } }>()

// Aplicar middleware de admin a todas las rutas
adminProductos.use('*', requireAdmin())

/**
 * POST /api/admin/productos - Crear producto
 */
adminProductos.post('/', async (c) => {
  const supabase = getSupabaseAdmin(c.env)
  const body = await c.req.json()

  const { data, error } = await supabase
    .from('productos')
    .insert(body)
    .select()
    .single()

  if (error) {
    return c.json({ error: 'Error al crear producto', details: error }, 500)
  }

  return c.json({ producto: data }, 201)
})

/**
 * PUT /api/admin/productos/:id - Actualizar producto
 */
adminProductos.put('/:id', async (c) => {
  const supabase = getSupabaseAdmin(c.env)
  const id = c.req.param('id')
  const body = await c.req.json()

  const { data, error } = await supabase
    .from('productos')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return c.json({ error: 'Error al actualizar producto', details: error }, 500)
  }

  return c.json({ producto: data })
})

/**
 * DELETE /api/admin/productos/:id - Eliminar producto
 */
adminProductos.delete('/:id', async (c) => {
  const supabase = getSupabaseAdmin(c.env)
  const id = c.req.param('id')

  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id)

  if (error) {
    return c.json({ error: 'Error al eliminar producto', details: error }, 500)
  }

  return c.json({ ok: true })
})

/**
 * GET /api/admin/productos - Listar todos los productos (incluye inactivos)
 */
adminProductos.get('/', async (c) => {
  const supabase = getSupabaseAdmin(c.env)

  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      marca:marcas(id, nombre, logo_url),
      subcategoria:subcategorias(id, nombre, id_categoria),
      imagenes:productos_imagenes(id, storage_path, alt_text, orden, es_principal),
      variantes:producto_variantes(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return c.json({ error: 'Error al obtener productos', details: error }, 500)
  }

  return c.json({ productos: data })
})

/**
 * GET /api/admin/productos/:id - Obtener un producto por ID
 */
adminProductos.get('/:id', async (c) => {
  const supabase = getSupabaseAdmin(c.env)
  const id = c.req.param('id')

  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      marca:marcas(id, nombre, logo_url),
      subcategoria:subcategorias(id, nombre, id_categoria),
      imagenes:productos_imagenes(id, storage_path, alt_text, orden, es_principal),
      variantes:producto_variantes(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return c.json({ error: 'Producto no encontrado', details: error }, 404)
  }

  return c.json({ producto: data })
})

export default adminProductos
