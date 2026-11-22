/**
 * CU-01 · S2 «Ficha con variantes y precios por esquema» (/producto/:id) y A5 «Variante agotada».
 * Aquí se liga con CU-02: «Agregar al carrito» manda la variante elegida y el backend crea el
 * PedidoVenta PENDIENTE si el cliente no tiene carrito. Sin sesión se pide iniciar sesión o crear
 * cuenta y, al volver, se agrega solo lo que había elegido.
 */

import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Icono, Esqueleto, EsqueletoTexto } from '@compartido/ui'
import { DialogoSesionRequerida } from '@compartido/sesion'
import { RUTAS_CUENTA, categoriaPorClave } from '@compartido/config/marca'
import { CRITERIOS_VACIOS } from '../../dominio/ReglasCatalogo'
import type { ImagenProductoTs } from '../../dominio/DetalleProductoTs'
import { useDetalleProducto } from '../hooks/useDetalleProducto'
import { PaginaTienda } from '../componentes/PaginaTienda'
import { ErrorCatalogo, EstadoCatalogo } from '../componentes/EstadosCatalogo'
import { rutasTienda } from '../rutasTienda'
import { formatearPrecio, nombreLinea, piezas } from '../formato'
import { MENSAJE_PERSONAL } from '../../aplicacion/DetalleProductoModel'
import estilos from '../componentes/detalle.module.css'
import tienda from '../componentes/tienda.module.css'

export default function DetalleProductoView() {
  const { id } = useParams<{ id: string }>()
  const [parametros, setParametros] = useSearchParams()
  const idProducto = Number(id)
  const idColorUrl = Number(parametros.get('color')) || null
  const volviendoDeSesion = parametros.get('agregar') === '1'
  const ficha = useDetalleProducto(idProducto, idColorUrl, volviendoDeSesion)
  const navegar = useNavigate()
  const ubicacion = useLocation()

  // El aviso «agregar=1» solo sirve una vez: se quita de la URL al completar (o al fallar) el agregado.
  useEffect(() => {
    if (volviendoDeSesion && (ficha.agregado || ficha.errorAgregar)) {
      const siguiente = new URLSearchParams(parametros)
      siguiente.delete('agregar')
      setParametros(siguiente, { replace: true })
    }
  }, [volviendoDeSesion, ficha.agregado, ficha.errorAgregar, parametros, setParametros])

  // El aviso «Agregado al carrito» se cierra solo; «Ver carrito» sigue a un clic mientras se ve.
  const { agregado, cerrarAgregado } = ficha
  useEffect(() => {
    if (!agregado) return
    const temporizador = window.setTimeout(cerrarAgregado, 6000)
    return () => window.clearTimeout(temporizador)
  }, [agregado, cerrarAgregado])

  const detalle = ficha.detalle?.id === idProducto ? ficha.detalle : null
  const derivados = detalle ? ficha.derivados : null
  const presentacion = categoriaPorClave(detalle?.linea.ruta)
  const tituloLinea = detalle ? presentacion?.titulo ?? nombreLinea(detalle.linea.nombre) : 'Producto'

  /** «Regresar al catálogo» conserva búsqueda, filtros, orden y posición: vuelve en el historial si se llegó desde la tienda. */
  const regresar = () => {
    if (ubicacion.key !== 'default' && window.history.length > 1) navegar(-1)
    else navegar(detalle ? rutasTienda.productosLinea(detalle.linea.ruta) : '/')
  }

  if (!Number.isInteger(idProducto) || idProducto <= 0) {
    return (
      <PaginaTienda migas={[{ etiqueta: 'Producto' }]}>
        <EstadoCatalogo icono="search-x" titulo="Producto no encontrado"
          acciones={<Link to="/" className={tienda.botonSecundario}>Ir al inicio</Link>}>
          El enlace no es válido.
        </EstadoCatalogo>
      </PaginaTienda>
    )
  }

  return (
    <PaginaTienda migas={detalle
      ? [
          { etiqueta: tituloLinea, ruta: rutasTienda.linea(detalle.linea.ruta) },
          { etiqueta: detalle.marca.nombre, ruta: rutasTienda.productosLinea(detalle.linea.ruta, { ...CRITERIOS_VACIOS, marcas: [detalle.marca.id] }) },
          { etiqueta: detalle.nombre },
        ]
      : []}>
      <button type="button" className={estilos.regresar} onClick={regresar}>
        <Icono nombre="chevron-left" tamano={18} /> Regresar al catálogo
      </button>

      {ficha.error && !ficha.cargando ? (
        ficha.error.tipo === 'negocio' ? (
          <EstadoCatalogo icono="package" titulo="Este producto ya no está disponible"
            acciones={<button type="button" className={tienda.botonSecundario} onClick={regresar}>Ver más productos</button>}>
            Puede que se haya agotado o que ya no esté a la venta.
          </EstadoCatalogo>
        ) : (
          <ErrorCatalogo mensaje={ficha.error.mensaje} alReintentar={() => void ficha.reintentar()} />
        )
      ) : !detalle || !derivados ? (
        <FichaCargando />
      ) : (
        <div className={estilos.ficha}>
          <Galeria imagenes={derivados.galeria} nombre={detalle.nombre} clave={`${ficha.idColor ?? 'general'}`} />

          <section className={estilos.info} aria-labelledby="nombre-producto">
            <span className={estilos.sobretitulo}>{detalle.marca.nombre} · FLY{detalle.linea.nombre}</span>
            <h1 id="nombre-producto" className={estilos.nombre}>{detalle.nombre}</h1>
            <div className={estilos.estadoFila}>
              {derivados.variante?.disponible ? (
                <span className={estilos.disponible}><Icono nombre="check-circle" tamano={14} /> Disponible · {piezas(derivados.variante.existencia)}</span>
              ) : (
                <span className={estilos.agotado}><Icono nombre="ban" tamano={14} /> Agotado</span>
              )}
              {derivados.variante?.sku && <span className={estilos.sku}>SKU {derivados.variante.sku}</span>}
            </div>
            {detalle.descripcion && <p className={estilos.descripcion}>{detalle.descripcion}</p>}

            <hr className={estilos.separador} />

            {derivados.colores.length > 0 && (
              <fieldset className={estilos.grupo}>
                <legend>Color: <strong>{derivados.variante?.color ?? '—'}</strong></legend>
                <div className={estilos.colores}>
                  {derivados.colores.map(color => (
                    <button key={color.idColor ?? color.nombre} type="button"
                      className={`${estilos.color} ${!color.disponible ? estilos.colorAgotado : ''}`}
                      style={{ background: color.hex ?? 'var(--fly-borde-control)' }}
                      aria-pressed={ficha.idColor === color.idColor}
                      aria-label={`${color.nombre}${color.disponible ? '' : ' (agotado)'}`}
                      title={color.disponible ? color.nombre : `${color.nombre} · agotado`}
                      onClick={() => ficha.elegirColor(color.idColor)} />
                  ))}
                </div>
              </fieldset>
            )}

            {derivados.tallas.some(v => v.talla) && (
              <fieldset className={estilos.grupo}>
                <legend>
                  {derivados.tallas[0]?.tipoTalla ?? 'Talla'}{derivados.tallas[0]?.unidadMedida ? ` (${derivados.tallas[0].unidadMedida})` : ''}:{' '}
                  <strong>{derivados.variante?.talla ?? '—'}</strong>
                </legend>
                <div className={estilos.tallas}>
                  {derivados.tallas.map(variante => (
                    <button key={variante.id} type="button" className={estilos.talla}
                      aria-pressed={ficha.idVariante === variante.id}
                      aria-label={`${variante.talla ?? 'Única'}${variante.disponible ? '' : ', agotada'}`}
                      onClick={() => ficha.elegirVariante(variante.id)}>
                      {variante.talla ?? 'Única'}
                      {!variante.disponible && <small>Agotado</small>}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <section aria-labelledby="titulo-esquemas" className={estilos.esquemas}>
              <h2 id="titulo-esquemas" className={estilos.sobretitulo}>Precio por esquema de compra</h2>
              <table className={estilos.tabla}>
                <thead><tr><th scope="col">Esquema</th><th scope="col">Desde</th><th scope="col">Precio por pieza</th></tr></thead>
                <tbody>
                  {detalle.precios.map(nivel => {
                    const aplica = derivados.nivel?.tipoPrecio === nivel.tipoPrecio
                    return (
                      <tr key={nivel.tipoPrecio} className={aplica ? estilos.filaAplicada : undefined} aria-current={aplica ? 'true' : undefined}>
                        <th scope="row">
                          {nivel.etiqueta}
                          {nivel.referencia && <span className={estilos.referencia}>Referencia</span>}
                        </th>
                        <td>{piezas(nivel.minPiezas)}</td>
                        <td>{formatearPrecio(nivel.precio)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <p className={estilos.nota}>
                <Icono nombre="info" tamano={16} />
                El esquema se aplica en el carrito según el total de piezas de tu pedido; puedes combinar modelos.
              </p>
            </section>

            <div className={estilos.compra}>
              <div className={estilos.cantidad} role="group" aria-label="Cantidad">
                <button type="button" onClick={() => ficha.cambiarCantidad(ficha.cantidad - 1)}
                  disabled={ficha.cantidad <= 1 || !derivados.variante?.disponible} aria-label="Quitar una pieza">
                  <Icono nombre="minus" tamano={16} />
                </button>
                <input type="number" inputMode="numeric" min={1} max={derivados.variante?.existencia ?? 1} value={ficha.cantidad}
                  aria-label="Piezas" disabled={!derivados.variante?.disponible}
                  onChange={e => ficha.cambiarCantidad(Number(e.target.value))} />
                <button type="button" onClick={() => ficha.cambiarCantidad(ficha.cantidad + 1)}
                  disabled={!derivados.variante?.disponible || ficha.cantidad >= (derivados.variante?.existencia ?? 1)} aria-label="Agregar una pieza">
                  <Icono nombre="plus" tamano={16} />
                </button>
              </div>
              <button type="button" className={estilos.agregar} onClick={() => void ficha.agregar()}
                disabled={!derivados.variante?.disponible || ficha.agregando || ficha.comprador === 'verificando'}
                aria-busy={ficha.agregando}>
                <Icono nombre={ficha.agregando ? 'refresh' : 'cart'} tamano={18} />
                {ficha.agregando ? 'Agregando…' : derivados.variante?.disponible ? 'Agregar al carrito' : 'Agotado'}
              </button>
            </div>

            <p className={estilos.subtotal} aria-live="polite">
              {derivados.nivel && (
                <>
                  {formatearPrecio(derivados.nivel.precio)} por pieza · {derivados.nivel.etiqueta} · Subtotal <strong>{formatearPrecio(derivados.subtotal)}</strong>
                </>
              )}
              {derivados.siguiente && (
                <span className={estilos.siguiente}>
                  Con {piezas(derivados.siguiente.minPiezas)} del producto: {formatearPrecio(derivados.siguiente.precio)} c/u ({derivados.siguiente.etiqueta})
                </span>
              )}
            </p>

            {ficha.comprador === 'personal' && !ficha.errorAgregar && <p className={estilos.avisoPersonal}>{MENSAJE_PERSONAL}</p>}
            {ficha.errorAgregar && <p className={estilos.error} role="alert"><Icono nombre="alert-circle" tamano={16} /> {ficha.errorAgregar}</p>}

            <dl className={estilos.datos}>
              <div><dt>Línea</dt><dd>{tituloLinea}</dd></div>
              <div><dt>Marca</dt><dd>{detalle.marca.nombre}</dd></div>
              <div><dt>Tipo</dt><dd>{detalle.subcategoria.nombre}</dd></div>
              {derivados.variante?.tipoTalla && <div><dt>Tipo de talla</dt><dd>{derivados.variante.tipoTalla}{derivados.variante.unidadMedida ? ` · ${derivados.variante.unidadMedida}` : ''}</dd></div>}
              <div><dt>Modelo</dt><dd>{detalle.clave}</dd></div>
            </dl>
          </section>
        </div>
      )}

      {ficha.agregado && (
        <div className={estilos.toast} role="status">
          <Icono nombre="check-circle" tamano={20} />
          <div>
            <strong>Agregado al carrito</strong>
            <span>{ficha.agregado.producto}{ficha.agregado.variante ? ` · ${ficha.agregado.variante}` : ''} × {ficha.agregado.cantidad}</span>
          </div>
          <Link to={RUTAS_CUENTA.carrito} className={estilos.toastAccion}>Ver carrito</Link>
          <button type="button" className={estilos.toastCerrar} onClick={ficha.cerrarAgregado} aria-label="Cerrar aviso"><Icono nombre="x" tamano={16} /></button>
        </div>
      )}

      <DialogoSesionRequerida
        abierto={ficha.pideSesion}
        alCerrar={ficha.cerrarDialogoSesion}
        mensaje="Para agregar productos a tu carrito inicia sesión o crea tu cuenta. Al volver lo agregamos por ti."
        rutaRegreso={rutasTienda.producto(idProducto, ficha.idColor, true)}
        nota="Guardamos el color, la talla y las piezas que elegiste"
      />
    </PaginaTienda>
  )
}

/** Galería del color elegido: foto grande y miniaturas; cambia con un fundido al cambiar de color. */
function Galeria({ imagenes, nombre, clave }: { readonly imagenes: readonly ImagenProductoTs[]; readonly nombre: string; readonly clave: string }) {
  const [elegida, setElegida] = useState({ clave, indice: 0 })
  const indice = elegida.clave === clave ? elegida.indice : 0
  const actual = imagenes[indice] ?? imagenes[0]

  return (
    <div className={estilos.galeria}>
      {imagenes.length > 1 && (
        <div className={estilos.miniaturas} role="group" aria-label="Fotos del producto">
          {imagenes.map((imagen, i) => (
            <button key={`${imagen.url}-${i}`} type="button" className={estilos.miniatura}
              aria-pressed={i === indice} aria-label={`Foto ${i + 1}`}
              onMouseEnter={() => setElegida({ clave, indice: i })} onClick={() => setElegida({ clave, indice: i })}>
              <img src={imagen.url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <div className={estilos.fotoPrincipal}>
        {actual
          ? <img key={actual.url} src={actual.url} alt={nombre} className={estilos.imagenPrincipal} />
          : <span className={estilos.sinFoto}><Icono nombre="image" tamano={40} /></span>}
      </div>
    </div>
  )
}

function FichaCargando() {
  return (
    <div className={estilos.ficha} role="status" aria-busy="true">
      <span className={tienda.oculto}>Cargando el producto…</span>
      <Esqueleto forma="bloque" alto={520} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Esqueleto forma="texto" ancho="30%" />
        <Esqueleto forma="titulo" ancho="80%" />
        <EsqueletoTexto lineas={3} />
        <Esqueleto forma="bloque" alto={160} />
        <Esqueleto forma="bloque" alto={48} />
      </div>
    </div>
  )
}
