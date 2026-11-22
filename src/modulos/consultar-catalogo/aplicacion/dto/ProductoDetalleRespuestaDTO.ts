import type { LineaDTO, PrecioReferenciaDTO } from './CatalogoRespuestaDTO'

/** Respuesta de GET /api/catalogo/productos/{id} (ProductoDetalleRespuestaDTO del backend). */

export interface ElementoCatalogoDTO {
  id: number
  nombre: string
}

export interface ImagenProductoDTO {
  url: string
  idColor: number | null
  orden: number | null
}

export interface VarianteVentaDTO {
  idVariante: number
  sku: string | null
  idColor: number | null
  color: string | null
  hex: string | null
  idTalla: number | null
  talla: string | null
  idTipoTalla: number | null
  tipoTalla: string | null
  unidadMedida: string | null
  existencia: number
  disponible: boolean
}

export interface NivelPrecioCatalogoDTO {
  tipoPrecio: string
  minPiezas: number
  precio: number
  referencia: boolean
}

export interface ProductoDetalleRespuestaDTO {
  idProducto: number
  clave: string
  nombre: string
  descripcion: string | null
  estado: string
  linea: LineaDTO
  marca: ElementoCatalogoDTO
  subcategoria: ElementoCatalogoDTO
  imagenes: ImagenProductoDTO[]
  variantes: VarianteVentaDTO[]
  precios: NivelPrecioCatalogoDTO[]
  precioReferencia: PrecioReferenciaDTO
  cantidadInicial: number
  existenciaTotal: number
  disponible: boolean
}
