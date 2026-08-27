import { Hono } from 'hono'
import type { Env } from '../../services/supabase'
import { getSupabaseAdmin } from '../../services/supabase'

const publicProductos = new Hono<{ Bindings: Env }>()

/**
 * GET /api/public/productos - Listar productos activos (catálogo público)
 */
publicProductos.get('/', async (c) => {
  const supabase = getSupabaseAdmin(c.env)

  // Parámetros de filtrado
  const categoria = c.req.query('categoria')
  const subcategoria = c.req.query('subcategoria')
  const marca = c.req.query('marca')
  const destacados = c.req.query('destacados') === 'true'
  const limit = parseInt(c.req.query('limit') || '50')
  const offset = parseInt(c.req.query('offset') || '0')

  let query = supabase
    .from('productos')
    .select(`
      id,
      nombre,
      slug,
      descripcion,
      precio_base,
      precio_mayoreo,
      destacado,
      marca:marcas!inner(id, nombre, logo_url),
      subcategoria:subcategorias!inner(id, nombre, id_categoria),
      imagenes:productos_imagenes(id, storage_path, alt_text, orden, es_principal),
      variantes:producto_variantes!inner(id, talla, color, stock)
    `, { count: 'exact' })
    .eq('activo', true) // Solo productos activos

  // Filtros opcionales
  if (categoria) {
    query = query.eq('subcategorias.id_categoria', categoria)
  }

  if (subcategoria) {
    query = query.eq('id_subcategoria', subcategoria)
  }

  if (marca) {
    query = query.eq('id_marca', marca)
  }

  if (destacados) {
    query = query.eq('destacado', true)
  }

  // Paginación
  query = query
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  const { data, error, count } = await query

  if (error) {
    return c.json({ error: 'Error al obtener productos', details: error }, 500)
  }

  return c.json({
    productos: data,
    total: count,
    limit,
    offset
  })
})

/**
 * GET /api/public/productos/destacados - Productos destacados
 * IMPORTANTE: Esta ruta debe ir ANTES de /:slug para evitar que "destacados" sea interpretado como slug
 */
publicProductos.get('/destacados', async (c) => {
  const supabase = getSupabaseAdmin(c.env)
  const limit = parseInt(c.req.query('limit') || '10')

  const { data, error } = await supabase
    .from('productos')
    .select(`
      id,
      nombre,
      slug,
      descripcion,
      precio_base,
      marca:marcas(id, nombre, logo_url),
      imagenes:productos_imagenes(id, storage_path, alt_text, es_principal)
    `)
    .eq('activo', true)
    .eq('destacado', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return c.json({ error: 'Error al obtener productos destacados', details: error }, 500)
  }

  return c.json({ productos: data })
})

/**
 * GET /api/public/productos/:slug - Obtener producto por slug
 * IMPORTANTE: Esta ruta debe ir DESPUÉS de rutas específicas como /destacados
 */
publicProductos.get('/:slug', async (c) => {
  const supabase = getSupabaseAdmin(c.env)
  const slug = c.req.param('slug')

  const { data, error } = await supabase
    .from('productos')
    .select(`
      id,
      nombre,
      slug,
      descripcion,
      precio_base,
      precio_mayoreo,
      min_mayoreo,
      destacado,
      marca:marcas(id, nombre, logo_url),
      subcategoria:subcategorias(id, nombre, id_categoria),
      imagenes:productos_imagenes(id, storage_path, alt_text, orden, es_principal),
      variantes:producto_variantes(id, sku, talla, color, color_hex, precio_extra, stock, activo, id_imagen)
    `)
    .eq('slug', slug)
    .eq('activo', true)
    .single()

  if (error) {
    return c.json({ error: 'Producto no encontrado' }, 404)
  }

  return c.json({ producto: data })
})

export default publicProductos
