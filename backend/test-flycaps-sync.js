/**
 * Script de sincronización de productos de flycaps desde Supabase Storage
 *
 * IMPORTANTE: Procesa UNA carpeta a la vez para mejor control
 *
 * Uso:
 * 1. Asegúrate de tener el servidor corriendo: npm run dev
 * 2. Configura la carpeta a procesar en la línea 73 (CARPETA_A_PROCESAR)
 *    - Primera ejecución: 'mix-drop'
 *    - Segunda ejecución: 'newEra-drop'
 *    - etc.
 * 3. Configura dry_run en línea 177:
 *    - true  = solo simular (no inserta en BD)
 *    - false = insertar productos realmente
 * 4. Ejecuta: node test-flycaps-sync.js
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

//cambiar a false para ejecutar la inserción real
async function testSync(dryRun = false) {

  console.log(`\n🔄 ${dryRun ? 'SIMULANDO' : 'EJECUTANDO'} sincronización de productos...\n`)

  try {
    // ⚠️ CAMBIA AQUÍ LA CARPETA: 'mix-drop', 'newEra-drop', etc. (una carpeta a la vez)
    const CARPETA_A_PROCESAR = 'newEra-drop'

    const syncParams = {
      carpeta_drop: CARPETA_A_PROCESAR,  // Procesa UNA carpeta específica a la vez
      precio_base: 350,                  // Precio base en tu moneda
      activo: true,                      // Productos activos
      permitir_sin_stock: true,          // Permitir ventas sin stock
      destacado: false,                  // No destacados por defecto
      auto_detect_marca: true,           // ✅ DETECTAR MARCA AUTOMÁTICAMENTE
      dry_run: dryRun                    // true = solo simula, false = inserta realmente
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

      // Mostrar resumen de marcas detectadas
      if (data.marcas_detectadas_resumen) {
        console.log('🏷️  Resumen de marcas detectadas:')
        Object.entries(data.marcas_detectadas_resumen).forEach(([marca, count]) => {
          console.log(`   ${marca === 'Sin marca' ? '⚠️' : '✅'}  ${marca}: ${count} productos`)
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

  // 3. Ejecutar sincronización
  console.log('\n' + '='.repeat(60))
  console.log('SINCRONIZACIÓN DE PRODUCTOS')
  console.log('='.repeat(60))
  const dryRunResult = await testSync(false)

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
  console.log('Para cambiar de carpeta o ejecutar inserción REAL:')
  console.log('1. Revisa los resultados de la simulación arriba')
  console.log('2. Abre este archivo (test-flycaps-sync.js)')
  console.log('3. En la línea 73, cambia CARPETA_A_PROCESAR a otra carpeta si deseas')
  console.log('   Ejemplo: const CARPETA_A_PROCESAR = \'newEra-drop\'')
  console.log('4. En la línea 177, cambia "await testSync(false)" por "await testSync(false)"')
  console.log('   para ejecutar la inserción real (o déjalo en true para simular)')
  console.log('5. Ejecuta nuevamente: node test-flycaps-sync.js')
  console.log('')
  console.log('💡 Tip: Procesa una carpeta a la vez para mejor control.')
  console.log('   Actualmente procesando: ' + syncParams.carpeta_drop)
}

// Ejecutar el test
main().catch(err => {
  console.error('Error fatal:', err)
  process.exit(1)
})
