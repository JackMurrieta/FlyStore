import type { CatalogoItemTs } from './CatalogoItemTs';

export interface FiltrosDisponiblesTs {
  categorias: CatalogoItemTs[];
  subcategorias: CatalogoItemTs[];
  colores?: string[];
  marcas: CatalogoItemTs[];
}
