import { createContext } from 'react'
import type { IContadorCarrito } from './IContadorCarrito'

/** Contador del carrito inyectado por la app (null en pruebas y demos). */
export const ContadorCarritoContext = createContext<IContadorCarrito | null>(null)
