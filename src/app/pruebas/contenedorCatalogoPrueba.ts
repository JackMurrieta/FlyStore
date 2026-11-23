import { HttpClient } from '@infraestructura/http/HttpClient'
import { ProductoService } from '@modulos/administrar-catalogo/infraestructura/ProductoService'
import { CatalogoService } from '@modulos/administrar-catalogo/infraestructura/CatalogoService'
import { CatalogoModel } from '@modulos/administrar-catalogo/aplicacion/CatalogoModel'
import { BajaProductoModel } from '@modulos/administrar-catalogo/aplicacion/BajaProductoModel'
import { ProductoModel } from '@modulos/administrar-catalogo/aplicacion/ProductoModel'
import { ResumenTiendaModel } from '@modulos/administrar-tienda/aplicacion/ResumenTiendaModel'
import type { ModelosPanel } from '@modulos/administrar-tienda/presentacion/PanelTiendaContext'

/**
 * Contenedor reducido para las pruebas de rutas del CU-03: el catálogo usa el HttpClient real (con `fetch` simulado)
 * y el resumen del panel responde sin red, para que las pruebas solo vean las peticiones del catálogo.
 */
export function crearContenedorCatalogo() {
  const http = new HttpClient()
  const productoService = new ProductoService(http)
  const modelosPanel: ModelosPanel = {
    resumen: new ResumenTiendaModel({
      obtenerPagosPorConfirmar: async () => [],
      obtenerProductosPorEstado: async () => ({ productos: [], hayMas: false }),
    }),
  }
  return {
    productoService,
    bajaProductoModel: new BajaProductoModel(productoService),
    productoModel: new ProductoModel(productoService),
    catalogoModel: new CatalogoModel(new CatalogoService(http), productoService),
    modelosPanel,
  }
}
