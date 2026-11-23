/**
 * DatosEntregaView «ViewComponent» · B2 Datos de entrega, A5 Datos incompletos.
 * Mensajes que recibe: continuarAlPago.
 */

import { Navigate } from 'react-router-dom'
import { Aviso, Boton, Campo, Icono, Texto } from '@compartido/ui'
import type { CampoDatosEntrega } from '../../dominio/DatosEntregaTs'
import { useDatosEntrega } from '../hooks/useDatosEntrega'
import { useNavegacionVenta } from '../hooks/useNavegacionVenta'
import { useModelosVenta } from '../ModelosVentaContext'
import { PaginaVenta } from '../componentes/PaginaVenta'
import { ResumenPedido } from '../componentes/ResumenPedido'
import { Tarjeta } from '../componentes/Elementos'
import estilos from '../componentes/venta.module.css'

const CAMPOS: readonly { campo: CampoDatosEntrega; etiqueta: string; completo?: boolean; tipo?: string; autocompletar: string }[] = [
  { campo: 'nombreCompleto', etiqueta: 'Nombre completo', autocompletar: 'name' },
  { campo: 'telefono', etiqueta: 'Teléfono (WhatsApp)', tipo: 'tel', autocompletar: 'tel-national' },
  { campo: 'ciudad', etiqueta: 'Ciudad', autocompletar: 'address-level2' },
  { campo: 'estado', etiqueta: 'Estado', autocompletar: 'address-level1' },
  { campo: 'direccion', etiqueta: 'Dirección de entrega', completo: true, autocompletar: 'street-address' },
  { campo: 'referencias', etiqueta: 'Referencias (opcional)', completo: true, autocompletar: 'off' },
]

export default function DatosEntregaView() {
  const entrega = useDatosEntrega()
  const navegacion = useNavegacionVenta()
  const { rutaBase } = useModelosVenta()
  const { datosEntrega, informacionPedido, erroresCampo } = entrega

  // Sin pedido en memoria (recarga directa): se regresa al carrito.
  if (!informacionPedido || !datosEntrega) return <Navigate to={rutaBase} replace />

  const continuarAlPago = () => void navegacion.irMetodoPago()
  const hayErrores = Object.keys(erroresCampo).length > 0

  return (
    <PaginaVenta titulo="Datos de entrega" subtitulo="Precargados con la información de tu cuenta. Revísalos antes de continuar." paso={2}>
      <div className={estilos.columnas}>
        <form className={estilos.principal} noValidate onSubmit={(e) => { e.preventDefault(); continuarAlPago() }}>
          {hayErrores && (
            <Aviso tono="error" titulo="Completa los campos marcados">
              Revisa {Object.keys(erroresCampo).length === 1 ? 'el campo marcado' : 'los campos marcados'} para continuar.
            </Aviso>
          )}
          {!hayErrores && entrega.error && <Aviso tono="advertencia">{entrega.error.mensaje}</Aviso>}
          <Tarjeta titulo="¿A dónde enviamos tu pedido?" subtitulo="Usaremos tu WhatsApp para coordinar la entrega." etiquetaId="titulo-entrega">
            <div className={estilos.rejillaCampos}>
              {CAMPOS.map(({ campo, etiqueta, completo, tipo, autocompletar }) => (
                <div key={campo} className={completo ? estilos.anchoCompleto : undefined}>
                  <Campo etiqueta={etiqueta} type={tipo ?? 'text'} value={datosEntrega[campo]} error={erroresCampo[campo]}
                    autoComplete={autocompletar} inputMode={tipo === 'tel' ? 'numeric' : undefined}
                    required={campo !== 'referencias'}
                    onChange={(e) => entrega.actualizarCampo(campo, e.target.value)} />
                </div>
              ))}
            </div>
            <label className={estilos.casilla}>
              <input type="checkbox" checked={datosEntrega.guardarComoPredeterminada}
                onChange={(e) => entrega.cambiarGuardarPredeterminada(e.target.checked)} />
              <Texto variante="etiqueta">Guardar como mi dirección predeterminada</Texto>
            </label>
          </Tarjeta>
          <div className={estilos.acciones}>
            <Boton variante="fantasma" icono={<Icono nombre="chevron-left" tamano={18} />} onClick={navegacion.irCarrito}>
              Regresar al carrito
            </Boton>
            <span className={estilos.espaciador} />
            <Boton variante="primario" type="submit" icono={<Icono nombre="arrow-right" tamano={18} />} cargando={navegacion.navegando}>
              Continuar al pago
            </Boton>
          </div>
        </form>
        <div className={estilos.lateral}><ResumenPedido informacion={informacionPedido} /></div>
      </div>
    </PaginaVenta>
  )
}
