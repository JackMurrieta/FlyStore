export const EstadoProducto = {
  PUBLICADO: 'PUBLICADO',
  BORRADOR: 'BORRADOR',
  INACTIVO: 'INACTIVO',
}

export type EstadoProducto = (typeof EstadoProducto)[keyof typeof EstadoProducto];
