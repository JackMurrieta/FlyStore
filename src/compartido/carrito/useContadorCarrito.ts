import { useContext, useEffect, useSyncExternalStore } from 'react'
import { useSesion } from '@compartido/sesion'
import { ContadorCarritoContext } from './contexto'

const sinSuscripcion = () => () => {}
const sinProductos = () => null

/**
 * Productos distintos en el carrito del cliente con sesión.
 * null si no hay cliente, si aún no se conoce o si no hay proveedor.
 */
export function useContadorCarrito(): number | null {
  const contador = useContext(ContadorCarritoContext)
  const { estado, usuario } = useSesion()
  const clienteId = estado === 'autenticado' && usuario?.rol === 'CLIENTE' ? String(usuario.id) : null
  const productos = useSyncExternalStore(
    contador?.suscribir ?? sinSuscripcion,
    contador?.obtenerProductos ?? sinProductos,
  )

  useEffect(() => {
    if (contador && clienteId) contador.cargar(clienteId)
  }, [contador, clienteId])

  return clienteId ? productos : null
}
