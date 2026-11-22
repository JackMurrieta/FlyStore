/**
 * CU-01 · Catálogo (B3 /categoria/:linea/productos) y búsqueda en toda la tienda (S1 /buscar).
 * Filtros a la izquierda, orden arriba, bloques de 30 con «Ver más» (S3) y los alternativos:
 * A1 búsqueda en blanco, A2 sin resultados con sugerencias, A3 filtros sin coincidencias,
 * A4 error al cargar y A6 fin del catálogo.
 */

import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icono } from '@compartido/ui'
import { categoriaPorClave } from '@compartido/config/marca'
import type { OpcionesFiltroTs, ProductoTarjetaTs } from '../../dominio/CatalogoTs'
import type { CriteriosBusquedaTs, DestinoCatalogoTs } from '../../dominio/CriteriosBusquedaTs'
import { CRITERIOS_VACIOS, alternar, etiquetaTipoPrecio, hayFiltros, limpiarFiltros } from '../../dominio/ReglasCatalogo'
import { useCatalogo } from '../hooks/useCatalogo'
import { useCriteriosUrl } from '../hooks/useCriteriosUrl'
import { PaginaTienda, type Miga } from '../componentes/PaginaTienda'
import { PanelFiltros } from '../componentes/PanelFiltros'
import { TarjetaCargando, TarjetaProducto } from '../componentes/TarjetaProducto'
import { EstadoCatalogo, ErrorCatalogo } from '../componentes/EstadosCatalogo'
import { VerMas } from '../componentes/VerMas'
import { rutasTienda } from '../rutasTienda'
import { formatearPrecio, nombreLinea, productos as textoProductos } from '../formato'
import estilos from '../componentes/tienda.module.css'

export type ModoCatalogo = { readonly tipo: 'linea'; readonly ruta: string } | { readonly tipo: 'busqueda' }

export default function CatalogoView({ modo }: { readonly modo: ModoCatalogo }) {
  const { criterios, parametros, cambiarCriterios } = useCriteriosUrl(modo.tipo === 'busqueda' ? ['linea'] : [])
  const lineaBusqueda = modo.tipo === 'busqueda' ? parametros.get('linea') : null
  const destino = useMemo<DestinoCatalogoTs>(
    () => (modo.tipo === 'linea' ? { tipo: 'linea', ruta: modo.ruta } : { tipo: 'busqueda', linea: lineaBusqueda }),
    [modo, lineaBusqueda],
  )
  const estado = useCatalogo(destino, criterios)
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const cerrarFiltros = useCallback(() => setFiltrosAbiertos(false), [])

  const ruta = modo.tipo === 'linea' ? modo.ruta : lineaBusqueda
  const presentacion = categoriaPorClave(ruta)
  const nombre = estado.linea?.nombre ?? presentacion?.nombre ?? (ruta ? ruta.toUpperCase() : '')
  const tituloLinea = presentacion?.titulo ?? (nombre ? nombreLinea(nombre) : 'Catálogo')
  const marcaUnica = criterios.marcas.length === 1
    ? estado.opciones?.marcas.find(m => m.id === criterios.marcas[0]) ?? null
    : null

  const migas: Miga[] = modo.tipo === 'linea'
    ? [{ etiqueta: tituloLinea, ruta: rutasTienda.linea(modo.ruta) }, ...(marcaUnica ? [{ etiqueta: marcaUnica.nombre }] : [{ etiqueta: 'Todo' }])]
    : [{ etiqueta: 'Búsqueda' }]

  const cambiar = (nuevos: CriteriosBusquedaTs) => cambiarCriterios(nuevos)
  const elegirLinea = (linea: string | null) => cambiarCriterios(limpiarFiltros(criterios), { linea })

  return (
    <PaginaTienda migas={migas}>
      {modo.tipo === 'linea' ? (
        <header className={estilos.titulos}>
          <span className={estilos.sobretitulo}>FLY{nombre}{marcaUnica ? ' · Marca' : ''}</span>
          <h1 className={estilos.titulo}>{marcaUnica?.nombre ?? tituloLinea}</h1>
        </header>
      ) : (
        <header className={estilos.titulos}>
          <span className={estilos.sobretitulo}>Búsqueda</span>
          <h1 className={estilos.titulo}>Resultados para “{criterios.texto.trim()}”</h1>
          <p className={estilos.descripcion}>Buscamos en nombre, modelo, marca y línea sin importar mayúsculas ni acentos.</p>
        </header>
      )}

      {modo.tipo === 'linea' && estado.opciones && estado.opciones.marcas.length > 0 && (
        <nav aria-label="Marcas" className={estilos.chips}>
          <button type="button" className={`${estilos.chip} ${criterios.marcas.length === 0 ? estilos.chipActivo : ''}`}
            aria-pressed={criterios.marcas.length === 0} onClick={() => cambiar({ ...criterios, marcas: [] })}>
            Ver todo
          </button>
          {estado.opciones.marcas.map(marca => (
            <button key={marca.id} type="button"
              className={`${estilos.chip} ${marcaUnica?.id === marca.id ? estilos.chipActivo : ''}`}
              aria-pressed={marcaUnica?.id === marca.id} onClick={() => cambiar({ ...criterios, marcas: [marca.id] })}>
              {marca.nombre}
            </button>
          ))}
        </nav>
      )}

      {modo.tipo === 'busqueda' && estado.lineas.length > 0 && (
        <nav aria-label="Resultados por línea" className={estilos.chips}>
          <button type="button" className={`${estilos.chip} ${!lineaBusqueda ? estilos.chipActivo : ''}`}
            aria-pressed={!lineaBusqueda} onClick={() => elegirLinea(null)}>
            Toda la tienda <small>{estado.lineas.reduce((suma, l) => suma + l.cantidad, 0)}</small>
          </button>
          {estado.lineas.map(linea => (
            <button key={linea.id} type="button"
              className={`${estilos.chip} ${lineaBusqueda === linea.ruta ? estilos.chipActivo : ''}`}
              aria-pressed={lineaBusqueda === linea.ruta} onClick={() => elegirLinea(linea.ruta)}>
              {categoriaPorClave(linea.ruta)?.titulo ?? nombreLinea(linea.nombre)} <small>{linea.cantidad}</small>
            </button>
          ))}
        </nav>
      )}

      {modo.tipo === 'busqueda' && estado.error?.tipo === 'validacion' ? (
        <BusquedaEnBlanco mensaje={estado.error.mensaje} />
      ) : (
        <div className={estilos.catalogo}>
          <PanelFiltros
            opciones={estado.opciones}
            criterios={criterios}
            alCambiar={cambiar}
            abierto={filtrosAbiertos}
            alCerrar={cerrarFiltros}
            etiquetaTipo={presentacion?.tipo ?? 'Tipo'}
          />

          <div className={estilos.resultados}>
            <div className={estilos.barra}>
              <p className={estilos.conteo} aria-live="polite">
                {estado.cargando ? 'Buscando productos…' : textoProductos(estado.total)}
                {modo.tipo === 'busqueda' && !estado.cargando && <span> {lineaBusqueda ? `en ${tituloLinea.toLowerCase()}` : 'en toda la tienda'}</span>}
                {!estado.cargando && estado.tipoPrecioReferencia && estado.total > 0 && (
                  <span> · precio de referencia: {etiquetaTipoPrecio(estado.tipoPrecioReferencia)}</span>
                )}
              </p>
              <div className={estilos.barraAcciones}>
                <button type="button" className={`${estilos.botonSecundario} ${estilos.botonFiltros}`} style={{ height: 40 }}
                  onClick={() => setFiltrosAbiertos(true)} aria-expanded={filtrosAbiertos}>
                  <Icono nombre="sliders" tamano={16} /> Filtros{hayFiltros(criterios) ? ` (${contarFiltros(criterios)})` : ''}
                </button>
                <label className={estilos.ordenar}>
                  <Icono nombre="sort" tamano={16} />
                  <span>Ordenar por:</span>
                  <select value={criterios.orden} onChange={e => cambiar({ ...criterios, orden: e.target.value as CriteriosBusquedaTs['orden'] })}>
                    {(estado.opciones?.ordenes ?? [{ valor: 'RECIENTES' as const, etiqueta: 'Más recientes' }]).map(o => (
                      <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <FiltrosActivos criterios={criterios} opciones={estado.opciones} alCambiar={cambiar} />

            {estado.error ? (
              <ErrorCatalogo mensaje={estado.error.mensaje} alReintentar={() => void estado.reintentar()} />
            ) : estado.cargando ? (
              <div className={estilos.cuadricula} role="status" aria-busy="true">
                <span className={estilos.oculto}>Cargando productos…</span>
                {Array.from({ length: 6 }, (_, i) => <TarjetaCargando key={i} indice={i} />)}
              </div>
            ) : estado.total === 0 ? (
              <SinResultados criterios={criterios} modoBusqueda={modo.tipo === 'busqueda'} tituloLinea={tituloLinea}
                alLimpiar={() => cambiar(limpiarFiltros(criterios))} sugerencias={estado.sugerencias} />
            ) : (
              <>
                <div className={estilos.cuadricula}>
                  {estado.productos.map((producto, indice) => <TarjetaProducto key={producto.id} producto={producto} indice={indice} />)}
                  {estado.cargandoMas && Array.from({ length: 3 }, (_, i) => <TarjetaCargando key={`mas-${i}`} indice={i} />)}
                </div>
                <VerMas mostrados={estado.productos.length} total={estado.total} hayMas={estado.hayMas}
                  cargando={estado.cargandoMas} error={estado.errorMas?.mensaje ?? null} alCargarMas={() => void estado.cargarMas()} />
              </>
            )}
          </div>
        </div>
      )}
    </PaginaTienda>
  )
}

function contarFiltros(c: CriteriosBusquedaTs): number {
  return c.marcas.length + c.subcategorias.length + c.tallas.length + c.colores.length + c.unidadesMedida.length
    + (c.precioMin !== null || c.precioMax !== null ? 1 : 0)
}

/** Filtros activos como etiquetas removibles con «Limpiar filtros» (Figma S1). */
function FiltrosActivos({ criterios, opciones, alCambiar }: {
  readonly criterios: CriteriosBusquedaTs
  readonly opciones: OpcionesFiltroTs | null
  readonly alCambiar: (c: CriteriosBusquedaTs) => void
}) {
  if (!hayFiltros(criterios)) return null
  const nombre = <T extends { id: number; nombre: string }>(lista: readonly T[] | undefined, id: number) =>
    lista?.find(o => o.id === id)?.nombre ?? `#${id}`
  const tallas = opciones?.tiposTalla.flatMap(t => t.tallas)
  const etiquetas: { clave: string; texto: string; quitar: CriteriosBusquedaTs }[] = [
    ...criterios.marcas.map(id => ({ clave: `m${id}`, texto: nombre(opciones?.marcas, id), quitar: { ...criterios, marcas: alternar(criterios.marcas, id) } })),
    ...criterios.subcategorias.map(id => ({ clave: `s${id}`, texto: nombre(opciones?.subcategorias, id), quitar: { ...criterios, subcategorias: alternar(criterios.subcategorias, id) } })),
    ...criterios.tallas.map(id => ({ clave: `t${id}`, texto: `Talla ${nombre(tallas, id)}`, quitar: { ...criterios, tallas: alternar(criterios.tallas, id) } })),
    ...criterios.unidadesMedida.map(u => ({ clave: `u${u}`, texto: u, quitar: { ...criterios, unidadesMedida: alternar(criterios.unidadesMedida, u) } })),
    ...criterios.colores.map(id => ({ clave: `c${id}`, texto: nombre(opciones?.colores, id), quitar: { ...criterios, colores: alternar(criterios.colores, id) } })),
  ]
  if (criterios.precioMin !== null || criterios.precioMax !== null) {
    const texto = criterios.precioMin !== null && criterios.precioMax !== null
      ? `${formatearPrecio(criterios.precioMin)} – ${formatearPrecio(criterios.precioMax)}`
      : criterios.precioMin !== null ? `Desde ${formatearPrecio(criterios.precioMin)}` : `Hasta ${formatearPrecio(criterios.precioMax ?? 0)}`
    etiquetas.push({ clave: 'precio', texto, quitar: { ...criterios, precioMin: null, precioMax: null } })
  }
  return (
    <div className={estilos.activos}>
      <span>Filtros activos:</span>
      {etiquetas.map(e => (
        <button key={e.clave} type="button" className={estilos.quitar} onClick={() => alCambiar(e.quitar)} aria-label={`Quitar filtro ${e.texto}`}>
          {e.texto} <Icono nombre="x" tamano={14} />
        </button>
      ))}
      <button type="button" className={estilos.enlaceBoton} onClick={() => alCambiar(limpiarFiltros(criterios))}>Limpiar filtros</button>
    </div>
  )
}

/** A2 (búsqueda sin resultados, con sugerencias) · A3 (filtros sin coincidencias) · línea vacía. */
function SinResultados({ criterios, modoBusqueda, tituloLinea, alLimpiar, sugerencias }: {
  readonly criterios: CriteriosBusquedaTs
  readonly modoBusqueda: boolean
  readonly tituloLinea: string
  readonly alLimpiar: () => void
  readonly sugerencias: readonly ProductoTarjetaTs[]
}) {
  if (hayFiltros(criterios)) {
    return (
      <EstadoCatalogo icono="sliders" titulo="0 productos con la combinación seleccionada"
        acciones={<button type="button" className={estilos.botonSecundario} onClick={alLimpiar}>Limpiar filtros</button>}>
        No hay productos con esa combinación de filtros. Quita algún filtro o límpialos todos para ver más productos.
      </EstadoCatalogo>
    )
  }
  if (criterios.texto.trim()) {
    return (
      <>
        <EstadoCatalogo icono="search-x" titulo={`Sin resultados para “${criterios.texto.trim()}”`}>
          No encontramos productos. Revisa la ortografía o intenta con otro término{modoBusqueda ? '' : ` dentro de ${tituloLinea.toLowerCase()}`}.
        </EstadoCatalogo>
        {sugerencias.length > 0 && (
          <section aria-labelledby="titulo-sugerencias" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 id="titulo-sugerencias" className={estilos.seccionTitulo}>Te puede interesar</h2>
            <div className={estilos.cuadricula}>
              {sugerencias.map((p, i) => <TarjetaProducto key={p.id} producto={p} indice={i} />)}
            </div>
          </section>
        )}
      </>
    )
  }
  return (
    <EstadoCatalogo icono="package" titulo="Pronto habrá productos aquí">
      Aún no hay productos publicados en {tituloLinea.toLowerCase()}.
    </EstadoCatalogo>
  )
}

/** A1 · Búsqueda en blanco: no se ejecuta; se pide un nombre, modelo o marca y se sugieren términos. */
function BusquedaEnBlanco({ mensaje }: { readonly mensaje: string }) {
  const sugeridos = ['9FORTY', 'New Era', 'Snapback', 'Trucker', 'Negra']
  return (
    <EstadoCatalogo icono="search" titulo="¿Qué estás buscando?"
      acciones={sugeridos.map(t => (
        <Link key={t} to={rutasTienda.busqueda({ ...CRITERIOS_VACIOS, texto: t })} className={estilos.chip}>{t}</Link>
      ))}>
      {mensaje} Prueba con:
    </EstadoCatalogo>
  )
}
