/**
 * Tipos para el catálogo de productos
 */

/**
 * Marca de productos
 */
export interface Marca {
  id: string;
  nombre: string;
  slug: string;
  icon: string;
}

/**
 * Información de catálogo
 */
export interface CatalogoInfo {
  slug: string;
  nombre: string;
  descripcion: string;
  mainText: string;
  marcas: Marca[];
  icon?: string;
}
