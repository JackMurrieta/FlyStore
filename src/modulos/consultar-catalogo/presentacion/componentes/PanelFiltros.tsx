/**
 * Filtros de la línea (Figma B3/S1): marca, tipo (subcategoría), talla por tipo de talla con su unidad,
 * unidad de medida, color y rango de precio. Las opciones vienen del backend con su conteo.
 * En el celular es un panel lateral que se abre con «Filtros».
 */

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Icono } from '@compartido/ui'
import type { OpcionesFiltroTs } from '../../dominio/CatalogoTs'
import type { CriteriosBusquedaTs } from '../../dominio/CriteriosBusquedaTs'
import { alternar, hayFiltros, limpiarFiltros, validarRangoPrecio } from '../../dominio/ReglasCatalogo'
import { formatearPrecio } from '../formato'
import estilos from './tienda.module.css'

export interface PanelFiltrosProps {
  readonly opciones: OpcionesFiltroTs | null
  readonly criterios: CriteriosBusquedaTs
  readonly alCambiar: (criterios: CriteriosBusquedaTs) => void
  /** Solo en el celular. */
  readonly abierto: boolean
  readonly alCerrar: () => void
  readonly etiquetaTipo?: string
}

export function PanelFiltros({ opciones, criterios, alCambiar, abierto, alCerrar, etiquetaTipo = 'Tipo' }: PanelFiltrosProps) {
  const id = useId()
  const panel = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!abierto) return
    panel.current?.focus()
    const alTeclear = (evento: KeyboardEvent) => { if (evento.key === 'Escape') alCerrar() }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [abierto, alCerrar])

  const cambiar = (cambios: Partial<CriteriosBusquedaTs>) => alCambiar({ ...criterios, ...cambios })

  return (
    <>
      {abierto && <div className={estilos.velo} onClick={alCerrar} aria-hidden="true" />}
      <aside
        ref={panel}
        tabIndex={-1}
        aria-labelledby={`${id}-titulo`}
        className={`${estilos.filtros} ${abierto ? estilos.filtrosAbiertos : ''}`}
      >
        <div className={estilos.filtrosEncabezado}>
          <h2 id={`${id}-titulo`}>Filtros</h2>
          <Icono nombre="sliders" tamano={18} />
          <button type="button" className={estilos.cerrarFiltros} onClick={alCerrar} aria-label="Cerrar filtros">
            <Icono nombre="x" tamano={20} />
          </button>
        </div>

        {opciones === null ? (
          <div className={estilos.grupoCuerpo} style={{ paddingTop: 16 }} aria-busy="true">
            <span className={estilos.subgrupo}>Cargando filtros…</span>
          </div>
        ) : (
          <>
            {opciones.marcas.length > 0 && (
              <Grupo titulo="Marca">
                {opciones.marcas.map(marca => (
                  <label key={marca.id} className={estilos.casilla}>
                    <input type="checkbox" checked={criterios.marcas.includes(marca.id)}
                      onChange={() => cambiar({ marcas: alternar(criterios.marcas, marca.id) })} />
                    {marca.nombre} <span>({marca.cantidad})</span>
                  </label>
                ))}
              </Grupo>
            )}

            {opciones.subcategorias.length > 0 && (
              <Grupo titulo={etiquetaTipo}>
                <div className={estilos.pastillas}>
                  {opciones.subcategorias.map(sub => (
                    <button key={sub.id} type="button" className={estilos.pastilla}
                      aria-pressed={criterios.subcategorias.includes(sub.id)}
                      onClick={() => cambiar({ subcategorias: alternar(criterios.subcategorias, sub.id) })}>
                      {sub.nombre}
                    </button>
                  ))}
                </div>
              </Grupo>
            )}

            {opciones.tiposTalla.length > 0 && (
              <Grupo titulo="Talla">
                {opciones.tiposTalla.map(tipo => (
                  <div key={tipo.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {opciones.tiposTalla.length > 1 && (
                      <span className={estilos.subgrupo}>{tipo.nombre}{tipo.unidadMedida ? ` (${tipo.unidadMedida})` : ''}</span>
                    )}
                    <div className={estilos.pastillas}>
                      {tipo.tallas.map(talla => (
                        <button key={talla.id} type="button" className={estilos.pastilla}
                          aria-pressed={criterios.tallas.includes(talla.id)}
                          aria-label={`Talla ${talla.nombre}${tipo.unidadMedida ? ` ${tipo.unidadMedida}` : ''}`}
                          onClick={() => cambiar({ tallas: alternar(criterios.tallas, talla.id) })}>
                          {talla.nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </Grupo>
            )}

            {opciones.unidadesMedida.length > 1 && (
              <Grupo titulo="Unidad de medida">
                <div className={estilos.pastillas}>
                  {opciones.unidadesMedida.map(unidad => (
                    <button key={unidad} type="button" className={estilos.pastilla}
                      aria-pressed={criterios.unidadesMedida.includes(unidad.toLowerCase())}
                      onClick={() => cambiar({ unidadesMedida: alternar(criterios.unidadesMedida, unidad.toLowerCase()) })}>
                      {unidad}
                    </button>
                  ))}
                </div>
              </Grupo>
            )}

            {opciones.colores.length > 0 && (
              <Grupo titulo="Color">
                <div className={estilos.colores}>
                  {opciones.colores.map(color => (
                    <button key={color.id} type="button" className={estilos.color}
                      style={{ background: color.hex ?? 'var(--fly-borde-control)' }}
                      aria-pressed={criterios.colores.includes(color.id)}
                      aria-label={`${color.nombre} (${color.cantidad})`} title={color.nombre}
                      onClick={() => cambiar({ colores: alternar(criterios.colores, color.id) })} />
                  ))}
                </div>
              </Grupo>
            )}

            <Grupo titulo="Rango de precio">
              <RangoPrecio
                key={`${criterios.precioMin ?? ''}-${criterios.precioMax ?? ''}`}
                minimo={criterios.precioMin} maximo={criterios.precioMax}
                sugeridoMinimo={opciones.precioMinimo} sugeridoMaximo={opciones.precioMaximo}
                alAplicar={(precioMin, precioMax) => cambiar({ precioMin, precioMax })}
              />
            </Grupo>
          </>
        )}

        <div className={estilos.filtrosPie}>
          <button type="button" className={estilos.botonSecundario} disabled={!hayFiltros(criterios)}
            onClick={() => alCambiar(limpiarFiltros(criterios))}>
            Limpiar filtros
          </button>
          {abierto && <button type="button" className={estilos.botonPrimario} onClick={alCerrar}>Ver resultados</button>}
        </div>
      </aside>
    </>
  )
}

function Grupo({ titulo, children }: { readonly titulo: string; readonly children: ReactNode }) {
  return (
    <details className={estilos.grupo} open>
      <summary>{titulo}<Icono nombre="chevron-down" tamano={16} /></summary>
      <div className={estilos.grupoCuerpo}>{children}</div>
    </details>
  )
}

interface RangoPrecioProps {
  readonly minimo: number | null
  readonly maximo: number | null
  readonly sugeridoMinimo: number | null
  readonly sugeridoMaximo: number | null
  readonly alAplicar: (minimo: number | null, maximo: number | null) => void
}

/** Mínimo y máximo sobre el precio de referencia; se aplica con Enter o «Aplicar». Se monta de nuevo (key) si cambian desde fuera. */
function RangoPrecio({ minimo, maximo, sugeridoMinimo, sugeridoMaximo, alAplicar }: RangoPrecioProps) {
  const id = useId()
  const [textoMinimo, setTextoMinimo] = useState(minimo?.toString() ?? '')
  const [textoMaximo, setTextoMaximo] = useState(maximo?.toString() ?? '')
  const [error, setError] = useState<string | null>(null)

  const leer = (texto: string): number | null => (texto.trim() === '' ? null : Number(texto))
  const aplicar = (evento: FormEvent) => {
    evento.preventDefault()
    const nuevoMinimo = leer(textoMinimo)
    const nuevoMaximo = leer(textoMaximo)
    if ((nuevoMinimo !== null && Number.isNaN(nuevoMinimo)) || (nuevoMaximo !== null && Number.isNaN(nuevoMaximo))) {
      setError('Escribe solo números.')
      return
    }
    const mensaje = validarRangoPrecio(nuevoMinimo, nuevoMaximo)
    setError(mensaje)
    if (!mensaje) alAplicar(nuevoMinimo, nuevoMaximo)
  }

  return (
    <form onSubmit={aplicar} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className={estilos.rango}>
        <label htmlFor={`${id}-min`}>Mínimo
          <input id={`${id}-min`} inputMode="decimal" value={textoMinimo} onChange={e => setTextoMinimo(e.target.value)}
            placeholder={sugeridoMinimo !== null ? formatearPrecio(sugeridoMinimo) : '$0'} aria-invalid={Boolean(error)} />
        </label>
        <label htmlFor={`${id}-max`}>Máximo
          <input id={`${id}-max`} inputMode="decimal" value={textoMaximo} onChange={e => setTextoMaximo(e.target.value)}
            placeholder={sugeridoMaximo !== null ? formatearPrecio(sugeridoMaximo) : 'Sin límite'} aria-invalid={Boolean(error)} />
        </label>
      </div>
      {error && <span className={estilos.errorCampo} role="alert">{error}</span>}
      <button type="submit" className={estilos.botonSecundario} style={{ height: 36 }}>Aplicar</button>
    </form>
  )
}
