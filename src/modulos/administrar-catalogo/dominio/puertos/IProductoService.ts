import type { ProductoCatalogoDTO } from '../../aplicacion/dto/ProductoCatalogoDTO'
import type { CrearProductoDTO } from '../../aplicacion/dto/CrearProductoDTO'
import type { ProductoCreadoDTO } from '../../aplicacion/dto/ProductoCreadoDTO'
import type { CrearVarianteDTO } from '../../aplicacion/dto/CrearVarianteDTO'
import type { CrearPreciosDTO } from '../../aplicacion/dto/CrearPreciosDTO'
import type { ResultadoBajaDTO } from '../../aplicacion/dto/ResultadoBajaDTO'
import type { FiltrosCatalogoTs } from '../FiltrosCatalogoTs'

export interface IProductoService {
  obtenerProductos(): Promise<ProductoCatalogoDTO[]>
  buscarProductos(filtros: FiltrosCatalogoTs): Promise<ProductoCatalogoDTO[]>
  crearProducto(datos: CrearProductoDTO): Promise<ProductoCreadoDTO>
  agregarVariante(idProducto: string, variante: CrearVarianteDTO): Promise<void>
  crearPrecios(idProducto: string, precios: CrearPreciosDTO): Promise<void>
  darDeBajaProducto(idProducto: string): Promise<ResultadoBajaDTO>
}
