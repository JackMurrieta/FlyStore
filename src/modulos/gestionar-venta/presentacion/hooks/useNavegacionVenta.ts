/**
 * useNavegacionVenta · Controlador de la navegación entre pasos (GRASP Controller).
 * Al navegar pide a los modelos lo que necesita la siguiente vista; los hooks de esa vista
 * están suscritos a los modelos y reciben la notificación (patrón Observador).
 * Solo navega después de que el modelo confirma.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSesion } from '@compartido/sesion'
import { useModelosVenta } from '../ModelosVentaContext'

export function useNavegacionVenta() {
  const { modelos, rutaBase } = useModelosVenta()
  const { pedidoEnCurso, datosEntrega, datosBancarios } = modelos
  const navegar = useNavigate()
  const { usuario } = useSesion()
  const clienteId = usuario ? String(usuario.id) : ''
  const [navegando, setNavegando] = useState(false)

  const conIndicador = async (accion: () => Promise<void>) => {
    setNavegando(true)
    try { await accion() } finally { setNavegando(false) }
  }

  /** Básico, mensajes 12–25. */
  const irDatosEntrega = () => conIndicador(async () => {
    await datosEntrega.obtenerDatosEntrega(clienteId)
    pedidoEnCurso.obtenerInformacionPedidoTs()
    navegar(`${rutaBase}/entrega`)
  })

  /** Básico, mensajes 27–38. Antes valida los datos de entrega (A5). */
  const irMetodoPago = () => conIndicador(async () => {
    if (!datosEntrega.validarDatosEntrega()) return
    await datosBancarios.obtenerDatosBancarios()
    pedidoEnCurso.obtenerInformacionPedidoTs()
    navegar(`${rutaBase}/pago`)
  })

  /** Básico, mensajes 48–57. Requiere un método de pago listo. */
  const irConfirmacion = () => conIndicador(async () => {
    if (!pedidoEnCurso.obtenerMetodoPagoTs()) return
    pedidoEnCurso.obtenerInformacionPedidoTs()
    datosEntrega.obtenerDatosEntregaTs()
    navegar(`${rutaBase}/confirmacion`)
  })

  /** Básico, mensajes 59–69. Registra, navega y pide el ticket en PDF. Si falla (A9) no navega. */
  const irPedidoRegistrado = (folio: string) => conIndicador(async () => {
    await pedidoEnCurso.registrarPedidoVenta()
    const { error, pedidoRegistrado } = pedidoEnCurso.obtenerEstado()
    if (error || !pedidoRegistrado) return
    const folioRegistrado = pedidoRegistrado.folio ?? folio
    navegar(`${rutaBase}/pedido/${encodeURIComponent(folioRegistrado)}`, { replace: true })
    void pedidoEnCurso.generarComprobantePedidoVenta(folioRegistrado)
  })

  return {
    navegando,
    irDatosEntrega,
    irMetodoPago,
    irConfirmacion,
    irPedidoRegistrado,
    irCarrito: () => navegar(rutaBase),
    irEntrega: () => navegar(`${rutaBase}/entrega`),
    irPago: () => navegar(`${rutaBase}/pago`),
    irCatalogo: () => navegar('/'),
  }
}
