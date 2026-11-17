import { Fragment } from 'react'
import { Icono, Texto } from '@compartido/ui'
import estilos from './venta.module.css'

/** 1 Carrito · 2 Entrega · 3 Pago · 4 Confirmación · 5 = todos hechos (pedido registrado). */
export type PasoCompra = 1 | 2 | 3 | 4 | 5

const PASOS = ['Carrito', 'Entrega', 'Pago', 'Confirmación'] as const

/** Componente «Paso» del Figma (146:290): Hecho, Actual y Pendiente. */
export function PasosCompra({ actual }: { readonly actual: PasoCompra }) {
  return (
    <ol className={estilos.pasos} aria-label="Pasos de la compra">
      {PASOS.map((nombre, indice) => {
        const numero = indice + 1
        const estado = numero < actual ? 'hecho' : numero === actual ? 'actual' : 'pendiente'
        return (
          <Fragment key={nombre}>
            {indice > 0 && <li className={estilos.conector} data-hecho={numero <= actual} aria-hidden="true" />}
            <li className={estilos.paso} data-estado={estado} aria-current={estado === 'actual' ? 'step' : undefined}>
              <span className={estilos.circuloPaso} aria-hidden="true">
                {estado === 'hecho' ? <Icono nombre="check" tamano={16} /> : <Texto variante="etiqueta">{numero}</Texto>}
              </span>
              <Texto variante="etiqueta" className={estilos.textoPaso}>
                {nombre}
                {estado === 'hecho' && <span className={estilos.visuallyHidden}> (completado)</span>}
              </Texto>
            </li>
          </Fragment>
        )
      })}
    </ol>
  )
}
