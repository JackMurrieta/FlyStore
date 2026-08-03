
import type { Marca } from "./types";
import type { CatalogoInfo } from "./types";
import newEra from "../../assets/images/marcas/new-era.png";

export const descripcionFlyEssence : string = "Encuentra perfumes originales, fragancias árabes y decants cuidadosamente seleccionados para ofrecer aromas exclusivos y de larga duración."

const mainText: string = "EXPLORA FLYESSENCE"
//agregar marcas de flyEssence
const marcasFlyEssence: Marca[] = [

    {
        id: "new-era",
        nombre: "New Era",
        slug: "new-era",
        icon: newEra,
    },

];

export const flyEssenceCatalog: CatalogoInfo = {
    slug:"flyessence",
    nombre:"Fly Essence",
    descripcion:descripcionFlyEssence,
    mainText: mainText,
    marcas: marcasFlyEssence,
};
