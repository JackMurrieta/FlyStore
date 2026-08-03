
import type { Marca } from "./types";
import type { CatalogoInfo } from "./types";
import newEra from "../../assets/images/marcas/new-era.png";

export const descripcionFlyShoes: string = "Colección de sneakers y calzado urbano para complementar cualquier estilo, desde modelos clásicos hasta ediciones especiales y limitadas.";


const mainText: string = "EXPLORA FLYSHOES"
//agregar marcas de flyShoes
const marcasFlyShoes: Marca[] = [

    {
        id: "new-era",
        nombre: "New Era",
        slug: "new-era",
        icon: newEra,
    },

];

export const flyShoesCatalog: CatalogoInfo = {
    slug: "flyshoes",
    nombre: "Fly Shoes",
    descripcion: descripcionFlyShoes,
    mainText: mainText,
    marcas: marcasFlyShoes,
};
