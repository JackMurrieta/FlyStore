import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { GestionarVenta, MisPedidos, crearModelosVenta } from '@modulos/gestionar-venta'
import { crearGatewayVentaDemo } from './gatewayVentaDemo'
import estilos from './AdministrarCatalogoDemo.module.css'

const RUTA_BASE = '/dev/gestionar-venta'
const RUTA_MIS_PEDIDOS = `${RUTA_BASE}/mis-pedidos`

/**
 * Ruta de desarrollo /dev/gestionar-venta: el CU-02 completo con un gateway en memoria.
 * /dev/gestionar-venta/mis-pedidos muestra S6 con pedidos de muestra.
 */
export default function GestionarVentaDemo() {
  const [modelos] = useState(() => crearModelosVenta(crearGatewayVentaDemo()))

  return <>
    <div className={estilos.aviso} role="note">
      <strong>Modo de prueba · Gestionar venta</strong>
      <span>Datos en memoria, sin backend. Prueba el código FLY10, los tres métodos de pago y «Mis pedidos» en {RUTA_MIS_PEDIDOS}. Recarga para reiniciar.</span>
    </div>
    <Routes>
      <Route path="mis-pedidos" element={<MisPedidos modelos={modelos} rutaCarrito={RUTA_BASE} rutaMisPedidos={RUTA_MIS_PEDIDOS} />} />
      <Route path="*" element={<GestionarVenta modelos={modelos} rutaBase={RUTA_BASE} rutaMisPedidos={RUTA_MIS_PEDIDOS} />} />
    </Routes>
  </>
}
