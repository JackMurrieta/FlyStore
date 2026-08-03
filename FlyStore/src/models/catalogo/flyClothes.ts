import type { Marca } from "./types";
import type { CatalogoInfo } from "./types";
import newEra from "../../assets/images/marcas/new-era.png";


const descripcionFlyClothes : string = "Explora prendas diseñadas para quienes buscan estilo, comodidad y calidad. Ropa premium, deportiva y streetwear seleccionada para destacar en la calle.";
const mainText: string = "EXPLORA FLYCLOTHES"
//agregar marcas de flyClothes
const marcasFlyClothes: Marca[] = [

    {
        id: "new-era",
        nombre: "New Era",
        slug: "new-era",
        icon: newEra,
    },

];

export const flyClothesCatalog: CatalogoInfo = {
    slug:"flyclothes",
    nombre:"Fly Clothes",
    descripcion:descripcionFlyClothes,
    mainText: mainText,
    marcas: marcasFlyClothes,
};