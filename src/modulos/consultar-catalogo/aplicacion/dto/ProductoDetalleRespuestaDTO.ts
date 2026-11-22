import type { CatalogoItemDTO } from './OpcionesFiltroRespuestaDTO'
import type { PrecioProductoDTO, VarianteDTO } from './CatalogoRespuestaDTO'

export interface ProductoDetalleRespuestaDTO {
    idProducto: number
    nombre: string
    descripcion: string
    estado: string
    marca: CatalogoItemDTO | null
    categoria: CatalogoItemDTO | null
    subcategoria: CatalogoItemDTO | null
    imagenes: string[]
    precios: PrecioProductoDTO[]
    variantes: VarianteDTO[]
    disponible: boolean
}