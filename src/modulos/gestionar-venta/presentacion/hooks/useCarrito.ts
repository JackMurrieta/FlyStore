/**
 * useCarrito · ViewModel de CarritoView (B1, S1, S7, A3, A11).
 * Básico: cargarCarrito (mensaje 2). Alt1: actualizarCantidad. Alt2: aplicarCodigoDescuento.
 */

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { useSesion } from '@compartido/sesion'
import type { CarritoTs, LineaCarritoTs } from '../../dominio/CarritoTs'
import { useModelosVenta } from '../ModelosVentaContext'

export function useCarrito() {
  const { modelos } = useModelosVenta()
  const modelo = modelos.pedidoEnCurso
  const estado = useSyncExternalStore(modelo.suscribir, modelo.obtenerEstado)
  const { usuario } = useSesion()
  const clienteId = usuario ? String(usuario.id) : ''
  const [codigoCapturado, setCodigoCapturado] = useState('')
  const [lineaPorEliminar, setLineaPorEliminar] = useState<LineaCarritoTs | null>(null)

  /** Básico, mensaje 2. */
  const cargarCarrito = useCallback(
    (): Promise<CarritoTs | null> => modelo.obtenerPedidoVentaEnCurso(clienteId),
    [modelo, clienteId]
  )

  useEffect(() => {
    void cargarCarrito()
  }, [cargarCarrito])

  /** Alt1, mensaje 2. */
  const actualizarCantidad = (varianteProductoId: number, cantidad: number): Promise<CarritoTs | null> =>
    modelo.actualizarCantidad(varianteProductoId, cantidad)

  /** Alt2, mensaje 2. Si se aplica, limpia el campo para canjear otro código. */
  const aplicarCodigoDescuento = async (codigo: string): Promise<CarritoTs | null> => {
    const carrito = await modelo.aplicarCodigoDescuento(codigo)
    if (carrito) setCodigoCapturado('')
    return carrito
  }

  const capturarCodigo = (valor: string) => {
    setCodigoCapturado(valor)
    modelo.limpiarErrorCodigo()
  }

  /** S1 · Eliminar producto: primero confirma; quitar = cantidad 0. */
  const confirmarEliminar = async () => {
    if (!lineaPorEliminar) return
    const carrito = await modelo.actualizarCantidad(lineaPorEliminar.varianteProductoId, 0)
    if (carrito) setLineaPorEliminar(null)
  }

  return {
    carrito: estado.carrito,
    cargando: estado.cargando && !estado.carrito,
    actualizando: estado.actualizando,
    error: estado.error,
    errorCodigo: estado.errorCodigo,
    codigoCapturado,
    lineaPorEliminar,
    cargarCarrito,
    actualizarCantidad,
    aplicarCodigoDescuento,
    capturarCodigo,
    solicitarEliminar: (linea: LineaCarritoTs) => setLineaPorEliminar(linea),
    cancelarEliminar: () => setLineaPorEliminar(null),
    confirmarEliminar,
  }
}
