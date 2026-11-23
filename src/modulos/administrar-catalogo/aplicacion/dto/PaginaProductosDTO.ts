import type { ProductoCatalogoDTO } from './ProductoCatalogoDTO'
export interface PaginaProductosDTO {
  productos: ProductoCatalogoDTO[]
  pagina: number
  tamano: number
  hayMas: boolean
}
