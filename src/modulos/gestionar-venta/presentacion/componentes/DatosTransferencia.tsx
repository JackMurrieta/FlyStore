import { Aviso, Icono, Texto } from '@compartido/ui'
import type { DatosBancariosTs } from '../../dominio/DatosBancariosTs'
import { formatearMontoExacto } from '../formato'
import { useCopiar } from '../hooks/useCopiar'
import { Tarjeta } from './Elementos'
import estilos from './venta.module.css'

/** «Datos para transferir» (B3): cada dato con botón Copiar, monto exacto y aviso del concepto. */
export function DatosTransferencia({ datos, total }: { readonly datos: DatosBancariosTs; readonly total: number }) {
  const { copiado, copiar } = useCopiar()
  const filas: readonly { clave: string; etiqueta: string; valor: string; copiable: boolean }[] = [
    { clave: 'banco', etiqueta: 'Banco', valor: datos.banco, copiable: false },
    { clave: 'titular', etiqueta: 'Titular', valor: datos.titular, copiable: false },
    { clave: 'cuenta', etiqueta: 'Número de cuenta', valor: datos.numeroCuenta, copiable: true },
    { clave: 'clabe', etiqueta: 'CLABE interbancaria', valor: datos.clabe, copiable: true },
    { clave: 'concepto', etiqueta: 'Concepto', valor: datos.concepto, copiable: true },
  ]
  return (
    <Tarjeta titulo="Datos para transferir" subtitulo="Copia los datos para evitar errores de captura." etiquetaId="titulo-transferir">
      <dl className={estilos.datos}>
        {filas.map((fila) => (
          <div key={fila.clave} className={estilos.dato}>
            <dt className="fly-cuerpo-s fly-tono-secundario">{fila.etiqueta}</dt>
            <dd className="fly-etiqueta-fuerte">{fila.valor}</dd>
            {fila.copiable && (
              <button type="button" className={estilos.copiar} onClick={() => void copiar(fila.clave, fila.valor.replace(/\s/g, ''))}
                aria-label={`Copiar ${fila.etiqueta.toLowerCase()}`}>
                <Icono nombre={copiado === fila.clave ? 'check' : 'copy'} tamano={14} />
                <Texto variante="mini">{copiado === fila.clave ? 'Copiado' : 'Copiar'}</Texto>
              </button>
            )}
          </div>
        ))}
      </dl>
      <div className={estilos.monto}>
        <Texto variante="etiqueta" tono="secundario">Monto exacto a transferir</Texto>
        <Texto variante="precio-l">{formatearMontoExacto(total)}</Texto>
      </div>
      <Aviso tono="info" titulo="Concepto: folio de tu pedido">
        Escribe {datos.concepto} como concepto de la transferencia. Así identificamos tu pago y lo ligamos a tu pedido.
      </Aviso>
    </Tarjeta>
  )
}
