/**
 * Raíz del módulo CU-01 Consultar catálogo (tienda pública).
 * Recibe los modelos ya creados (app/contenedor.ts) y pinta la pantalla que pide la ruta:
 *   /categoria/:linea            → MarcasLineaView (B2: marcas de la línea)
 *   /categoria/:linea/productos  → CatalogoView     (B3: catálogo con filtros)
 *   /buscar?texto=…              → CatalogoView     (S1: búsqueda en toda la tienda)
 *   /producto/:id                → DetalleProductoView (S2: ficha y «Agregar al carrito»)
 * Las rutas son públicas; «Agregar al carrito» pide sesión de cliente (lo liga con el CU-02).
 */

import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { ModelosCatalogo } from '../aplicacion/ModelosCatalogo'
import { ModelosCatalogoContext, type ContextoCatalogo } from './ModelosCatalogoContext'
import MarcasLineaView from './vistas/MarcasLineaView'
import CatalogoView from './vistas/CatalogoView'
import DetalleProductoView from './vistas/DetalleProductoView'
import { useDesplazamientoTienda } from './hooks/useDesplazamiento'

export type VistaTienda = 'marcas' | 'catalogo' | 'busqueda' | 'detalle'

export interface CatalogoTiendaProps {
  readonly modelos: ModelosCatalogo
  readonly vista: VistaTienda
}

export function CatalogoTienda({ modelos, vista }: CatalogoTiendaProps) {
  const contexto = useMemo<ContextoCatalogo>(() => ({ modelos }), [modelos])
  return (
    <ModelosCatalogoContext.Provider value={contexto}>
      <VistaActual vista={vista} />
    </ModelosCatalogoContext.Provider>
  )
}

function VistaActual({ vista }: { readonly vista: VistaTienda }) {
  const { linea = '', id = '' } = useParams<{ linea: string; id: string }>()
  const ruta = linea.toLowerCase()
  useDesplazamientoTienda()
  switch (vista) {
    case 'marcas':
      return <MarcasLineaView key={ruta} ruta={ruta} />
    case 'catalogo':
      return <CatalogoView key={ruta} modo={{ tipo: 'linea', ruta }} />
    case 'busqueda':
      return <CatalogoView modo={{ tipo: 'busqueda' }} />
    case 'detalle':
      return <DetalleProductoView key={id} />
  }
}

export default CatalogoTienda
