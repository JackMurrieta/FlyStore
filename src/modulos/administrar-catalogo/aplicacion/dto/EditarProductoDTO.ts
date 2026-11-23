import type { PrecioProductoDTO } from './PrecioProductoDTO'
import type { ImagenColorDTO } from './ImagenColorDTO'
import type { VarianteEdicionDTO } from './VarianteEdicionDTO'

/**
 * Cuerpo de PUT /api/productos/{id}. Lo que no se manda se quita (variantes, imágenes y precios);
 * el orden de `imagenes` es el nuevo orden de la galería. La línea (categoría) no cambia.
 */
export interface EditarProductoDTO {
  clave: string
  nombre: string
  descripcion: string
  idSubcategoria: string
  idMarca: string
  estado: string
  variantes: VarianteEdicionDTO[]
  preciosProducto: PrecioProductoDTO[]
  imagenes: ImagenColorDTO[]
}
