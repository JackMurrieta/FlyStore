/**
 * Botón «Agregar al carrito» de la ficha (CU-01 · S2) con animación de producto agregado:
 *
 *  reposo    → ícono del carrito + «Agregar al carrito» (o «Agotado»).
 *  cargando  → entra un carrito y cae un producto dentro mientras responde el backend.
 *  saliendo  → el backend confirmó: el carrito sale hacia la derecha con el producto.
 *  agregado  → «Agregado ✓» durante 2 s y regresa a reposo.
 *  fallo     → el backend falló: el carrito sale vacío, el texto se desvanece y la ficha muestra el error.
 *
 * El estado del agregado lo lleva el DetalleProductoModel; aquí solo se anima (presentación).
 */

import { useEffect, useState } from 'react'
import { Icono } from '@compartido/ui'
import estilos from './detalle.module.css'

type FaseAgregar = 'reposo' | 'cargando' | 'saliendo' | 'agregado' | 'fallo'

/** Tiempos (ms). La carga dura al menos lo que tarda el producto en caer al carrito. */
const DURACION = { cargaMinima: 760, salida: 560, agregado: 2000, fallo: 480 } as const

export interface BotonAgregarCarritoProps {
  /** La variante elegida tiene existencia. */
  readonly disponible: boolean
  /** Mientras se verifica la sesión no se puede agregar. */
  readonly deshabilitado: boolean
  /** El backend está agregando la variante. */
  readonly agregando: boolean
  /** El último agregado salió bien (la ficha muestra el aviso «Agregado al carrito»). */
  readonly agregado: boolean
  readonly alAgregar: () => void
}

export function BotonAgregarCarrito({ disponible, deshabilitado, agregando, agregado, alAgregar }: BotonAgregarCarritoProps) {
  const fase = useFaseAgregar(agregando, agregado)
  const animando = fase === 'cargando' || fase === 'saliendo' || fase === 'fallo'

  return (
    <button type="button" className={estilos.agregar} data-fase={fase}
      onClick={() => { if (!animando) alAgregar() }}
      disabled={!disponible || deshabilitado}
      aria-disabled={animando || undefined}
      aria-busy={fase === 'cargando'}>
      {animando ? (
        <span className={estilos.agregarEscena} aria-hidden="true">
          <Icono nombre="cart" tamano={18} />
          <span className={estilos.agregarProducto} />
        </span>
      ) : fase === 'reposo' && <Icono nombre="cart" tamano={18} />}
      <span className={estilos.agregarTexto}>
        {fase === 'agregado' ? <>Agregado <Icono nombre="check" tamano={18} /></>
          : animando ? 'Agregando…'
            : disponible ? 'Agregar al carrito' : 'Agotado'}
      </span>
    </button>
  )
}

/** Máquina de fases de la animación, guiada por «agregando» y el resultado del agregado. */
function useFaseAgregar(agregando: boolean, exito: boolean): FaseAgregar {
  const [fase, setFase] = useState<FaseAgregar>(agregando ? 'cargando' : 'reposo')
  const [agregandoPrevio, setAgregandoPrevio] = useState(agregando)
  const [cargaCumplida, setCargaCumplida] = useState(false)
  const [resultado, setResultado] = useState<'exito' | 'fallo' | null>(null)

  // Ajustes al cambiar «agregando» (durante el render, sin efectos en cascada).
  if (agregando !== agregandoPrevio) {
    setAgregandoPrevio(agregando)
    if (agregando) {
      setFase('cargando')
      setCargaCumplida(false)
      setResultado(null)
    } else {
      setResultado(exito ? 'exito' : 'fallo')
    }
  }
  // El carrito sale cuando ya respondió el backend y el producto terminó de caer.
  if (fase === 'cargando' && resultado && cargaCumplida) {
    setFase(resultado === 'exito' ? 'saliendo' : 'fallo')
    setResultado(null)
  }

  useEffect(() => {
    const siguiente: Partial<Record<FaseAgregar, [number, () => void]>> = {
      cargando: [DURACION.cargaMinima, () => setCargaCumplida(true)],
      saliendo: [DURACION.salida, () => setFase('agregado')],
      agregado: [DURACION.agregado, () => setFase('reposo')],
      fallo: [DURACION.fallo, () => setFase('reposo')],
    }
    const paso = siguiente[fase]
    if (!paso) return
    const temporizador = window.setTimeout(paso[1], paso[0])
    return () => window.clearTimeout(temporizador)
  }, [fase])

  return fase
}
