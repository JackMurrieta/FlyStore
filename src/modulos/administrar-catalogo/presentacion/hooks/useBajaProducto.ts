import { useRef, useState } from 'react'
import type { BajaProductoModel } from '../../aplicacion/BajaProductoModel'
import type { ProductoCatalogoTs } from '../../dominio/ProductoCatalogoTs'
import type { ResultadoBajaTs } from '../../dominio/ResultadoBajaTs'
import { mensajeError } from './useCatalogoAdmin'

export function useBajaProducto(model: BajaProductoModel) {
  const [producto, setProducto] = useState<ProductoCatalogoTs | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [resultado, setResultado] = useState<ResultadoBajaTs | null>(null)
  const [error, setError] = useState<string | null>(null)
  const ocupado = useRef(false)

  const solicitarBaja = (seleccionado: ProductoCatalogoTs) => {
    if (ocupado.current) return
    setProducto(seleccionado); setError(null); setResultado(null)
  }
  const cancelarBaja = () => { if (!ocupado.current) { setProducto(null); setError(null) } }
  const confirmarBaja = async () => {
    if (!producto || ocupado.current) return false
    ocupado.current = true; setConfirmando(true); setError(null)
    try {
      setResultado(await model.darDeBaja(producto.idProducto))
      setProducto(null)
      return true
    } catch (e) { setError(mensajeError(e)); return false }
    finally { ocupado.current = false; setConfirmando(false) }
  }
  return { producto, confirmando, resultado, error, solicitarBaja, cancelarBaja, confirmarBaja }
}
