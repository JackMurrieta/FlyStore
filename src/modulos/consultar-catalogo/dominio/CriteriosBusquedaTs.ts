export type OrdenCatalogo = 'precio-asc' | 'precio-desc' | 'nombre-asc';

export interface CriteriosBusquedaTs {
    termino?: string;
    idCategoria?: string;
    marcas?: string[];
    subcategoria?: string;
    color?: string;
    precioMin?: number;
    precioMax?: number;
    soloConExistencia?: boolean;
    orden?: OrdenCatalogo;
}