/**
 * CU-01 · B2 «Marcas de la línea en mosaico» (/categoria/:linea). Antes del catálogo se muestran las
 * marcas con productos visibles en la línea; el cliente elige una o «Ver todo».
 */

import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Esqueleto, Icono } from '@compartido/ui'
import { CATEGORIAS, categoriaPorClave } from '@compartido/config/marca'
import { CRITERIOS_VACIOS } from '../../dominio/ReglasCatalogo'
import { useCatalogo } from '../hooks/useCatalogo'
import { PaginaTienda } from '../componentes/PaginaTienda'
import { EstadoCatalogo, ErrorCatalogo } from '../componentes/EstadosCatalogo'
import { rutasTienda } from '../rutasTienda'
import { nombreLinea, productos as textoProductos } from '../formato'
import estilos from '../componentes/tienda.module.css'

export default function MarcasLineaView({ ruta }: { readonly ruta: string }) {
  const estado = useCatalogo({ tipo: 'linea', ruta }, CRITERIOS_VACIOS)
  const presentacion = categoriaPorClave(ruta)
  const nombre = estado.linea?.nombre ?? presentacion?.nombre ?? ruta.toUpperCase()
  const titulo = presentacion?.titulo ?? nombreLinea(nombre)
  const imagen = presentacion?.imagen ?? estado.linea?.logoUrl ?? null
  const marcas = estado.opciones?.marcas ?? []
  const noExiste = estado.error?.tipo === 'negocio' && !estado.linea

  return (
    <PaginaTienda migas={[{ etiqueta: titulo }]}>
      <section className={estilos.heroe}>
        <div className={estilos.titulos}>
          <span className={estilos.sobretitulo}>FLY{nombre}</span>
          <h1 className={estilos.titulo}>{titulo}</h1>
          <p className={estilos.descripcion}>
            {presentacion?.descripcion ?? 'Elige una marca para ver sus modelos o mira todos los productos de la línea.'}
          </p>
        </div>
        {imagen && <div className={estilos.heroeImagen}><img src={imagen} alt="" /></div>}
      </section>

      {noExiste ? (
        <EstadoCatalogo icono="search-x" titulo="No encontramos esa línea"
          acciones={CATEGORIAS.map(c => <Link key={c.clave} to={c.ruta} className={estilos.chip}>{c.titulo}</Link>)}>
          Elige una de nuestras líneas de producto.
        </EstadoCatalogo>
      ) : estado.error ? (
        <ErrorCatalogo mensaje={estado.error.mensaje} alReintentar={() => void estado.reintentar()} />
      ) : (
        <section aria-labelledby="titulo-marcas" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 id="titulo-marcas" className={estilos.seccionTitulo}>Marcas</h2>
          {estado.cargando || !estado.opciones ? (
            <div className={estilos.mosaico} role="status" aria-busy="true">
              <span className={estilos.oculto}>Cargando las marcas…</span>
              {Array.from({ length: 6 }, (_, i) => <Esqueleto key={i} forma="bloque" alto={120} />)}
            </div>
          ) : marcas.length === 0 ? (
            <EstadoCatalogo icono="package" titulo="Pronto habrá productos aquí">
              Aún no hay productos publicados en {titulo.toLowerCase()}. Mientras, revisa nuestras otras líneas.
            </EstadoCatalogo>
          ) : (
            <div className={estilos.mosaico}>
              {marcas.map((marca, indice) => (
                <Link key={marca.id} to={rutasTienda.productosLinea(ruta, { ...CRITERIOS_VACIOS, marcas: [marca.id] })}
                  className={estilos.marca} style={{ '--retraso': `${indice * 50}ms` } as CSSProperties}>
                  <span className={estilos.marcaTexto}>
                    <span className={estilos.sobretitulo}>Marca</span>
                    <span className={estilos.marcaNombre}>{marca.nombre}</span>
                    <span className={estilos.marcaConteo}>{textoProductos(marca.cantidad)}</span>
                  </span>
                  <span className={estilos.marcaLogo} aria-hidden="true">
                    {marca.logoUrl
                      ? <img src={marca.logoUrl} alt="" loading="lazy" />
                      : <span className={estilos.marcaInicial}>{marca.nombre.charAt(0)}</span>}
                  </span>
                  <span className={estilos.flecha} aria-hidden="true"><Icono nombre="arrow-right" tamano={16} /></span>
                </Link>
              ))}
              <Link to={rutasTienda.productosLinea(ruta)} className={`${estilos.marca} ${estilos.verTodo}`}
                style={{ '--retraso': `${marcas.length * 50}ms` } as CSSProperties}>
                <span className={estilos.marcaTexto}>
                  <span className={estilos.sobretitulo}>Toda la línea</span>
                  <span className={estilos.marcaNombre}>Ver todo</span>
                  <span className={estilos.marcaConteo}>{textoProductos(estado.total)}</span>
                </span>
                <span className={estilos.flecha} aria-hidden="true"><Icono nombre="arrow-right" tamano={16} /></span>
              </Link>
            </div>
          )}
        </section>
      )}
    </PaginaTienda>
  )
}
