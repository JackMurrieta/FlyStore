import { EstadoProducto } from './enums/EstadoProducto';
import { VarianteProductoTs } from './VarianteProductoTs';
import { PrecioProductoTs } from './PrecioProductoTs';

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