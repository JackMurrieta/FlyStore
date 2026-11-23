import { Icono, Texto, type NombreIcono } from '@compartido/ui'
import estilos from './venta.module.css'

interface Props {
  readonly nombre: string
  readonly valor: string
  readonly seleccionada: boolean
  readonly icono: NombreIcono
  readonly titulo: string
  readonly descripcion: string
  readonly deshabilitada?: boolean
  readonly alElegir: () => void
}

/** Tarjeta de opción de pago con radio (B3 · «¿Cómo quieres pagar?»). */
export function OpcionPago({ nombre, valor, seleccionada, icono, titulo, descripcion, deshabilitada, alElegir }: Props) {
  return (
    <label className={estilos.opcion}>
      <input type="radio" name={nombre} value={valor} checked={seleccionada} disabled={deshabilitada}
        onChange={() => alElegir()} />
      <span className={estilos.radio} aria-hidden="true" />
      <Icono nombre={icono} tamano={24} />
      <div>
        <Texto variante="etiqueta-fuerte">{titulo}</Texto>
        <Texto variante="cuerpo-s" tono="secundario">{descripcion}</Texto>
      </div>
    </label>
  )
}
