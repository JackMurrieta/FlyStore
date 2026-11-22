import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { CatalogoEnCursoModel } from '../../aplicacion/CatalogoEnCursoModel'
import type { VarianteTs } from '../../dominio/ProductoCatalogoTs'

export function useDetalleProducto(modelo: CatalogoEnCursoModel) {
    const estado = useSyncExternalStore(
        modelo.suscribir,
        modelo.obtenerEstado,
        modelo.obtenerEstado
    )

    const [skuSeleccionado, setSkuSeleccionado] = useState<string | null>(null)
    const [cantidad, setCantidad] = useState<number>(1)

    const cargarDetalles = useCallback(
        async (idProducto: string): Promise<void> => {
            setSkuSeleccionado(null)
            setCantidad(1)
            await modelo.obtenerDetalles(idProducto)
        },
        [modelo]
    )

    // Preselecciona la primera variante disponible cuando llega el detalle
    // Preselecciona la primera variante disponible cuando llega el detalle
    useEffect(() => {
        const variantes = estado.detalleActual?.variantes ?? []
        const primeraActiva =
            variantes.find((v) => v.activa && v.stock > 0) ?? variantes[0]
        setSkuSeleccionado(primeraActiva?.sku ?? null)
        setCantidad(1)
    }, [estado.detalleActual])

    const varianteSeleccionada: VarianteTs | null = useMemo(() => {
        const variantes = estado.detalleActual?.variantes ?? []
        if (!skuSeleccionado) return null
        return variantes.find((v) => v.sku === skuSeleccionado) ?? null
    }, [estado.detalleActual, skuSeleccionado])

    const seleccionarVariante = useCallback((sku: string): void => {
        setSkuSeleccionado(sku)
        setCantidad(1)
    }, [])

    const validarDisponibilidad = useCallback((): boolean => {
        if (!estado.detalleActual?.disponible) return false
        if (!varianteSeleccionada) return false
        return varianteSeleccionada.activa && varianteSeleccionada.stock > 0
    }, [estado.detalleActual, varianteSeleccionada])

    const puedeAgregarAlCarrito = validarDisponibilidad()

    const cambiarCantidad = useCallback(
        (nuevaCantidad: number): void => {
            const maxStock = varianteSeleccionada?.stock ?? 1
            const segura = Math.max(1, Math.min(nuevaCantidad, Math.max(1, maxStock)))
            setCantidad(segura)
        },
        [varianteSeleccionada]
    )

    return {
        detalle: estado.detalleActual,
        cargando: estado.cargandoDetalle,
        error: estado.errorDetalle,
        varianteSeleccionada,
        skuSeleccionado,
        cantidad,
        puedeAgregarAlCarrito,
        cargarDetalles,
        seleccionarVariante,
        validarDisponibilidad,
        cambiarCantidad,
    }
}