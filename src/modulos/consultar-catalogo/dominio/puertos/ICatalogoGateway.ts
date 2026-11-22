import type { CriteriosBusquedaTs } from '../CriteriosBusquedaTs';
import type { CatalogoRespuestaDTO } from '../../aplicacion/dto/CatalogoRespuestaDTO';
import type { ProductoDetalleRespuestaDTO } from '../../aplicacion/dto/ProductoDetalleRespuestaDTO';

export interface ICatalogoGateway {
    obtenerCatalogoInicial(): Promise<CatalogoRespuestaDTO>;
    buscarProductos(criterios: CriteriosBusquedaTs): Promise<CatalogoRespuestaDTO>;
    obtenerDetalleProducto(idProducto: string): Promise<ProductoDetalleRespuestaDTO>;
}