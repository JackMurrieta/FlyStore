import type { HttpClient } from '@infraestructura/http/HttpClient'
import { catalogoAdmin } from '@infraestructura/http/endpoints'
import type { IProductoService } from '../dominio/puertos/IProductoService'
import type { ResultadoBajaDTO } from '../aplicacion/dto/ResultadoBajaDTO'
import type { CrearProductoDTO } from '../aplicacion/dto/CrearProductoDTO'
import type { FiltrosCatalogoTs } from '../dominio/FiltrosCatalogoTs'
import type { ProductoCatalogoDTO } from '../aplicacion/dto/ProductoCatalogoDTO'
export class ProductoService implements Pick<IProductoService, 'obtenerProductos' | 'buscarProductos' | 'crearProducto' | 'darDeBajaProducto'> {
 private readonly http: HttpClient
 constructor(http: HttpClient) { this.http = http }
 obtenerProductos(): Promise<ProductoCatalogoDTO[]> { return this.http.get(catalogoAdmin.productos()) }
 buscarProductos(filtros: FiltrosCatalogoTs): Promise<ProductoCatalogoDTO[]> { return this.http.get(catalogoAdmin.buscarProductos(filtros)) }
 darDeBajaProducto(id: string): Promise<ResultadoBajaDTO> { return this.http.delete(catalogoAdmin.producto(id)) }
 crearProducto(datos: CrearProductoDTO): Promise<void> {
 const { imagenes, ...producto } = datos
 const form = new FormData()
 form.append('producto', new Blob([JSON.stringify(producto)], {type:'application/json'}), 'producto.json')
 form.append('imagen', imagenes, imagenes.name)
 return this.http.postMultipart(catalogoAdmin.productos(), form)
 }
}
