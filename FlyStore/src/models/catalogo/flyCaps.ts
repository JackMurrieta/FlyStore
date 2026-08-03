// importar svg
//cambiar imports por assets 
import newEra from "@/assets/marcas/flycaps/newera_logo.svg"
import bigBoss from "@/assets/marcas/flycaps/bigboss_marca.svg"
import thirtyOne from "@/assets/marcas/flycaps/thirtyOne_marca.svg"
import fino from "@/assets/marcas/flycaps/fino_marca.svg"
import barbas from "@/assets/marcas/flycaps/barbas_marca.svg"
import innedit from "@/assets/marcas/flycaps/innedit_marca.svg"
import rudeAwakenings from "@/assets/marcas/flycaps/RA_marca.svg"
import dandyHats from "@/assets/marcas/flycaps/dandyhats_marca.svg"
import baez from "@/assets/marcas/flycaps/BZ_marca.svg"
import type { Marca } from "./types";
import type { CatalogoInfo } from "./types";

const descripcionFlyCaps: string = "Descubre nuestra colección de gorras premium con diseños exclusivos, materiales de alta calidad y las marcas más reconocidas del streetwear nacional e internacional."
const mainText: string = "EXPLORA FLYCAPS"


export const marcasFlyCaps: Marca[] = [
    {
        id: "new-era",
        nombre: "New Era",
        slug: "new-era",
        icon: newEra,
    },
    {
        id: "big-boss",
        nombre: "Big Boss",
        slug: "big-boss",
        icon: bigBoss,
    },
    {
        id: "thirtyone-hats",
        nombre: "ThirtyOne Hats",
        slug: "thirtyone-hats",
        icon: thirtyOne,
    },
    {
        id: "gallo-fino",
        nombre: "Gallo Fino",
        slug: "gallo-fino",
        icon: fino,
    },
    {
        id: "barbas-hats",
        nombre: "Barbas Hats",
        slug: "barbas-hats",
        icon: barbas,
    },
    {
        id: "innedit",
        nombre: "INNEDIT",
        slug: "innedit",
        icon: innedit,
    },
    {
        id: "rude-awakenings",
        nombre: "Rude Awakenings",
        slug: "rude-awakenings",
        icon: rudeAwakenings,
    },
    {
        id: "dandy-hats",
        nombre: "Dandy Hats",
        slug: "dandy-hats",
        icon: dandyHats,
    },
    {
        id: "baez",
        nombre: "Báez",
        slug: "baez",
        icon: baez,
    },
];

export const flyCapsCatalog: CatalogoInfo = {
    slug: "flycaps",
    nombre: "FLY CAPS",
    descripcion: descripcionFlyCaps,
    mainText: mainText,
    marcas: marcasFlyCaps
};