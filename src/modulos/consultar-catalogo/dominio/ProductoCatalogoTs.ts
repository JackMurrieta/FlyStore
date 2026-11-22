export interface PrecioNivelTs {
    tipoPrecio: string;
    precio: number;
    cantidadMinima?: number;
}

export interface VarianteTs {
    id: string;
    sku: string;
    talla: string;
    color: string;
    colorHex?: string;
    stock: number;
    activa: boolean;
}

export interface ProductoCatalogoTs {
    id: string;
    clave: string;
    nombre: string;
    descripcion: string;
    marca: string;
    categoria: string;
    subcategoria: string;
    imagenPrincipal: string;
    precioBase: number;
    precios: PrecioNivelTs[];
    variantes: VarianteTs[];
    disponible: boolean;
}