import type { ICatalogoService } from '../dominio/puertos/ICatalogoService'
import type { IProductoService } from '../dominio/puertos/IProductoService'
import type { FiltrosCatalogoTs } from '../dominio/FiltrosCatalogoTs'
import type { ProductoCatalogoDTO } from './dto/ProductoCatalogoDTO'
import { EstadoProducto } from '../dominio/EstadoProducto'
import { TipoPrecio } from '../dominio/TipoPrecio'

export class CatalogoModel {
  private readonly catalogoService: ICatalogoService
  private readonly productoService: Pick<IProductoService, 'obtenerProductos' | 'buscarProductos' | 'obtenerPagina'>

  constructor(catalogoService: ICatalogoService, productoService: Pick<IProductoService, 'obtenerProductos' | 'buscarProductos' | 'obtenerPagina'>) {
    this.catalogoService = catalogoService
    this.productoService = productoService
  }

  async obtenerCatalogo() {
    return (await this.productoService.obtenerProductos()).map(this.aProductoCatalogoTs)
  }

  async obtenerPagina(pagina = 0, filtros?: FiltrosCatalogoTs) {
    const tamano = 7
    if (filtros && !Object.values(filtros).some(v => v?.trim())) throw new Error('Selecciona al menos un filtro para buscar.')
    if (this.productoService.obtenerPagina) {
      const resultado = await this.productoService.obtenerPagina(pagina, tamano, filtros)
      return { productos: resultado.productos.map(this.aProductoCatalogoTs), pagina: resultado.pagina, hayMas: resultado.hayMas }
    }
    // Los adaptadores de demostración y dobles locales siguen operando en memoria.
    const lista = filtros ? await this.productoService.buscarProductos(filtros) : await this.productoService.obtenerProductos()
    const inicio = pagina * tamano
    return { productos: lista.slice(inicio, inicio + tamano).map(this.aProductoCatalogoTs), pagina, hayMas: lista.length > inicio + tamano }
  }

  obtenerFiltrosDisponibles() { return this.catalogoService.obtenerFiltrosDisponibles() }
  obtenerTallasPorCategoria(idCategoria: string) {
    return this.catalogoService.obtenerTallasPorCategoria(idCategoria)
  }

  async buscarProductos(filtros: FiltrosCatalogoTs) {
    if (!Object.values(filtros).some(v=>v?.trim())) throw new Error('Selecciona al menos un filtro para buscar.')
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
