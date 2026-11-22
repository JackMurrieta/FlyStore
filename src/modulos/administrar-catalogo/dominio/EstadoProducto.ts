export const EstadoProducto = {
  PUBLICADO: 'PUBLICADO',
  STOCK_BAJO: 'STOCK_BAJO',
  BORRADOR: 'BORRADOR',
  INACTIVO: 'INACTIVO',
}

export type EstadoProducto = (typeof EstadoProducto)[keyof typeof EstadoProducto];
