import type { TipoPrecio } from './TipoPrecio';

export interface PrecioProductoTs {
  tipoPrecio: TipoPrecio;
  precio: number;
  minPiezas: number;
}
