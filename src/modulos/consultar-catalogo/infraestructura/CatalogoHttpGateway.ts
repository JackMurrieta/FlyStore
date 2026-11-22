import { HttpClient } from '../../../infraestructura/http/HttpClient'
import * as endpoints from '../../../infraestructura/http/endpoints'
import type { CatalogoRespuestaDTO } from '../aplicacion/dto/CatalogoRespuestaDTO'
import type { ProductoDetalleRespuestaDTO } from '../aplicacion/dto/ProductoDetalleRespuestaDTO'
import type { CriteriosBusquedaTs } from '../dominio/CriteriosBusquedaTs'
import type { ICatalogoGateway } from '../dominio/puertos/ICatalogoGateway'

export class CatalogoHttpGateway implements ICatalogoGateway {
    private readonly http: HttpClient

    constructor(http: HttpClient) {
        this.http = http
    }

    public obtenerCatalogoInicial(): Promise<CatalogoRespuestaDTO> {
        return this.http.get<CatalogoRespuestaDTO>(endpoints.catalogo.inicial())
    }

    public buscarProductos(criterios: CriteriosBusquedaTs): Promise<CatalogoRespuestaDTO> {
        const url = endpoints.catalogo.buscar({
            termino: criterios.termino,
            idCategoria: criterios.idCategoria,
        })
        return this.http.get<CatalogoRespuestaDTO>(url)
    }

    public obtenerDetalleProducto(idProducto: string): Promise<ProductoDetalleRespuestaDTO> {
        return this.http.get<ProductoDetalleRespuestaDTO>(
            endpoints.catalogo.productoDetalle(idProducto)
        )
    }
}