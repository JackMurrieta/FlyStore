export interface CatalogoItemDTO {
    id: string
    nombre: string
}

export interface OpcionesFiltroRespuestaDTO {
    categorias: CatalogoItemDTO[]
    marcas: CatalogoItemDTO[]
}