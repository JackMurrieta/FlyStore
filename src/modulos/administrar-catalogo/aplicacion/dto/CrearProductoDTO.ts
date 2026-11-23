import type { VarianteDTO } from './VarianteDTO'
import type { PrecioProductoDTO } from './PrecioProductoDTO'
export interface CrearProductoDTO {
  clave: string;
  nombre: string;
  descripcion: string;
  idCategoria: string;
  idSubcategoria: string;
  idMarca: string;
  imagenes: File;
  variantes: VarianteDTO[];
  preciosProducto: PrecioProductoDTO[];
  estado: string;
}