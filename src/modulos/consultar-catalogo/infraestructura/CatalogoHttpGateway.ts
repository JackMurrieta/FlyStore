import type { HttpClient } from '@infraestructura/http/HttpClient'
import { catalogo } from '@infraestructura/http/endpoints'
import type { CatalogoRespuestaDTO } from '../aplicacion/dto/CatalogoRespuestaDTO'
import type { ProductoDetalleRespuestaDTO } from '../aplicacion/dto/ProductoDetalleRespuestaDTO'
import type { CriteriosBusquedaTs } from '../dominio/CriteriosBusquedaTs'
import type { ICatalogoGateway } from '../dominio/puertos/ICatalogoGateway'
import { criteriosAParametros } from '../dominio/ReglasCatalogo'

/** Adaptador HTTP del CU-01. Solo arma la URL y regresa el DTO o el ErrorApi del HttpClient. */
export class CatalogoHttpGateway implements ICatalogoGateway {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  consultarLinea(ruta: string, criterios: CriteriosBusquedaTs, pagina: number): Promise<CatalogoRespuestaDTO> {
    const parametros = criteriosAParametros(criterios)
    if (pagina > 0) parametros.set('pagina', String(pagina))
    return this.http.get<CatalogoRespuestaDTO>(catalogo.linea(ruta, parametros.toString()))
  }

  buscar(criterios: CriteriosBusquedaTs, linea: string | null, pagina: number): Promise<CatalogoRespuestaDTO> {
    const parametros = criteriosAParametros(criterios)
    if (linea) parametros.set('linea', linea)
    if (pagina > 0) parametros.set('pagina', String(pagina))
    return this.http.get<CatalogoRespuestaDTO>(catalogo.buscar(parametros.toString()))
  }

  obtenerProducto(idProducto: number): Promise<ProductoDetalleRespuestaDTO> {
    return this.http.get<ProductoDetalleRespuestaDTO>(catalogo.producto(idProducto))
  }
}
