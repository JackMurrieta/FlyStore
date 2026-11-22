import type { OpcionesFiltroRespuestaDTO } from './OpcionesFiltroRespuestaDTO'

export interface PrecioProductoDTO {
    tipoPrecio: string
    precio: number
    minPiezas: number
}

export interface VarianteDTO {
    talla: string
    color: string
    stock: number
}

export interface ProductoCatalogoDTO {
    idProducto: string
    clave: string
    nombre: string
    img: string
    categoria: string
    subcategoria: string
    marca: string
    estado: string
    variantes: VarianteDTO[]
    preciosProducto: PrecioProductoDTO[]
}

export interface CatalogoRespuestaDTO {
    productos: ProductoCatalogoDTO[]
    opcionesFiltro: OpcionesFiltroRespuestaDTO | null
}