import type { PaginaProductosDTO } from '../aplicacion/dto/PaginaProductosDTO'
import type { HttpClient } from '@infraestructura/http/HttpClient'
import { catalogoAdmin } from '@infraestructura/http/endpoints'
import type { IProductoService } from '../dominio/puertos/IProductoService'
import type { ResultadoBajaDTO } from '../aplicacion/dto/ResultadoBajaDTO'
import type { CrearProductoDTO } from '../aplicacion/dto/CrearProductoDTO'
import type { EditarProductoDTO } from '../aplicacion/dto/EditarProductoDTO'
import type { ProductoEdicionDTO } from '../aplicacion/dto/ProductoEdicionDTO'
import type { FiltrosCatalogoTs } from '../dominio/FiltrosCatalogoTs'
import type { ProductoCatalogoDTO } from '../aplicacion/dto/ProductoCatalogoDTO'

/** Subir hasta 10 fotos de 5 MB puede tardar: se da más margen que a una petición normal. */
const TIEMPO_SUBIDA_MS = 180_000

/** Multipart del backend: parte `producto` (JSON) y una parte `imagenes` por archivo, en el orden de sus índices. */
function formularioMultipart(producto: unknown, archivos: File[]): FormData {
  const form = new FormData()
  form.append('producto', new Blob([JSON.stringify(producto)], { type: 'application/json' }), 'producto.json')
  for (const archivo of archivos) form.append('imagenes', archivo, archivo.name)
  return form
}

export class ProductoService implements IProductoService {
  private readonly http: HttpClient
  constructor(http: HttpClient) { this.http = http }

  obtenerProductos(): Promise<ProductoCatalogoDTO[]> { return this.http.get(catalogoAdmin.productos()) }

  buscarProductos(filtros: FiltrosCatalogoTs): Promise<ProductoCatalogoDTO[]> { return this.http.get(catalogoAdmin.buscarProductos(filtros)) }

  obtenerPagina(pagina: number, tamano: number, filtros?: FiltrosCatalogoTs): Promise<PaginaProductosDTO> {
    const url = filtros ? catalogoAdmin.buscarProductos(filtros) : catalogoAdmin.productos()
    return this.http.get(url + (filtros ? '&' : '?') + 'pagina=' + pagina + '&tamano=' + tamano)
  }

  darDeBajaProducto(id: string): Promise<ResultadoBajaDTO> { return this.http.delete(catalogoAdmin.producto(id)) }

  /** POST /api/productos siempre en multipart: el alta exige al menos una foto por color. */
  crearProducto(datos: CrearProductoDTO, archivos: File[]): Promise<void> {
    return this.http.postMultipart(catalogoAdmin.productos(), formularioMultipart(datos, archivos), { timeout: TIEMPO_SUBIDA_MS })
  }

  obtenerProductoParaEditar(idProducto: string): Promise<ProductoEdicionDTO> {
    return this.http.get(catalogoAdmin.producto(idProducto))
  }

  /** PUT en JSON si solo cambian datos o fotos ya guardadas; en multipart si hay archivos nuevos. */
  editarProducto(idProducto: string, datos: EditarProductoDTO, archivos: File[]): Promise<ProductoEdicionDTO> {
    const url = catalogoAdmin.producto(idProducto)
    return archivos.length
      ? this.http.put(url, formularioMultipart(datos, archivos), { timeout: TIEMPO_SUBIDA_MS })
      : this.http.put(url, datos)
  }
}
