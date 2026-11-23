/**
 * Raíz del módulo CU-02 Gestionar venta.
 * Recibe los modelos ya creados (app/contenedor.ts o el demo) y define las rutas del checkout:
 *   {rutaBase}                 → CarritoView (B1)
 *   {rutaBase}/entrega         → DatosEntregaView (B2)
 *   {rutaBase}/pago            → MetodoPagoView (B3, B4, B5, S3)
 *   {rutaBase}/confirmacion    → ConfirmarPedidoView (B6)
 *   {rutaBase}/pedido/:folio   → PedidoRegistradoView (B7)
 * Montar dentro de <RutaProtegida> en una ruta con comodín (ej. "/carrito/*").
 */

import { useMemo } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { ModelosVenta } from '../aplicacion/ModelosVenta'
import { ModelosVentaContext, type ContextoVenta } from './ModelosVentaContext'
import CarritoView from './vistas/CarritoView'
import DatosEntregaView from './vistas/DatosEntregaView'
import MetodoPagoView from './vistas/MetodoPagoView'
import ConfirmarPedidoView from './vistas/ConfirmarPedidoView'
import PedidoRegistradoView from './vistas/PedidoRegistradoView'

export interface GestionarVentaProps {
  readonly modelos: ModelosVenta
  readonly rutaBase?: string
  /** A dónde lleva B7 para subir el comprobante después (S6). */
  readonly rutaMisPedidos?: string
}

export function GestionarVenta({ modelos, rutaBase = '/carrito', rutaMisPedidos = '/mis-pedidos' }: GestionarVentaProps) {
  const contexto = useMemo<ContextoVenta>(() => ({ modelos, rutaBase, rutaMisPedidos }), [modelos, rutaBase, rutaMisPedidos])
  return (
    <ModelosVentaContext.Provider value={contexto}>
      <Routes>
        <Route index element={<CarritoView />} />
        <Route path="entrega" element={<DatosEntregaView />} />
        <Route path="pago" element={<MetodoPagoView />} />
        <Route path="confirmacion" element={<ConfirmarPedidoView />} />
        <Route path="pedido/:folio" element={<PedidoRegistradoView />} />
        <Route path="*" element={<Navigate to={rutaBase} replace />} />
      </Routes>
    </ModelosVentaContext.Provider>
  )
}

export default GestionarVenta
