/** Respuesta de GET /api/catalogo/{linea} y GET /api/catalogo/buscar (CatalogoRespuestaDTO del backend). */

export interface LineaDTO {
  id: number
  nombre: string
  ruta: string
  logoUrl: string | null
}

export interface PrecioReferenciaDTO {
  tipoPrecio: string
  precio: number
  minPiezas: number
}

export interface ColorTarjetaDTO {
  idColor: number
  nombre: string
  hex: string | null
  imagenUrl: string | null
}

export interface ProductoTarjetaDTO {
  idProducto: number
  clave: string
  nombre: string
  marca: string | null
  subcategoria: string | null
  imagenUrl: string | null
  precio: PrecioReferenciaDTO | null
  colores: ColorTarjetaDTO[] | null
  /** Con filtro de color: el color buscado (ya va primero en `colores` e `imagenUrl` es su foto). */
  idColorDestacado?: number | null
}

export interface OpcionFiltroDTO {
  id: number
  nombre: string
  cantidad: number
}

export interface MarcaFiltroDTO extends OpcionFiltroDTO {
  logoUrl: string | null
}

export interface ColorFiltroDTO extends OpcionFiltroDTO {
  hex: string | null
}

export interface TipoTallaFiltroDTO {
  id: number
  nombre: string
  unidadMedida: string | null
  tallas: OpcionFiltroDTO[]
}

export interface OpcionesFiltroRespuestaDTO {
  marcas: MarcaFiltroDTO[]
  subcategorias: OpcionFiltroDTO[]
  colores: ColorFiltroDTO[]
  tiposTalla: TipoTallaFiltroDTO[]
  unidadesMedida: string[]
  rangoPrecio: { minimo: number | null; maximo: number | null } | null
  /** id = valor del parámetro orden; nombre = etiqueta. */
  ordenes: { id: string; nombre: string }[]
}

export interface LineaConteoDTO {
  id: number
  nombre: string
  ruta: string
  cantidad: number
}

export interface CatalogoRespuestaDTO {
  linea: LineaDTO | null
  productos: ProductoTarjetaDTO[]
  opcionesFiltro: OpcionesFiltroRespuestaDTO
  pagina: number
  tamanoPagina: number
  total: number
  hayMas: boolean
  tipoPrecioReferencia: string
  sugerencias: ProductoTarjetaDTO[]
  lineas: LineaConteoDTO[] | null
}
