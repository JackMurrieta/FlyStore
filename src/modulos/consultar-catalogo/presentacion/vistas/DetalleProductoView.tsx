import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { CatalogoEnCursoModel } from '../../aplicacion/CatalogoEnCursoModel'
import { useDetalleProducto } from '../hooks/useDetalleProducto'
import styles from './DetalleProductoView.module.css'

interface DetalleProductoViewProps {
    modelo: CatalogoEnCursoModel
    onAgregarAlCarrito?: (sku: string, cantidad: number) => void
    whatsappUrl?: string
}

export function DetalleProductoView({
    modelo,
    onAgregarAlCarrito,
    whatsappUrl = 'https://wa.me/',
}: DetalleProductoViewProps) {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const {
        detalle,
        cargando,
        error,
        varianteSeleccionada,
        cantidad,
        puedeAgregarAlCarrito,
        cargarDetalles,
        seleccionarVariante,
        cambiarCantidad,
    } = useDetalleProducto(modelo)

    const [indiceImagen, setIndiceImagen] = useState(0)
    const [avisoAgregado, setAvisoAgregado] = useState(false)

    useEffect(() => {
        setIndiceImagen(0)
        setAvisoAgregado(false)
        if (id) {
            void cargarDetalles(id)
        }
    }, [id, cargarDetalles])

    const coloresUnicos = useMemo(() => {
        const variantes = detalle?.variantes ?? []
        return Array.from(new Set(variantes.map((v) => v.color).filter(Boolean)))
    }, [detalle])

    const tallasParaColor = useMemo(() => {
        const variantes = detalle?.variantes ?? []
        const colorActual = varianteSeleccionada?.color
        if (!colorActual) return variantes
        return variantes.filter((v) => v.color === colorActual)
    }, [detalle, varianteSeleccionada])

    const precioUnitario = useMemo(() => {
        const precios = detalle?.precios ?? []
        if (precios.length === 0) return 0
        // Busca el mejor nivel aplicable segun cantidad minima
        const ordenados = [...precios].sort(
            (a, b) => (b.cantidadMinima ?? 1) - (a.cantidadMinima ?? 1)
        )
        const aplicable =
            ordenados.find((p) => cantidad >= (p.cantidadMinima ?? 1)) ??
            precios[0]
        return aplicable?.precio ?? 0
    }, [detalle, cantidad])

    const imagenActiva =
        detalle?.imagenes[indiceImagen] ?? detalle?.imagenes[0] ?? ''

    const manejarSeleccionColor = (color: string) => {
        const variantes = detalle?.variantes ?? []
        const candidata =
            variantes.find((v) => v.color === color && v.activa && v.stock > 0) ??
            variantes.find((v) => v.color === color)
        if (candidata) {
            seleccionarVariante(candidata.sku)
        }
    }

    const manejarAgregar = () => {
        if (!puedeAgregarAlCarrito || !varianteSeleccionada) return
        onAgregarAlCarrito?.(varianteSeleccionada.sku, cantidad)
        setAvisoAgregado(true)
        setTimeout(() => setAvisoAgregado(false), 3000)
    }

    if (cargando) {
        return (
            <section className={styles.pagina}>
                <div className={styles.estadoCentro}>Cargando producto...</div>
            </section>
        )
    }

    if (error || !detalle) {
        return (
            <section className={styles.pagina}>
                <div className={styles.estadoCentro}>
                    <h2>No pudimos cargar el producto</h2>
                    <p className={styles.textoSecundario}>
                        {error ?? 'El producto solicitado no está disponible.'}
                    </p>
                    <button
                        type="button"
                        className={styles.botonVolver}
                        onClick={() => navigate('/catalogo')}
                    >
                        ← Volver al catálogo
                    </button>
                </div>
            </section>
        )
    }

    return (
        <section className={styles.pagina}>
            <div className={styles.contenedor}>
                {avisoAgregado && (
                    <div className={styles.toastExito} role="status">
                        Agregado al carrito · {detalle.nombre} × {cantidad}
                    </div>
                )}

                <nav className={styles.breadcrumb}>
                    <button
                        type="button"
                        className={styles.botonAtras}
                        onClick={() => navigate(-1)}
                    >
                        ← Atrás
                    </button>
                    <span>
                        Inicio / {detalle.categoria?.nombre ?? 'Catálogo'} /{' '}
                        <strong className={styles.migaActiva}>{detalle.nombre}</strong>
                    </span>
                </nav>

                <div className={styles.layoutDetalle}>
                    {/* Galería izquierda */}
                    <div className={styles.galeria}>
                        <div className={styles.imagenPrincipalBox}>
                            {imagenActiva ? (
                                <img
                                    src={imagenActiva}
                                    alt={detalle.nombre}
                                    className={styles.imagenPrincipal}
                                />
                            ) : (
                                <span className={styles.sinImagen}>Sin imagen disponible</span>
                            )}
                        </div>

                        {detalle.imagenes.length > 1 && (
                            <div className={styles.miniaturas}>
                                {detalle.imagenes.map((url, idx) => (
                                    <button
                                        key={`${url}-${idx}`}
                                        type="button"
                                        className={`${styles.miniaturaBtn} ${idx === indiceImagen ? styles.miniaturaActiva : ''
                                            }`}
                                        onClick={() => setIndiceImagen(idx)}
                                    >
                                        <img
                                            src={url}
                                            alt={`${detalle.nombre} vista ${idx + 1}`}
                                            className={styles.miniaturaImg}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Información derecha */}
                    <div className={styles.panelInfo}>
                        <span className={styles.marca}>
                            {detalle.marca?.nombre ?? 'FLY STORE'}
                        </span>
                        <h1 className={styles.titulo}>{detalle.nombre}</h1>
                        {detalle.subcategoria && (
                            <span className={styles.subcategoria}>
                                {detalle.subcategoria.nombre}
                            </span>
                        )}
                        {detalle.descripcion && (
                            <p className={styles.descripcion}>{detalle.descripcion}</p>
                        )}

                        {/* Precios por nivel */}
                        {detalle.precios.length > 0 && (
                            <div className={styles.listaPrecios}>
                                {detalle.precios.map((nivel) => (
                                    <div key={nivel.tipoPrecio} className={styles.filaPrecio}>
                                        <div>
                                            <strong className={styles.tipoPrecio}>
                                                {nivel.tipoPrecio}
                                            </strong>
                                            {nivel.cantidadMinima && nivel.cantidadMinima > 1 && (
                                                <span className={styles.minimoPiezas}>
                                                    Desde {nivel.cantidadMinima} piezas
                                                </span>
                                            )}
                                        </div>
                                        <span className={styles.montoPrecio}>
                                            ${nivel.precio.toLocaleString('es-MX')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Selector de color */}
                        {coloresUnicos.length > 0 && (
                            <div className={styles.bloqueVariante}>
                                <span className={styles.etiquetaVariante}>
                                    COLOR: <strong>{varianteSeleccionada?.color}</strong>
                                </span>
                                <div className={styles.filaOpciones}>
                                    {coloresUnicos.map((color) => {
                                        const activo = varianteSeleccionada?.color === color
                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`${styles.opcionPastilla} ${activo ? styles.opcionActiva : ''
                                                    }`}
                                                onClick={() => manejarSeleccionColor(color)}
                                            >
                                                {color}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Selector de talla */}
                        {tallasParaColor.length > 0 && (
                            <div className={styles.bloqueVariante}>
                                <span className={styles.etiquetaVariante}>TALLA / AJUSTE</span>
                                <div className={styles.filaOpciones}>
                                    {tallasParaColor.map((variante) => {
                                        const seleccionada =
                                            varianteSeleccionada?.sku === variante.sku
                                        const sinStock = !variante.activa || variante.stock <= 0
                                        return (
                                            <button
                                                key={variante.sku}
                                                type="button"
                                                disabled={sinStock}
                                                className={`${styles.opcionPastilla} ${seleccionada ? styles.opcionActiva : ''
                                                    }`}
                                                onClick={() => seleccionarVariante(variante.sku)}
                                            >
                                                {variante.talla}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Disponibilidad */}
                        <div
                            className={
                                puedeAgregarAlCarrito
                                    ? styles.estadoDisponible
                                    : styles.estadoAgotado
                            }
                        >
                            {puedeAgregarAlCarrito
                                ? `● Disponible · ${varianteSeleccionada?.stock ?? 0} piezas`
                                : '● Sin existencias disponibles'}
                        </div>

                        {/* Cantidad + subtotal */}
                        <div className={styles.filaCompra}>
                            <div className={styles.selectorCantidad}>
                                <button
                                    type="button"
                                    onClick={() => cambiarCantidad(cantidad - 1)}
                                    disabled={!puedeAgregarAlCarrito || cantidad <= 1}
                                >
                                    −
                                </button>
                                <span>{cantidad}</span>
                                <button
                                    type="button"
                                    onClick={() => cambiarCantidad(cantidad + 1)}
                                    disabled={
                                        !puedeAgregarAlCarrito ||
                                        cantidad >= (varianteSeleccionada?.stock ?? 1)
                                    }
                                >
                                    +
                                </button>
                            </div>
                            <span className={styles.subtotal}>
                                Subtotal:{' '}
                                <strong>
                                    ${(precioUnitario * cantidad).toLocaleString('es-MX')}
                                </strong>
                            </span>
                        </div>

                        {/* Acciones */}
                        <div className={styles.filaAcciones}>
                            <button
                                type="button"
                                className={styles.botonAgregar}
                                disabled={!puedeAgregarAlCarrito}
                                onClick={manejarAgregar}
                            >
                                AGREGAR AL CARRITO
                            </button>
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.botonWhatsappIcono}
                                aria-label="Consultar por WhatsApp"
                            >
                                WA
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}