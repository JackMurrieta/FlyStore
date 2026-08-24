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
 * Busca la marca que mejor coincida con el nombre de la carpeta
 */
function findMatchingMarca(folderName: string, marcas: any[]): any | null {
  const normalizedFolder = normalizeString(folderName)

  // Buscar coincidencia exacta primero
  let bestMatch = marcas.find(marca =>
    normalizeString(marca.nombre) === normalizedFolder
  )

  if (bestMatch) return bestMatch

  // Buscar coincidencia parcial (nombre de marca contenido en carpeta)
  bestMatch = marcas.find(marca => {
    const normalizedMarca = normalizeString(marca.nombre)
    return normalizedFolder.includes(normalizedMarca) || normalizedMarca.includes(normalizedFolder)
  })

  return bestMatch || null
}

/**
 * Endpoint para sincronizar productos de flycaps desde el storage
 * POST /api/catalogo/flycaps/sync
 *
 * Body (opcional):
 * {
 *   "id_subcategoria": 1,  // ID de la subcategor�a para asignar
 *   "id_marca": 1,          // ID de la marca para asignar
 *   "carpeta_drop": "mix-drop", // Carpeta espec�fica o "all" para todas
 *   "precio_base": 350,     // Precio base default
 *   "activo": true          // Si los productos deben estar activos
 * }
 */
flycaps.post('/sync', async (c) => {
  try {
    const supabase = getSupabaseAdmin(c.env)

    // Obtener par�metros del body (opcionales)
    const body = await c.req.json().catch(() => ({}))
    const {
      id_subcategoria = null,
      id_marca = null,
      carpeta_drop = 'all', // 'mix-drop', 'newEra-drop', o 'all'
      precio_base = 350,
      activo = true,
      permitir_sin_stock = true,
      destacado = false
    } = body

    // 1. Listar carpetas en el bucket productos/flycaps
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

    // Filtrar solo carpetas (las carpetas tienen prefix null y son directories)
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

    // 2. Por cada carpeta de drop (ej: mix-drop, newEra-drop)
    for (const dropFolder of dropFolders) {
      const dropName = dropFolder.name

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

      // 3. Por cada carpeta de producto
      for (const productDir of productoDirs) {
        const productName = productDir.name
        const productPath = `flycaps/${dropName}/${productName}`

        try {
          // Listar im�genes del producto
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
              error: 'Error al leer im�genes',
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
              error: 'No se encontraron im�genes'
            })
            continue
          }

          // Generar slug �nico
          const slug = `${productName.toLowerCase().replace(/\s+/g, '-')}-${dropName}`

          // 4. Verificar si el producto ya existe (por slug)
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

          // 5. Insertar producto
          const { data: newProduct, error: productError } = await supabase
            .from('productos')
            .insert({
              id_subcategoria,
              id_marca,
              nombre: productName,
              slug: slug,
              sku: `FLYCAPS-${dropName.toUpperCase()}-${productName.toUpperCase().replace(/\s+/g, '-')}`,
              descripcion: `Gorra ${productName} - Colecci�n ${dropName}`,
              precio_base: precio_base,
              precio_mayoreo: null, // Admin lo configura despu�s
              precio_distribuidor: null, // Admin lo configura despu�s
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

          // 6. Insertar im�genes del producto
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
                es_principal: i === 0 // Primera imagen es principal
              })
              .select()
              .single()

            if (!imagenError && imagen) {
              imagenesInsertadas.push(imagen)
            }
          }

          // 7. Insertar una variante inicial (sin talla ni color espec�fico)
          const { data: variante, error: varianteError } = await supabase
            .from('producto_variantes')
            .insert({
              id_producto: newProduct.id,
              sku: `${newProduct.sku}-DEFAULT`,
              talla: null, // Admin configura despu�s
              color: null, // Admin configura despu�s
              color_hex: null,
              precio_extra: 0,
              stock: 0, // Admin configura despu�s
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
            drop: dropName
          })

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

    return c.json({
      success: true,
      productos_insertados: productosInsertados.length,
      productos: productosInsertados,
      errores: errores.length > 0 ? errores : undefined,
      carpetas_procesadas: dropFolders.map(f => f.name)
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
