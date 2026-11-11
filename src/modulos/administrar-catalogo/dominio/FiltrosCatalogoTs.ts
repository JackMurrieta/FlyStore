import type { EstadoProducto } from './EstadoProducto';

export interface FiltrosCatalogoTs {
  texto: string;
  idCategoria: string;
  idSubcategoria: string;
  idMarca: string;
  estado: EstadoProducto | null;
}
