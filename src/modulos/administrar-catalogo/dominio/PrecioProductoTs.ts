import { TipoPrecio } from './enums/TipoPrecio';

export interface PrecioProductoTs {
  tipoPrecio: TipoPrecio;
  precio: number;
  minPiezas: number;
}