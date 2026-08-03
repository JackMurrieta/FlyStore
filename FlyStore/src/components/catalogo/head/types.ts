import type { HorizontalItem } from "./HorizontalList";

export interface ContentHeaderProps {
  nombreCatalogo: string;
  subCatalogo?: string;
  mensajeGenerico: string;
  listaDatos: HorizontalItem[];
  onBackClick: () => void;
}