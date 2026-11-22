export interface OpcionItemTs {
    id: string;
    nombre: string;
}

export interface OpcionesFiltroTs {
    categorias: OpcionItemTs[];
    marcas: OpcionItemTs[];
}