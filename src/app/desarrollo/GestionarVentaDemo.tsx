import { useState } from 'react'
import { GestionarVenta, crearModelosVenta } from '@modulos/gestionar-venta'
import { crearGatewayVentaDemo } from './gatewayVentaDemo'
import estilos from './AdministrarCatalogoDemo.module.css'

/** Ruta de desarrollo /dev/gestionar-venta: el CU-02 completo con un gateway en memoria. */
export default function GestionarVentaDemo() {
  const [modelos] = useState(() => crearModelosVenta(crearGatewayVentaDemo()))

  return <>
    <div className={estilos.aviso} role="note">
      <strong>Modo de prueba · Gestionar venta</strong>
      <span>Datos en memoria, sin backend. Prueba el código FLY10 y los tres métodos de pago. Recarga para reiniciar.</span>
    </div>
    <GestionarVenta modelos={modelos} rutaBase="/dev/gestionar-venta" />
  </>
}
