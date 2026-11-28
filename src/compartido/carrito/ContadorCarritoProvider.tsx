/**
 * Proveedor del contador del carrito (inyección de dependencias, igual que SesionProvider).
 * Sin proveedor (pruebas, demos) el encabezado simplemente no muestra el contador.
 */

import type { ReactNode } from 'react'
import type { IContadorCarrito } from './IContadorCarrito'
import { ContadorCarritoContext } from './contexto'

export interface ContadorCarritoProviderProps {
  readonly contador: IContadorCarrito
  readonly children: ReactNode
}

export function ContadorCarritoProvider({ contador, children }: ContadorCarritoProviderProps) {
  return <ContadorCarritoContext.Provider value={contador}>{children}</ContadorCarritoContext.Provider>
}
