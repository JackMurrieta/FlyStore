import type { CatalogoItemDTO } from './CatalogoItemDTO';

export interface OpcionesCatalogoDTO {
  categorias: CatalogoItemDTO[];
  subcategorias: CatalogoItemDTO[];
  colores?: string[];
  marcas: CatalogoItemDTO[];
}
