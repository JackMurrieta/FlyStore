/**
 * Raíz de la pantalla S6 «Mis pedidos» del CU-02 (subir el comprobante después).
 * Comparte los modelos del CU-02 (usa PedidoModel). Montar dentro de <RutaProtegida>.
 */

import { useMemo } from 'react'
import type { ModelosVenta } from '../aplicacion/ModelosVenta'
import { ModelosVentaContext, type ContextoVenta } from './ModelosVentaContext'
import MisPedidosView from './vistas/MisPedidosView'

export interface MisPedidosProps {
  readonly modelos: ModelosVenta
  /** Ruta del carrito (para «Hacer un nuevo pedido» y la navegación compartida). */
  readonly rutaCarrito?: string
  readonly rutaMisPedidos?: string
}

export function MisPedidos({ modelos, rutaCarrito = '/carrito', rutaMisPedidos = '/mis-pedidos' }: MisPedidosProps) {
  const contexto = useMemo<ContextoVenta>(
    () => ({ modelos, rutaBase: rutaCarrito, rutaMisPedidos }),
    [modelos, rutaCarrito, rutaMisPedidos]
  )
  return (
    <ModelosVentaContext.Provider value={contexto}>
      <MisPedidosView />
    </ModelosVentaContext.Provider>
  )
}

export default MisPedidos
