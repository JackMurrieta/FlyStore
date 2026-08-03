export interface Marca {
    id: string;
    nombre: string;
    slug: string;
    icon: string;
}

export interface CatalogoInfo {

    slug: string;

    nombre: string;

    descripcion: string;

    mainText: string;

    marcas: Marca[];

    icon?: string;

}