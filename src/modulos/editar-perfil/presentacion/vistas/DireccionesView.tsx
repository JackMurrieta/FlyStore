/**
 * DireccionesView · Pestaña «Direcciones» (solo clientes).
 * Las direcciones se guardan al hacer un pedido. Aquí el cliente elige con un interruptor cuál es
 * la predeterminada (la que se propone al comprar), la quita o elimina las que ya no usa.
 */

import { Link } from 'react-router-dom'
import { Aviso, Boton, CargaContenido, Dialogo, Esqueleto, EsqueletoTexto, Icono, Texto } from '@compartido/ui'
import { useDirecciones } from '../hooks/useDirecciones'
import { TarjetaPerfil } from '../componentes/PaginaPerfil'
import { Interruptor } from '../componentes/Interruptor'
import estilos from '../componentes/perfil.module.css'

export default function DireccionesView() {
  const vm = useDirecciones()

  return (
    <TarjetaPerfil id="direcciones" titulo="Direcciones de entrega" icono="pin"
      descripcion="Se guardan cuando haces un pedido. La predeterminada es la que te proponemos al comprar.">
      {vm.mensaje && <div role="status"><Aviso tono="exito">{vm.mensaje}</Aviso></div>}
      {vm.errorAccion && <Aviso tono="error" titulo="No se guardó el cambio">{vm.errorAccion}</Aviso>}

      {vm.cargando && (
        <CargaContenido texto="Cargando tus direcciones…" className={estilos.listaDirecciones}>
          {[0, 1].map((i) => (
            <div key={i} className={estilos.direccion}>
              <Esqueleto forma="texto" ancho="45%" />
              <EsqueletoTexto lineas={3} ultima="50%" />
              <Esqueleto forma="pastilla" ancho={180} alto={28} />
            </div>
          ))}
        </CargaContenido>
      )}

      {vm.error && (
        <div className={estilos.estadoError}>
          <Aviso tono="error" titulo="No pudimos cargar tus direcciones">{vm.error.mensaje}</Aviso>
          <Boton variante="secundario" icono={<Icono nombre="refresh" tamano={18} />} onClick={vm.reintentar}>Reintentar</Boton>
        </div>
      )}

      {!vm.cargando && !vm.error && vm.direcciones.length === 0 && (
        <div className={estilos.vacio}>
          <span className={estilos.iconoVacio} aria-hidden="true"><Icono nombre="pin" tamano={28} /></span>
          <Texto variante="etiqueta-fuerte">Aún no tienes direcciones guardadas</Texto>
          <Texto variante="cuerpo-s" tono="secundario" como="p">
            Al confirmar un pedido, marca «Guardar como predeterminada» y aparecerá aquí.
          </Texto>
          <Link to="/carrito" className={estilos.botonSecundario}><Icono nombre="cart" tamano={18} /> Ir al carrito</Link>
        </div>
      )}

      {vm.direcciones.length > 0 && (
        <ul className={estilos.listaDirecciones}>
          {vm.direcciones.map((direccion) => {
            const ocupada = vm.enCurso !== null
            return (
              <li key={direccion.id} className={estilos.direccion} data-predeterminada={direccion.predeterminada}>
                <div className={estilos.direccionEncabezado}>
                  <Texto variante="etiqueta-fuerte">{direccion.nombreCompleto}</Texto>
                  {direccion.predeterminada && (
                    <span className={estilos.insigniaPredeterminada}><Icono nombre="star" tamano={12} /> Predeterminada</span>
                  )}
                </div>
                <address className={estilos.direccionTexto}>
                  <span>{direccion.direccion}</span>
                  <span>{direccion.ciudadEstado}</span>
                  {direccion.telefono && <span>Tel. {direccion.telefono}</span>}
                  {direccion.referencias && <span className={estilos.referencias}>Referencias: {direccion.referencias}</span>}
                </address>
                <div className={estilos.direccionAcciones}>
                  <Interruptor activo={direccion.predeterminada} etiqueta="Predeterminada"
                    descripcion={direccion.predeterminada ? 'Se propone al comprar' : 'Usar al comprar'}
                    ocupado={ocupada && (vm.enCurso?.id === direccion.id || (vm.enCurso?.accion === 'quitar' && direccion.predeterminada))}
                    alCambiar={() => vm.alternarPredeterminada(direccion)} />
                  <button type="button" className={estilos.botonEliminar} disabled={ocupada}
                    onClick={() => vm.pedirEliminar(direccion)} aria-label={`Eliminar la dirección ${direccion.direccion}`}>
                    <Icono nombre="trash" tamano={18} /> Eliminar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Dialogo abierto={vm.porEliminar !== null} alCerrar={vm.cancelarEliminar} titulo="¿Eliminar esta dirección?" icono="trash" tonoIcono="peligro">
        <Texto variante="cuerpo" como="p" tono="secundario">
          {vm.porEliminar?.direccion}. Ya no aparecerá al hacer pedidos; tus pedidos anteriores no cambian.
        </Texto>
        <div className={estilos.accionesDialogo}>
          <Boton variante="secundario" onClick={vm.cancelarEliminar}>Cancelar</Boton>
          <Boton variante="peligroSolido" cargando={vm.enCurso?.accion === 'eliminar'} onClick={vm.confirmarEliminar}>Eliminar</Boton>
        </div>
      </Dialogo>
    </TarjetaPerfil>
  )
}
