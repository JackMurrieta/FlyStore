import type { ICatalogoService } from '../dominio/puertos/ICatalogoService'
import type { IProductoService } from '../dominio/puertos/IProductoService'
import type { FiltrosCatalogoTs } from '../dominio/FiltrosCatalogoTs'
import type { ProductoCatalogoDTO } from './dto/ProductoCatalogoDTO'
import { EstadoProducto } from '../dominio/EstadoProducto'
import { TipoPrecio } from '../dominio/TipoPrecio'

export class CatalogoModel {
  private readonly catalogoService: ICatalogoService
  private readonly productoService: IProductoService

  constructor(catalogoService: ICatalogoService, productoService: IProductoService) {
    this.catalogoService = catalogoService
    this.productoService = productoService
  }

  async obtenerCatalogo() {
    return (await this.productoService.obtenerProductos()).map(this.aProductoCatalogoTs)
  }

  obtenerFiltrosDisponibles() { return this.catalogoService.obtenerFiltrosDisponibles() }
  obtenerTallasPorCategoria(idCategoria: string) {
    return this.catalogoService.obtenerTallasPorCategoria(idCategoria)
  }

  async buscarProductos(filtros: FiltrosCatalogoTs) {
    return (await this.productoService.buscarProductos(filtros)).map(this.aProductoCatalogoTs)
  }

  private aProductoCatalogoTs(dto: ProductoCatalogoDTO) {
    const estado = Object.values(EstadoProducto).find(valor => valor === dto.estado)
    if (!estado) throw new Error('Estado de producto desconocido')
    return {
      ...dto, estado, imagen: dto.img,
      existencias: dto.variantes.reduce((total, variante) => total + variante.stock, 0),
      precios: dto.preciosProducto.map(precio => {
        const tipoPrecio = Object.values(TipoPrecio).find(valor => valor === precio.tipoPrecio)
        if (!tipoPrecio) throw new Error('Tipo de precio desconocido')
        return { ...precio, tipoPrecio }
      }),
    }
  }
}
