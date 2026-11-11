import type { EstadoProducto } from './EstadoProducto';
import type { VarianteProductoTs } from './VarianteProductoTs';
import type { PrecioProductoTs } from './PrecioProductoTs';

export interface ProductoCatalogoTs {
  idProducto: string;
  clave: string;
  nombre: string;
  imagen: string;
  categoria: string;
  subcategoria: string;
  marca: string;
  existencias: number;
  estado: EstadoProducto;
  variantes: VarianteProductoTs[];
  precios: PrecioProductoTs[];
}
