import type { OpcionItemTs } from './OpcionesFiltroTs';
import type { PrecioNivelTs, VarianteTs } from './ProductoCatalogoTs';

export interface DetalleProductoTs {
    idProducto: string;
    clave?: string;
    nombre: string;
    descripcion: string;
    estado: string;
    marca: OpcionItemTs | null;
    categoria: OpcionItemTs | null;
    subcategoria: OpcionItemTs | null;
    imagenes: string[];
    precios: PrecioNivelTs[];
    variantes: VarianteTs[];
    disponible: boolean;
}