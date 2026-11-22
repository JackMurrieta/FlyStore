import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { CatalogoEnCursoModel } from '../../aplicacion/CatalogoEnCursoModel'
import type { OrdenCatalogo } from '../../dominio/CriteriosBusquedaTs'
import type { ProductoCatalogoTs } from '../../dominio/ProductoCatalogoTs'
import { useCatalogo } from '../hooks/useCatalogo'
import styles from './CatalogoView.module.css'

interface CatalogoViewProps {
    modelo: CatalogoEnCursoModel
    whatsappUrl?: string
}

const COLORES_HEX: Record<string, string> = {
    negro: '#111111',
    blanco: '#f5f5f4',
    rojo: '#b91c1c',
    azul: '#1d4ed8',
    crema: '#e7e0d0',
    morado: '#7e22ce',
    verde: '#15803d',
    gris: '#52525b',
    cafe: '#78350f',
    dorado: '#ca8a04',
    amarillo: '#eab308',
    rosa: '#ec4899',
}

function obtenerColorHex(nombreColor: string): string {
    const clave = nombreColor.trim().toLowerCase()
    return COLORES_HEX[clave] ?? '#6e6e76'
}

export function CatalogoView({
    modelo,
    whatsappUrl = 'https://wa.me/',
}: CatalogoViewProps) {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const {
        productos,
        productosBase,
        opcionesFiltro,
        criterios,
        cargando,
        error,
        sinResultados,
        cargarCatalogo,
        aplicarFiltro,
        actualizarFiltrosVisuales,
        limpiarFiltros,
    } = useCatalogo(modelo)

    const terminoUrl = searchParams.get('termino') ?? ''
    const categoriaUrl = searchParams.get('categoria') ?? ''

    const [terminoInput, setTerminoInput] = useState(terminoUrl)
    const [cantidades, setCantidades] = useState<Record<string, number>>({})

    useEffect(() => {
        setTerminoInput(terminoUrl)
        if (terminoUrl.trim() || categoriaUrl.trim()) {
            void aplicarFiltro({
                termino: terminoUrl || undefined,
                idCategoria: categoriaUrl || undefined,
            })
        } else {
            void cargarCatalogo()
        }
    }, [terminoUrl, categoriaUrl, aplicarFiltro, cargarCatalogo])

    const categoriaActiva = useMemo(() => {
        if (!criterios.idCategoria) return null
        return (
            opcionesFiltro.categorias.find((c) => c.id === criterios.idCategoria) ?? null
        )
    }, [opcionesFiltro.categorias, criterios.idCategoria])

    const conteoMarcas = useMemo(() => {
        const mapa = new Map<string, number>()
        for (const p of productosBase) {
            if (!p.marca) continue
            mapa.set(p.marca, (mapa.get(p.marca) ?? 0) + 1)
        }
        return mapa
    }, [productosBase])

    const subcategoriasDisponibles = useMemo(() => {
        const mapa = new Map<string, number>()
        for (const p of productosBase) {
            if (!p.subcategoria) continue
            mapa.set(p.subcategoria, (mapa.get(p.subcategoria) ?? 0) + 1)
        }
        return Array.from(mapa.entries())
    }, [productosBase])

    const coloresDisponibles = useMemo(() => {
        const conjunto = new Set<string>()
        for (const p of productosBase) {
            for (const v of p.variantes) {
                if (v.color.trim()) conjunto.add(v.color.trim())
            }
        }
        return Array.from(conjunto)
    }, [productosBase])

    const rangoPrecios = useMemo(() => {
        if (productosBase.length === 0) return { min: 0, max: 1000 }
        let min = Number.POSITIVE_INFINITY
        let max = 0
        for (const p of productosBase) {
            if (p.precioBase < min) min = p.precioBase
            if (p.precioBase > max) max = p.precioBase
        }
        return {
            min: Number.isFinite(min) ? min : 0,
            max: max > 0 ? max : 1000,
        }
    }, [productosBase])

    const totalConExistencia = useMemo(
        () => productosBase.filter((p) => p.disponible).length,
        [productosBase]
    )

    const marcasParaMostrar = useMemo(() => {
        if (opcionesFiltro.marcas.length > 0) {
            return opcionesFiltro.marcas.map((m) => m.nombre)
        }
        return Array.from(conteoMarcas.keys())
    }, [opcionesFiltro.marcas, conteoMarcas])

    const manejarBusqueda = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const limpio = terminoInput.trim()
        const nuevosParams = new URLSearchParams(searchParams)
        if (limpio) {
            nuevosParams.set('termino', limpio)
        } else {
            nuevosParams.delete('termino')
        }
        setSearchParams(nuevosParams)
        await aplicarFiltro({
            termino: limpio || undefined,
            idCategoria: criterios.idCategoria,
        })
    }

    const toggleMarca = (nombreMarca: string) => {
        const actuales = criterios.marcas ?? []
        const existe = actuales.includes(nombreMarca)
        const siguientes = existe
            ? actuales.filter((m) => m !== nombreMarca)
            : [...actuales, nombreMarca]
        actualizarFiltrosVisuales({ marcas: siguientes })
    }

    const seleccionarCategoria = async (idCategoria?: string) => {
        const nuevosParams = new URLSearchParams(searchParams)
        if (idCategoria) {
            nuevosParams.set('categoria', idCategoria)
        } else {
            nuevosParams.delete('categoria')
        }
        setSearchParams(nuevosParams)
        await aplicarFiltro({
            termino: criterios.termino,
            idCategoria,
        })
    }

    const manejarLimpiarTodo = async () => {
        setTerminoInput('')
        setSearchParams(new URLSearchParams())
        await limpiarFiltros()
    }

    const seleccionarProducto = (idProducto: string) => {
        navigate(`/catalogo/producto/${encodeURIComponent(idProducto)}`)
    }

    const cambiarCantidadTarjeta = (idProducto: string, delta: number) => {
        setCantidades((prev) => {
            const actual = prev[idProducto] ?? 1
            return { ...prev, [idProducto]: Math.max(1, actual + delta) }
        })
    }

    const renderTarjeta = (producto: ProductoCatalogoTs) => {
        const cantidad = cantidades[producto.id] ?? 1
        return (
            <article key={producto.id} className={styles.tarjeta}>
                <div
                    className={styles.imagenContenedor}
                    onClick={() => seleccionarProducto(producto.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            seleccionarProducto(producto.id)
                        }
                    }}
                >
                    {producto.imagenPrincipal ? (
                        <img
                            src={producto.imagenPrincipal}
                            alt={producto.nombre}
                            className={styles.imagenProducto}
                            loading="lazy"
                        />
                    ) : (
                        <span className={styles.sinImagen}>Sin imagen</span>
                    )}
                </div>

                <div className={styles.tarjetaCuerpo}>
                    <span className={styles.marcaEtiqueta}>
                        {producto.marca || 'FLY STORE'}
                    </span>
                    <h3
                        className={styles.nombreProducto}
                        onClick={() => seleccionarProducto(producto.id)}
                    >
                        {producto.nombre}
                    </h3>
                    <p className={styles.precioProducto}>
                        ${producto.precioBase.toLocaleString('es-MX')}
                    </p>

                    <div className={styles.selectorCantidad}>
                        <button
                            type="button"
                            className={styles.botonCantidad}
                            onClick={() => cambiarCantidadTarjeta(producto.id, -1)}
                            aria-label="Disminuir cantidad"
                        >
                            −
                        </button>
                        <span className={styles.valorCantidad}>{cantidad}</span>
                        <button
                            type="button"
                            className={styles.botonCantidad}
                            onClick={() => cambiarCantidadTarjeta(producto.id, 1)}
                            aria-label="Aumentar cantidad"
                        >
                            +
                        </button>
                    </div>

                    <button
                        type="button"
                        className={styles.botonPrimario}
                        disabled={!producto.disponible}
                        onClick={() => seleccionarProducto(producto.id)}
                    >
                        {producto.disponible ? '+ AGREGAR' : 'AGOTADO'}
                    </button>

                    <button
                        type="button"
                        className={styles.botonSecundario}
                        onClick={() => seleccionarProducto(producto.id)}
                    >
                        VER FOTOS
                    </button>
                </div>
            </article>
        )
    }

    return (
        <section className={styles.pagina}>
            <div className={styles.contenedor}>
                <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
                    <button
                        type="button"
                        className={styles.botonAtras}
                        onClick={() => navigate(-1)}
                    >
                        ← Atrás
                    </button>
                    <span className={styles.migas}>
                        Inicio /{' '}
                        <strong className={styles.migaActiva}>
                            {categoriaActiva?.nombre ?? 'Catálogo'}
                        </strong>
                    </span>
                </nav>

                <header className={styles.encabezado}>
                    <div>
                        <h1 className={styles.titulo}>
                            EXPLORA{' '}
                            {(categoriaActiva?.nombre ?? 'EL CATÁLOGO').toUpperCase()}
                        </h1>
                        <p className={styles.subtitulo}>
                            Descubre nuestra colección con diseños exclusivos, materiales de
                            alta calidad y las marcas más reconocidas del streetwear nacional
                            e internacional.
                        </p>
                    </div>

                    <form className={styles.barraBusqueda} onSubmit={manejarBusqueda}>
                        <input
                            type="search"
                            value={terminoInput}
                            onChange={(e) => setTerminoInput(e.target.value)}
                            placeholder="Buscar productos, marca o modelo..."
                            className={styles.inputBusqueda}
                            aria-label="Buscar productos"
                        />
                        <button type="submit" className={styles.botonBuscar}>
                            Buscar
                        </button>
                    </form>
                </header>

                {/* Chips rápidos de marcas */}
                {marcasParaMostrar.length > 0 && (
                    <div className={styles.filaChips} role="list">
                        {marcasParaMostrar.map((marca) => {
                            const activa = (criterios.marcas ?? []).includes(marca)
                            return (
                                <button
                                    key={marca}
                                    type="button"
                                    className={`${styles.chip} ${activa ? styles.chipActivo : ''}`}
                                    onClick={() => toggleMarca(marca)}
                                >
                                    {marca}
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* Estado de error */}
                {error ? (
                    <div className={styles.estadoCentro} role="alert">
                        <div className={styles.iconoError} aria-hidden="true">
                            ⚠
                        </div>
                        <h2 className={styles.estadoTitulo}>
                            No pudimos cargar los productos
                        </h2>
                        <p className={styles.estadoTexto}>{error}</p>
                        <button
                            type="button"
                            className={styles.botonReintentar}
                            onClick={() => void cargarCatalogo()}
                        >
                            ↻ REINTENTAR
                        </button>
                    </div>
                ) : cargando ? (
                    <div className={styles.estadoCentro}>
                        <p className={styles.estadoTexto}>Cargando catálogo...</p>
                    </div>
                ) : sinResultados ? (
                    <div className={styles.estadoCentro}>
                        <div className={styles.iconoLupa} aria-hidden="true">
                            ⌕
                        </div>
                        <h2 className={styles.estadoTitulo}>
                            {criterios.termino
                                ? `No se encontraron productos para “${criterios.termino}”`
                                : 'No se encontraron productos con estos filtros'}
                        </h2>
                        <p className={styles.estadoTexto}>
                            Revisa que el nombre, modelo o marca esté bien escrito o limpia
                            los filtros para explorar todo el catálogo.
                        </p>
                        <div className={styles.accionesVacio}>
                            <button
                                type="button"
                                className={styles.botonReintentar}
                                onClick={() => void manejarLimpiarTodo()}
                            >
                                LIMPIAR BÚSQUEDA
                            </button>
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.botonWhatsapp}
                            >
                                PREGÚNTANOS POR WHATSAPP
                            </a>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className={styles.barraOrden}>
                            <label className={styles.etiquetaOrden}>
                                Ordenar por:
                                <select
                                    className={styles.selectOrden}
                                    value={criterios.orden ?? 'precio-asc'}
                                    onChange={(e) =>
                                        actualizarFiltrosVisuales({
                                            orden: e.target.value as OrdenCatalogo,
                                        })
                                    }
                                >
                                    <option value="precio-asc">Precio: menor a mayor</option>
                                    <option value="precio-desc">Precio: mayor a menor</option>
                                    <option value="nombre-asc">Nombre: A - Z</option>
                                </select>
                            </label>
                            <span className={styles.contadorResultados}>
                                {productos.length} productos
                            </span>
                        </div>

                        <div className={styles.layoutPrincipal}>
                            <div className={styles.gridProductos}>
                                {productos.map(renderTarjeta)}
                            </div>

                            <aside className={styles.panelFiltros} aria-label="Filtros">
                                {opcionesFiltro.categorias.length > 0 && (
                                    <div className={styles.grupoFiltro}>
                                        <h3 className={styles.tituloFiltro}>CATEGORÍA</h3>
                                        <label className={styles.opcionCheckbox}>
                                            <input
                                                type="radio"
                                                name="categoria"
                                                checked={!criterios.idCategoria}
                                                onChange={() => void seleccionarCategoria(undefined)}
                                            />
                                            <span>Todas</span>
                                        </label>
                                        {opcionesFiltro.categorias.map((cat) => (
                                            <label key={cat.id} className={styles.opcionCheckbox}>
                                                <input
                                                    type="radio"
                                                    name="categoria"
                                                    checked={criterios.idCategoria === cat.id}
                                                    onChange={() => void seleccionarCategoria(cat.id)}
                                                />
                                                <span>{cat.nombre}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {marcasParaMostrar.length > 0 && (
                                    <div className={styles.grupoFiltro}>
                                        <h3 className={styles.tituloFiltro}>MARCA</h3>
                                        {marcasParaMostrar.map((marca) => {
                                            const seleccionada = (criterios.marcas ?? []).includes(
                                                marca
                                            )
                                            return (
                                                <label key={marca} className={styles.opcionCheckbox}>
                                                    <input
                                                        type="checkbox"
                                                        checked={seleccionada}
                                                        onChange={() => toggleMarca(marca)}
                                                    />
                                                    <span className={styles.opcionTexto}>{marca}</span>
                                                    <span className={styles.conteo}>
                                                        {conteoMarcas.get(marca) ?? 0}
                                                    </span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                )}

                                {subcategoriasDisponibles.length > 0 && (
                                    <div className={styles.grupoFiltro}>
                                        <h3 className={styles.tituloFiltro}>TIPO</h3>
                                        {subcategoriasDisponibles.map(([sub, total]) => (
                                            <label key={sub} className={styles.opcionCheckbox}>
                                                <input
                                                    type="checkbox"
                                                    checked={criterios.subcategoria === sub}
                                                    onChange={() =>
                                                        actualizarFiltrosVisuales({
                                                            subcategoria:
                                                                criterios.subcategoria === sub
                                                                    ? undefined
                                                                    : sub,
                                                        })
                                                    }
                                                />
                                                <span className={styles.opcionTexto}>{sub}</span>
                                                <span className={styles.conteo}>{total}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {coloresDisponibles.length > 0 && (
                                    <div className={styles.grupoFiltro}>
                                        <h3 className={styles.tituloFiltro}>COLOR</h3>
                                        <div className={styles.listaColores}>
                                            {coloresDisponibles.map((color) => {
                                                const activo = criterios.color === color
                                                return (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        title={color}
                                                        aria-label={`Filtrar por color ${color}`}
                                                        className={`${styles.circuloColor} ${activo ? styles.circuloColorActivo : ''
                                                            }`}
                                                        style={{ backgroundColor: obtenerColorHex(color) }}
                                                        onClick={() =>
                                                            actualizarFiltrosVisuales({
                                                                color: activo ? undefined : color,
                                                            })
                                                        }
                                                    />
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className={styles.grupoFiltro}>
                                    <h3 className={styles.tituloFiltro}>PRECIO MÁXIMO</h3>
                                    <input
                                        type="range"
                                        min={rangoPrecios.min}
                                        max={rangoPrecios.max}
                                        value={criterios.precioMax ?? rangoPrecios.max}
                                        onChange={(e) =>
                                            actualizarFiltrosVisuales({
                                                precioMax: Number(e.target.value),
                                            })
                                        }
                                        className={styles.rangoPrecio}
                                    />
                                    <div className={styles.etiquetasRango}>
                                        <span>${rangoPrecios.min}</span>
                                        <span>${criterios.precioMax ?? rangoPrecios.max}</span>
                                    </div>
                                </div>

                                <div className={styles.grupoFiltro}>
                                    <h3 className={styles.tituloFiltro}>DISPONIBILIDAD</h3>
                                    <label className={styles.opcionCheckbox}>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(criterios.soloConExistencia)}
                                            onChange={(e) =>
                                                actualizarFiltrosVisuales({
                                                    soloConExistencia: e.target.checked,
                                                })
                                            }
                                        />
                                        <span className={styles.opcionTexto}>
                                            Solo con existencia
                                        </span>
                                        <span className={styles.conteo}>{totalConExistencia}</span>
                                    </label>
                                </div>

                                <button
                                    type="button"
                                    className={styles.botonLimpiar}
                                    onClick={() => void manejarLimpiarTodo()}
                                >
                                    LIMPIAR FILTROS
                                </button>
                            </aside>
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}