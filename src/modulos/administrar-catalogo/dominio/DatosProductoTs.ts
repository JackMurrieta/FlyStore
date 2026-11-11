import type { EstadoProducto } from './EstadoProducto';
import type { VarianteProductoTs } from './VarianteProductoTs';
import type { PrecioProductoTs } from './PrecioProductoTs';

export interface DatosProductoTs {
  clave: string;
  nombre: string;
  descripcion: string;
  idCategoria: string;
  idSubcategoria: string;
  idMarca: string;
  imagenes: File | null;
  estado: EstadoProducto;
  variantes: VarianteProductoTs[];
  precios: PrecioProductoTs[];
}
