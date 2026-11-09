import { VarianteDTO } from './VarianteDTO';
import { PrecioProductoDTO } from './PrecioProductoDTO';

export interface ProductoCatalogoDTO {
  idProducto: string;
  clave: string;
  nombre: string;
  img: string;
  categoria: string;
  subcategoria: string;
  marca: string;
  estado: string;
  variantes: VarianteDTO[];
  preciosProducto: PrecioProductoDTO[];
}