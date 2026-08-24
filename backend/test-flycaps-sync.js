/**
 * Script de prueba para el endpoint de sincronización de flycaps
 *
 * Uso:
 * 1. Asegúrate de tener el servidor corriendo: npm run dev
 * 2. Ejecuta este script: node test-flycaps-sync.js
 */

const API_URL = 'http://localhost:8787'

async function testMetadata() {
  console.log('📊 Obteniendo marcas y categorías de la BD...\n')

  try {
    const response = await fetch(`${API_URL}/api/catalogo/flycaps/metadata`)
    const data = await response.json()

    if (response.ok) {
      console.log('✅ Marcas disponibles:')
      data.marcas.forEach(m => {
        console.log(`   - ${m.nombre} (ID: ${m.id})`)
      })

      console.log('\n✅ Categorías disponibles:')
      data.categorias.forEach(c => {
        console.log(`   - ${c.nombre} (ID: ${c.id})`)
        if (c.subcategorias && c.subcategorias.length > 0) {
          c.subcategorias.forEach(s => {
            console.log(`      └─ ${s.nombre} (ID: ${s.id})`)
          })
        }
      })

      return data
    } else {
      console.log('❌ Error al obtener metadata:', data)
      return null
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    return null
  }
}

async function testDrops() {
  console.log('\n📁 Obteniendo drops disponibles en storage...\n')

  try {
    const response = await fetch(`${API_URL}/api/catalogo/flycaps/drops`)
    const data = await response.json()

    if (response.ok) {
      console.log('✅ Drops encontrados en storage:')
      data.drops.forEach(d => {
        console.log(`   - ${d}`)
      })
      return data.drops
    } else {
      console.log('❌ Error al obtener drops:', data)
      return []
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    return []
  }
}

async function testSync(dryRun = true) {
  console.log(`\n🔄 ${dryRun ? 'SIMULANDO' : 'EJECUTANDO'} sincronización de productos...\n`)

  try {
    const syncParams = {
      carpeta_drop: 'all',         // 'all' para todas las carpetas, o nombre específico
      precio_base: 350,            // Precio base en tu moneda
      activo: true,                // Productos activos
      permitir_sin_stock: true,    // Permitir ventas sin stock
      destacado: false,            // No destacados por defecto
      auto_detect_marca: true,     // ✅ DETECTAR MARCA AUTOMÁTICAMENTE
      dry_run: dryRun              // true = solo simula, false = inserta realmente
    }

    console.log('Parámetros de sincronización:')
    console.log(JSON.stringify(syncParams, null, 2))
    console.log('')

    const response = await fetch(`${API_URL}/api/catalogo/flycaps/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(syncParams)
    })

    const data = await response.json()

    if (response.ok) {
      console.log('✅ Sincronización completada!\n')

      // Mostrar información de matching de marcas
      if (data.matching_info && data.matching_info.length > 0) {
        console.log('🏷️  Detección de marcas por drop:')
        data.matching_info.forEach(info => {
          if (info.marca_detectada) {
            console.log(`   ✅ ${info.drop} → ${info.marca_detectada} (ID: ${info.id_marca})`)
          } else {
            console.log(`   ⚠️  ${info.drop} → Sin marca detectada`)
          }
        })
        console.log('')
      }

      console.log(`📦 Productos ${dryRun ? 'que se insertarían' : 'insertados'}: ${data.productos_insertados}`)
      console.log(`📁 Carpetas procesadas: ${data.carpetas_procesadas?.join(', ')}`)
      console.log(`🏷️  Marcas disponibles en BD: ${data.marcas_disponibles?.join(', ')}`)

      if (data.errores && data.errores.length > 0) {
        console.log(`\n⚠️  Errores/Advertencias: ${data.errores.length}`)
        console.log('Primeros 10 errores:')
        data.errores.slice(0, 10).forEach(err => {
          console.log(`  - ${err.producto || err.drop}: ${err.error}`)
        })
      }

      if (data.productos && data.productos.length > 0) {
        console.log(`\n📋 ${dryRun ? 'Primeros 5 productos que se insertarían:' : 'Primeros 5 productos insertados:'}`)
        data.productos.slice(0, 5).forEach(p => {
          if (dryRun) {
            console.log(`  - ${p.producto.nombre}`)
            console.log(`    Slug: ${p.producto.slug}`)
            console.log(`    Marca: ${p.producto.marca_nombre}`)
            console.log(`    Imágenes: ${p.producto.imagenes_encontradas}`)
          } else {
            console.log(`  - ${p.producto.nombre} (ID: ${p.producto.id})`)
            console.log(`    Slug: ${p.producto.slug}`)
            console.log(`    Marca: ${p.marca_detectada || 'Sin marca'}`)
            console.log(`    Drop: ${p.drop}`)
            console.log(`    Imágenes: ${p.imagenes.length}`)
          }
          console.log('')
        })
      }

      return data
    } else {
      console.log('❌ Error en la sincronización')
      console.log('Respuesta:', JSON.stringify(data, null, 2))
      return null
    }
  } catch (error) {
    console.error('❌ Error al ejecutar la sincronización:', error.message)
    return null
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('🧢 TEST DE SINCRONIZACIÓN DE PRODUCTOS FLYCAPS')
  console.log('='.repeat(60))
  console.log('')

  // 1. Verificar metadata (marcas y categorías)
  const metadata = await testMetadata()
  if (!metadata) {
    console.log('\n❌ No se pudo obtener metadata. Verifica la conexión.')
    return
  }

  // 2. Verificar drops en storage
  const drops = await testDrops()
  if (!drops || drops.length === 0) {
    console.log('\n❌ No se encontraron drops. Verifica el storage.')
    return
  }

  // 3. Ejecutar DRY RUN (simulación)
  console.log('\n' + '='.repeat(60))
  console.log('PASO 1: SIMULACIÓN (DRY RUN)')
  console.log('='.repeat(60))
  const dryRunResult = await testSync(true)

  if (!dryRunResult) {
    console.log('\n❌ La simulación falló. No se procederá con la inserción real.')
    return
  }

  // 4. Preguntar si desea ejecutar inserción real
  console.log('\n' + '='.repeat(60))
  console.log('⚠️  IMPORTANTE')
  console.log('='.repeat(60))
  console.log('La simulación se completó correctamente.')
  console.log(`Se insertarían ${dryRunResult.productos_insertados} productos.`)
  console.log('')
  console.log('Para ejecutar la inserción REAL:')
  console.log('1. Revisa los resultados de la simulación arriba')
  console.log('2. Abre este archivo (test-flycaps-sync.js)')
  console.log('3. En la línea 172, cambia "await testSync(true)" por "await testSync(false)"')
  console.log('4. Ejecuta nuevamente: node test-flycaps-sync.js')
  console.log('')
  console.log('💡 Tip: Puedes modificar los parámetros en la función testSync()')
  console.log('   para personalizar el precio, activar/desactivar productos, etc.')
}

// Ejecutar el test
main().catch(err => {
  console.error('Error fatal:', err)
  process.exit(1)
})
