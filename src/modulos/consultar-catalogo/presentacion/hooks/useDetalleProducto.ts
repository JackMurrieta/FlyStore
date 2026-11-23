import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { useSesion } from '@compartido/sesion'
import type { CompradorTs } from '../../aplicacion/DetalleProductoModel'
import {
  coloresDeVariantes, imagenesDeColor, nivelPorCantidad, siguienteNivel, variantesDeColor,
} from '../../dominio/ReglasCatalogo'
import { useModelosCatalogo } from '../ModelosCatalogoContext'

/** Quién ve la ficha según la sesión compartida. */
export function useComprador(): CompradorTs {
  const { estado, usuario } = useSesion()
  if (estado === 'cargando') return 'verificando'
  if (estado !== 'autenticado' || !usuario) return 'anonimo'
  return usuario.rol === 'CLIENTE' ? 'cliente' : 'personal'
}

/**
 * Ficha del producto (S2). {@code completarPendiente}: se volvió de iniciar sesión o confirmar la cuenta
 * (la URL trae «agregar=1») y hay que agregar lo que quedó pendiente.
 */
export function useDetalleProducto(idProducto: number, idColorPreferido: number | null, completarPendiente: boolean) {
  const { detalle: modelo } = useModelosCatalogo().modelos
  const estado = useSyncExternalStore(modelo.suscribir, modelo.obtenerEstado, modelo.obtenerEstado)
  const comprador = useComprador()

  useEffect(() => {
    if (Number.isInteger(idProducto) && idProducto > 0) void modelo.cargar(idProducto, idColorPreferido)
    // El color de la URL solo elige la variante inicial; cambiarlo después no recarga la ficha.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelo, idProducto])

  const listo = estado.detalle?.id === idProducto
  useEffect(() => {
    if (completarPendiente && listo && (comprador === 'cliente' || comprador === 'personal')) {
      void modelo.completarPendiente(comprador)
    }
  }, [modelo, completarPendiente, listo, comprador])

  const derivados = useMemo(() => {
    const detalle = estado.detalle
    if (!detalle) return null
    const variante = detalle.variantes.find(v => v.id === estado.idVariante) ?? null
    const nivel = nivelPorCantidad(detalle.precios, estado.cantidad)
    return {
      variante,
      colores: coloresDeVariantes(detalle.variantes),
      tallas: variantesDeColor(detalle.variantes, estado.idColor),
      galeria: imagenesDeColor(detalle.imagenes, estado.idColor),
      nivel,
      siguiente: siguienteNivel(detalle.precios, estado.cantidad),
      subtotal: (nivel?.precio ?? 0) * estado.cantidad,
    }
  }, [estado.detalle, estado.idVariante, estado.idColor, estado.cantidad])

  return {
    ...estado,
    derivados,
    comprador,
    elegirColor: modelo.elegirColor,
    elegirVariante: modelo.elegirVariante,
    cambiarCantidad: modelo.cambiarCantidad,
    agregar: () => modelo.agregarAlCarrito(comprador),
    cerrarDialogoSesion: modelo.cerrarDialogoSesion,
    cerrarAgregado: modelo.cerrarAgregado,
    reintentar: () => modelo.cargar(idProducto, estado.idColor),
  }
}
