import { useLocation } from "react-router-dom";
import { catalogos } from "../data/catalogos";
import type { CatalogoInfo } from "../types";

export function useCurrentCatalog(): CatalogoInfo | null {

  const { pathname } = useLocation();

  const slug = pathname.split("/")[1];

  return (
    catalogos[slug as keyof typeof catalogos] ??
    null
  );
}