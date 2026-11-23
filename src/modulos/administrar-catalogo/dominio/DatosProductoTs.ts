import type { EstadoProducto } from './EstadoProducto'
import type { PrecioProductoTs } from './PrecioProductoTs'

/** Alta o edición: el mismo formulario (Figma B2 / S1) cubre ambos casos. */
export type ModoFormulario = 'ALTA' | 'EDICION'

/**
 * Talla de un color dentro del formulario. Cada una es una variante vendible (color + talla).
 * Con `idVariante` ya existe en la BD: solo cambia su existencia y quitarla se marca con `quitada`
 * para poder deshacerlo antes de guardar.
 */
export interface VarianteFormularioTs {
  /** Llave local para React (no viaja al backend). */
  clave: string
  idVariante: string | null
  sku: string | null
  talla: string
  stock: number
  /** Está en algún carrito o pedido: si se quita, el backend la conserva con existencia 0. */
  conPedidos: boolean
  quitada: boolean
}

/** Foto del producto: una ya guardada (`idImagen` + `url`) o un archivo nuevo con su vista previa local. */
export interface FotoProductoTs {
  clave: string
  idImagen: string | null
  url: string | null
  archivo: File | null
  /** URL local (blob:) del archivo nuevo; el hook la libera al quitar la foto o al salir. */
  vistaPrevia: string | null
}

/** Un color del producto con sus tallas y sus fotos (las fotos se ligan al color, no a la talla). */
export interface GrupoColorTs {
  clave: string
  color: string
  /** Hex del color cuando el backend lo conoce (solo en edición). */
  hex: string | null
  variantes: VarianteFormularioTs[]
  /** En orden: la primera es la principal del color. */
  fotos: FotoProductoTs[]
}

/** Foto guardada cuyo color ya no tiene variantes (o sin color): hay que asignarle uno o quitarla. */
export interface FotoSinColorTs extends FotoProductoTs {
  color: string
}

export interface DatosProductoTs {
  clave: string
  nombre: string
  descripcion: string
  idCategoria: string
  idSubcategoria: string
  idMarca: string
  estado: EstadoProducto
  grupos: GrupoColorTs[]
  fotosSinColor: FotoSinColorTs[]
  precios: PrecioProductoTs[]
}

/** Producto cargado para editar: los datos del formulario más lo que no se puede cambiar. */
export interface ProductoEdicionTs {
  idProducto: string
  categoria: string
  estadoOriginal: EstadoProducto
  datos: DatosProductoTs
}

/** Un color «cuenta» si le queda al menos una talla que se guardará. */
export const grupoActivo = (grupo: GrupoColorTs) => grupo.variantes.some(variante => !variante.quitada)
