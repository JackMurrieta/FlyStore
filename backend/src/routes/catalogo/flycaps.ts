import { Hono } from 'hono'
import type { Env } from '../../services/supabase'
import { getSupabaseAdmin } from '../../services/supabase'

const flycaps = new Hono<{ Bindings: Env }>()

/**
 * Normaliza un string para comparación (minúsculas, sin espacios, sin guiones)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[\s\-_&]/g, '') // quita espacios, guiones, guiones bajos y &
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
}

/**
 * Busca la marca que mejor coincida con el nombre de la carpeta o producto
 */
function findMatchingMarca(name: string, marcas: any[]): any | null {
  const normalizedName = normalizeString(name)

  // Buscar coincidencia exacta primero
  let bestMatch = marcas.find(marca =>
    normalizeString(marca.nombre) === normalizedName
  )

  if (bestMatch) return bestMatch

  // Buscar coincidencia parcial (nombre de marca contenido en el nombre)
  bestMatch = marcas.find(marca => {
    const normalizedMarca = normalizeString(marca.nombre)
    return normalizedName.includes(normalizedMarca) || normalizedMarca.includes(normalizedName)
  })

  return bestMatch || null
}

/**
 * Detecta la marca de un producto individual
 * Primero intenta con el nombre del producto, luego con el nombre del drop
 */
function detectMarcaProducto(productName: string, dropName: string, marcas: any[]): any | null {
  // Primero intentar detectar desde el nombre del producto
  const marcaFromProduct = findMatchingMarca(productName, marcas)
  if (marcaFromProduct) {
    return marcaFromProduct
  }

  // Si no se encuentra, intentar desde el nombre del drop
  const marcaFromDrop = findMatchingMarca(dropName, marcas)
  return marcaFromDrop
}

/**
 * Endpoint para obtener marcas y categorías disponibles en la BD
 * GET /api/catalogo/flycaps/metadata
 */
flycaps.get('/metadata', async (c) => {
  try {
    const supabase = getSupabaseAdmin(c.env)

    // Obtener marcas activas
    const { data: marcas, error: marcasError } = await supabase
      .from('marcas')
      .select('id, nombre, logo_url')
      .eq('activo', true)
      .order('nombre')

    if (marcasError) {
      return c.json({ error: 'Error al obtener marcas', details: marcasError }, 500)
    }

    // Obtener categorías activas con subcategorías
    const { data: categorias, error: categoriasError } = await supabase
      .from('categorias')
      .select(`
        id,
        nombre,
        subcategorias(id, nombre, descripcion)
      `)
      .eq('activo', true)
      .order('orden')

    if (categoriasError) {
      return c.json({ error: 'Error al obtener categorías', details: categoriasError }, 500)
    }

    return c.json({
      marcas: marcas || [],
      categorias: categorias || []
    })

  } catch (error) {
    return c.json({ error: 'Error al obtener metadata', details: error }, 500)
  }
})

/**
 * Endpoint para sincronizar productos de flycaps desde el storage
 * POST /api/catalogo/flycaps/sync
 *
 * Body (opcional):
 * {
 *   "carpeta_drop": "all",      // Carpeta específica o "all" para todas
 *   "precio_base": 350,         // Precio base default
 *   "activo": true,             // Si los productos deben estar activos
 *   "auto_detect_marca": true,  // Si debe detectar la marca automáticamente por nombre
 *   "dry_run": false            // Si es true, solo muestra qué haría sin insertar
 * }
 */
flycaps.post('/sync', async (c) => {
  try {
    const supabase = getSupabaseAdmin(c.env)

    // Obtener parámetros del body (opcionales)
    const body = await c.req.json().catch(() => ({}))
    const {
      carpeta_drop = 'all',
      precio_base = 350,
      activo = true,
      permitir_sin_stock = true,
      destacado = false,
      auto_detect_marca = true,
      dry_run = false
    } = body

    // 1. Obtener todas las marcas activas de la BD
    const { data: marcas, error: marcasError } = await supabase
      .from('marcas')
      .select('id, nombre')
      .eq('activo', true)

    if (marcasError) {
      return c.json({
        error: 'Error al obtener marcas de la BD',
        details: marcasError
      }, 500)
    }

    console.log(`📋 Marcas encontradas en BD: ${marcas?.length || 0}`)
    marcas?.forEach(m => console.log(`  - ${m.nombre} (ID: ${m.id})`))

    // 2. Listar carpetas en el bucket productos/flycaps
    const { data: folders, error: foldersError } = await supabase
      .storage
      .from('productos')
      .list('flycaps', {
        limit: 100,
        offset: 0,
      })

    if (foldersError) {
      return c.json({
        error: 'Error al leer carpetas del storage',
        details: foldersError
      }, 500)
    }

    // Filtrar solo carpetas
    const dropFolders = folders?.filter(item =>
      !item.name.includes('.') && // No es archivo
      (carpeta_drop === 'all' || item.name === carpeta_drop)
    ) || []

    if (dropFolders.length === 0) {
      return c.json({
        message: 'No se encontraron carpetas de drops',
        folders_found: folders?.map(f => f.name)
      }, 404)
    }

    const productosInsertados: any[] = []
    const errores: any[] = []

    // 3. Por cada carpeta de drop (ej: mix-drop, newEra-drop)
    for (const dropFolder of dropFolders) {
      const dropName = dropFolder.name

      console.log(`\n📁 Procesando drop: ${dropName}`)

      // Listar productos dentro del drop
      const { data: productFolders, error: productFoldersError } = await supabase
        .storage
        .from('productos')
        .list(`flycaps/${dropName}`, {
          limit: 1000,
          offset: 0,
        })

      if (productFoldersError) {
        errores.push({
          drop: dropName,
          error: 'Error al leer productos',
          details: productFoldersError
        })
        continue
      }

      // Filtrar solo carpetas de productos
      const productoDirs = productFolders?.filter(item =>
        !item.name.includes('.')
      ) || []

      console.log(`   📦 Productos encontrados: ${productoDirs.length}`)

      // 4. Por cada carpeta de producto
      for (const productDir of productoDirs) {
        const productName = productDir.name
        const productPath = `flycaps/${dropName}/${productName}`

        // Detectar marca del producto (primero desde nombre producto, luego desde drop)
        const marcaDetectada = auto_detect_marca
          ? detectMarcaProducto(productName, dropName, marcas || [])
          : null

        try {
          // Listar imágenes del producto
          const { data: images, error: imagesError } = await supabase
            .storage
            .from('productos')
            .list(productPath, {
              limit: 100,
              offset: 0,
            })

          if (imagesError) {
            errores.push({
              producto: productName,
              drop: dropName,
              error: 'Error al leer imágenes',
              details: imagesError
            })
            continue
          }

          // Filtrar solo archivos de imagen
          const imageFiles = images?.filter(item =>
            item.name.match(/\.(jpg|jpeg|png|webp|avif)$/i)
          ) || []

          if (imageFiles.length === 0) {
            errores.push({
              producto: productName,
              drop: dropName,
              error: 'No se encontraron imágenes'
            })
            continue
          }

          // Generar slug único
          const slug = `${productName.toLowerCase().replace(/\s+/g, '-')}-${dropName}`

          // Verificar si el producto ya existe (por slug)
          const { data: existingProduct } = await supabase
            .from('productos')
            .select('id')
            .eq('slug', slug)
            .single()

          if (existingProduct) {
            errores.push({
              producto: productName,
              drop: dropName,
              error: 'Producto ya existe',
              slug: slug
            })
            continue
          }

          // Si es dry_run, solo simular
          if (dry_run) {
            productosInsertados.push({
              dry_run: true,
              producto: {
                nombre: productName,
                slug: slug,
                id_marca: marcaDetectada?.id || null,
                marca_nombre: marcaDetectada?.nombre || 'Sin marca',
                imagenes_encontradas: imageFiles.length
              },
              drop: dropName
            })
            continue
          }

          // 5. Insertar producto
          const { data: newProduct, error: productError } = await supabase
            .from('productos')
            .insert({
              id_subcategoria: null, // El admin lo asigna después
              id_marca: marcaDetectada?.id || null,
              nombre: productName,
              slug: slug,
              sku: `FLYCAPS-${dropName.toUpperCase()}-${productName.toUpperCase().replace(/\s+/g, '-')}`,
              descripcion: `Gorra ${productName}${marcaDetectada ? ` - ${marcaDetectada.nombre}` : ''} - Colección ${dropName}`,
              precio_base: precio_base,
              precio_mayoreo: null,
              precio_distribuidor: null,
              min_mayoreo: null,
              min_distribuidor: null,
              activo,
              permitir_sin_stock,
              destacado
            })
            .select()
            .single()

          if (productError || !newProduct) {
            errores.push({
              producto: productName,
              drop: dropName,
              error: 'Error al insertar producto',
              details: productError
            })
            continue
          }

          // 6. Insertar imágenes del producto
          const imagenesInsertadas: any[] = []
          for (let i = 0; i < imageFiles.length; i++) {
            const imageFile = imageFiles[i]
            const storagePath = `${productPath}/${imageFile.name}`

            const { data: imagen, error: imagenError } = await supabase
              .from('productos_imagenes')
              .insert({
                id_producto: newProduct.id,
                storage_path: storagePath,
                alt_text: `${productName} - Imagen ${i + 1}`,
                orden: i,
                es_principal: i === 0
              })
              .select()
              .single()

            if (!imagenError && imagen) {
              imagenesInsertadas.push(imagen)
            }
          }

          // 7. Insertar una variante inicial
          const { data: variante, error: varianteError } = await supabase
            .from('producto_variantes')
            .insert({
              id_producto: newProduct.id,
              sku: `${newProduct.sku}-DEFAULT`,
              talla: null,
              color: null,
              color_hex: null,
              precio_extra: 0,
              stock: 0,
              stock_minimo: 5,
              id_imagen: imagenesInsertadas[0]?.id || null,
              activo: true
            })
            .select()
            .single()

          productosInsertados.push({
            producto: newProduct,
            imagenes: imagenesInsertadas,
            variante: variante,
            drop: dropName,
            marca_detectada: marcaDetectada?.nombre || null
          })

          console.log(`      ✅ ${productName} insertado`)

        } catch (err) {
          errores.push({
            producto: productName,
            drop: dropName,
            error: 'Error inesperado',
            details: err
          })
        }
      }
    }

    // Crear resumen de marcas detectadas
    const marcasDetectadasResumen = productosInsertados.reduce((acc: any, p: any) => {
      const marca = p.marca_detectada || 'Sin marca'
      acc[marca] = (acc[marca] || 0) + 1
      return acc
    }, {})

    return c.json({
      success: true,
      dry_run: dry_run,
      productos_insertados: productosInsertados.length,
      productos: productosInsertados,
      errores: errores.length > 0 ? errores : undefined,
      carpetas_procesadas: dropFolders.map(f => f.name),
      marcas_detectadas_resumen: marcasDetectadasResumen,
      marcas_disponibles: marcas?.map(m => m.nombre)
    })

  } catch (error) {
    console.error('Error en sync de flycaps:', error)
    return c.json({
      error: 'Error al sincronizar productos',
      details: error
    }, 500)
  }
})

/**
 * Endpoint para obtener lista de drops disponibles en storage
 * GET /api/catalogo/flycaps/drops
 */
flycaps.get('/drops', async (c) => {
  try {
    const supabase = getSupabaseAdmin(c.env)

    const { data: folders, error } = await supabase
      .storage
      .from('productos')
      .list('flycaps', {
        limit: 100,
        offset: 0,
      })

    if (error) {
      return c.json({ error: 'Error al leer storage', details: error }, 500)
    }

    const drops = folders?.filter(item => !item.name.includes('.')).map(f => f.name) || []

    return c.json({ drops })

  } catch (error) {
    return c.json({ error: 'Error al listar drops', details: error }, 500)
  }
})

export default flycaps
