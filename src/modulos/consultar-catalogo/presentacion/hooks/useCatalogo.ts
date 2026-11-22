import { useCallback, useSyncExternalStore } from 'react'
import type { CatalogoEnCursoModel } from '../../aplicacion/CatalogoEnCursoModel'
import type { CriteriosBusquedaTs } from '../../dominio/CriteriosBusquedaTs'

export function useCatalogo(modelo: CatalogoEnCursoModel) {
    const estado = useSyncExternalStore(
        modelo.suscribir,
        modelo.obtenerEstado,
        modelo.obtenerEstado
    )

    const cargarCatalogo = useCallback(async (): Promise<void> => {
        await modelo.cargarCatalogoInicial()
    }, [modelo])

    const aplicarFiltro = useCallback(
        async (criterios: CriteriosBusquedaTs): Promise<void> => {
            await modelo.filtrarCatalogo(criterios)
        },
        [modelo]
    )

    const actualizarFiltrosVisuales = useCallback(
        (cambios: Partial<CriteriosBusquedaTs>): void => {
            modelo.actualizarFiltrosVisuales(cambios)
        },
        [modelo]
    )

    const limpiarFiltros = useCallback(async (): Promise<void> => {
        await modelo.limpiarFiltros()
    }, [modelo])

    return {
        productos: estado.productosVisibles,
        productosBase: estado.productosBase,
        opcionesFiltro: estado.opcionesFiltro,
        criterios: estado.criterios,
        cargando: estado.cargandoCatalogo,
        error: estado.errorCatalogo,
        sinResultados: estado.sinResultados,
        cargarCatalogo,
        aplicarFiltro,
        actualizarFiltrosVisuales,
        limpiarFiltros,
    }
}