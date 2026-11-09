import { EstadoProducto } from './enums/EstadoProducto';

export interface FiltrosCatalogoTs {
  texto: string;
  idCategoria: string;
  idSubcategoria: string;
  idMarca: string;
  estado: EstadoProducto | null;
}