import { EstadoProducto } from './enums/EstadoProducto';
import { VarianteProductoTs } from './VarianteProductoTs';
import { PrecioProductoTs } from './PrecioProductoTs';

export interface DatosProductoTs {
  clave: string;
  nombre: string;
  descripcion: string;
  idCategoria: string;
  idSubcategoria: string;
  idMarca: string;
  imagenes: string;
  estado: EstadoProducto;
  variantes: VarianteProductoTs[];
  precios: PrecioProductoTs[];
}