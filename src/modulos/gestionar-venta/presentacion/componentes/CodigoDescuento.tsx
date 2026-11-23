import { useId } from 'react'
import { Boton, Icono, Texto } from '@compartido/ui'
import type { DescuentoCodigoTs } from '../../dominio/CarritoTs'
import { formatearMonto } from '../formato'
import estilos from './venta.module.css'

interface Props {
  readonly valor: string
  readonly aplicados: readonly DescuentoCodigoTs[]
  readonly error: string | null
  readonly aplicando: boolean
  readonly capturar: (valor: string) => void
  readonly aplicar: () => void
}

/** «Código de descuento» del Figma (188:10095): Vacío, Aplicado y Error. */
export function CodigoDescuento({ valor, aplicados, error, aplicando, capturar, aplicar }: Props) {
  const id = useId()
  const ayudaId = useId()
  const hayAplicados = aplicados.length > 0
  return (
    <form className={estilos.codigo} onSubmit={(e) => { e.preventDefault(); aplicar() }} noValidate>
      <label htmlFor={id} className={estilos.codigoEncabezado}>
        <Icono nombre="tag" tamano={16} />
        <Texto variante="etiqueta">Código de descuento</Texto>
      </label>
      {aplicados.map((codigo) => (
        <div key={codigo.codigo} className={estilos.codigoAplicado}>
          <Icono nombre="check-circle" tamano={18} />
          <div>
            <Texto variante="etiqueta-fuerte">{codigo.codigo}</Texto>
            <Texto variante="mini" tono="secundario">
              −{codigo.etiquetaValor} en {codigo.producto} · ahorras {formatearMonto(codigo.monto)}
            </Texto>
          </div>
        </div>
      ))}
      <div className={estilos.codigoFila}>
        <input id={id} className={estilos.entradaCodigo} value={valor} autoComplete="off" spellCheck={false}
          placeholder={hayAplicados ? '¿Otro código para otro producto?' : 'Escribe tu código'}
          aria-invalid={Boolean(error)} aria-describedby={ayudaId}
          onChange={(e) => capturar(e.target.value)} />
        <Boton variante="secundario" type="submit" cargando={aplicando}>Aplicar</Boton>
      </div>
      {error ? (
        <Texto variante="mini" id={ayudaId} className={estilos.ayudaError} role="alert">
          <Icono nombre="alert-circle" tamano={14} />{error}
        </Texto>
      ) : (
        <Texto variante="mini" tono="secundario" id={ayudaId}>
          {hayAplicados
            ? 'Puedes canjear otro código si aplica a otro producto de tu carrito.'
            : 'Los códigos aplican a productos específicos de tu carrito.'}
        </Texto>
      )}
    </form>
  )
}
