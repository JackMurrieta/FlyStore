import type { VarianteDTO } from './VarianteDTO'
import type { PrecioProductoDTO } from './PrecioProductoDTO'
import type { ImagenColorDTO } from './ImagenColorDTO'

/** Parte `producto` (JSON) de POST /api/productos; los archivos viajan en la parte `imagenes`. */
export interface CrearProductoDTO {
  clave: string
  nombre: string
  descripcion: string
  idCategoria: string
  idSubcategoria: string
  idMarca: string
  imagenes: ImagenColorDTO[]
  variantes: VarianteDTO[]
  preciosProducto: PrecioProductoDTO[]
  estado: string
}
