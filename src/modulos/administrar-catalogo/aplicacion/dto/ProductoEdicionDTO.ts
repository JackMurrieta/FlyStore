import type { PrecioProductoDTO } from './PrecioProductoDTO'

export interface VarianteAdminDTO {
  idVariante: string
  sku: string | null
  idTalla: string | null
  /** null en variantes cargadas sin talla (p. ej. borradores importados). */
  talla: string | null
  idColor: string | null
  color: string
  hex: string | null
  stock: number
  /** Está en algún carrito o pedido: al quitarla el backend la deja con existencia 0. */
  conPedidos: boolean
}

export interface ImagenAdminDTO {
  idImagen: string
  url: string
  idColor: string | null
  color: string | null
  orden: number | null
}

/** Respuesta de GET y PUT /api/productos/{id}: el producto como lo necesita el formulario. */
export interface ProductoEdicionDTO {
  idProducto: string
  clave: string
  nombre: string
  descripcion: string
  idCategoria: string
  categoria: string
  idSubcategoria: string
  subcategoria: string
  idMarca: string
  marca: string
  estado: string
  variantes: VarianteAdminDTO[]
  preciosProducto: PrecioProductoDTO[]
  imagenes: ImagenAdminDTO[]
}
