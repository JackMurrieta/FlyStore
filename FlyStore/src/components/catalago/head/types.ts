export interface HorizontalItem {
  id: string | number;
  title: string;
  image?: string;
}

export interface ContentHeaderProps {
  nombreCatalogo: string;
  subCatalogo?: string;
  mensajeGenerico: string;
  listaDatos: HorizontalItem[];
  onBackClick: () => void;
}