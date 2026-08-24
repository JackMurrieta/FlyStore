/**
 * Script de prueba para el endpoint de sincronización de flycaps
 *
 * Uso:
 * 1. Asegúrate de tener el servidor corriendo: npm run dev
 * 2. Ejecuta este script: node test-flycaps-sync.js
 */

const API_URL = 'http://localhost:8787'

async function testFlycapsSync() {
  console.log('🧢 Probando sincronización de productos de flycaps...\n')

  try {
    // 1. Primero, obtener la lista de drops disponibles
    console.log('1️⃣ Obteniendo lista de drops disponibles...')
    const dropsResponse = await fetch(`${API_URL}/api/catalogo/flycaps/drops`)
    const dropsData = await dropsResponse.json()

    console.log('Drops encontrados:', dropsData.drops)
    console.log('')

    if (!dropsData.drops || dropsData.drops.length === 0) {
      console.log('❌ No se encontraron drops en el storage')
      console.log('Verifica que las carpetas estén en: productos/flycaps/')
      return
    }

    // 2. Sincronizar productos
    console.log('2️⃣ Sincronizando productos de flycaps...')
    console.log('Parámetros:')

    // IMPORTANTE: Modifica estos valores según tu BD
    const syncParams = {
      id_subcategoria: null,      // Cambia esto al ID de la subcategoría de gorras
      id_marca: null,              // Cambia esto al ID de la marca correspondiente
      carpeta_drop: 'all',         // 'all', 'mix-drop', 'newEra-drop', etc.
      precio_base: 350,            // Precio base en tu moneda
      activo: true,
      permitir_sin_stock: true,
      destacado: false
    }

    console.log(JSON.stringify(syncParams, null, 2))
    console.log('')

    const syncResponse = await fetch(`${API_URL}/api/catalogo/flycaps/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(syncParams)
    })

    const syncData = await syncResponse.json()

    if (syncResponse.ok) {
      console.log('✅ Sincronización exitosa!')
      console.log(`📦 Productos insertados: ${syncData.productos_insertados}`)
      console.log(`📁 Carpetas procesadas: ${syncData.carpetas_procesadas?.join(', ')}`)

      if (syncData.errores && syncData.errores.length > 0) {
        console.log(`\n⚠️  Errores encontrados: ${syncData.errores.length}`)
        console.log('Primeros 5 errores:')
        syncData.errores.slice(0, 5).forEach(err => {
          console.log(`  - ${err.producto} (${err.drop}): ${err.error}`)
        })
      }

      if (syncData.productos && syncData.productos.length > 0) {
        console.log('\n📋 Primeros 3 productos insertados:')
        syncData.productos.slice(0, 3).forEach(p => {
          console.log(`  - ${p.producto.nombre} (${p.drop})`)
          console.log(`    ID: ${p.producto.id}`)
          console.log(`    Slug: ${p.producto.slug}`)
          console.log(`    Imágenes: ${p.imagenes.length}`)
          console.log('')
        })
      }
    } else {
      console.log('❌ Error en la sincronización')
      console.log('Respuesta:', syncData)
    }

  } catch (error) {
    console.error('❌ Error al ejecutar el test:', error.message)
    console.log('\n💡 Asegúrate de que:')
    console.log('  1. El servidor esté corriendo (npm run dev)')
    console.log('  2. El servidor esté en http://localhost:8787')
    console.log('  3. Tengas conexión a Supabase configurada')
  }
}

// Ejecutar el test
testFlycapsSync()
