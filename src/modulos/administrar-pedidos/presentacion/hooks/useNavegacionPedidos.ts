/**
 * Hook de navegación del módulo Administrar Pedidos
 * Solo cambia de ruta; no carga datos.
 */

import { useNavigate } from 'react-router-dom'

export const RUTA_PEDIDOS_ADMIN = '/admin/pedidos'

export function useNavegacionPedidos() {
  const navigate = useNavigate()

  const irADetalle = (folio: string): void => {
    navigate(`${RUTA_PEDIDOS_ADMIN}/${encodeURIComponent(folio)}`)
  }

  const volverALista = (): void => {
    navigate(RUTA_PEDIDOS_ADMIN)
  }

  return { irADetalle, volverALista }
}
