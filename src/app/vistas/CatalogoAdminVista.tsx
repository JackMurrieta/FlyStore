import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { PantallaCatalogoAdmin } from '@modulos/administrar-catalogo'
import { contenedor } from '../contenedor'
import { RUTAS_CATALOGO, consultaDesdeUrl, leerEstadoNavegacion, type EstadoNavegacionCatalogo } from './navegacionCatalogo'

/**
 * /admin/catalogo: lista del CU-03 dentro del panel. El alta y la edición tienen su propia ruta.
 * Cambiar el filtro de la URL (p. ej. de `?estado=BORRADOR` al catálogo completo desde la barra) reinicia la lista.
 */
export default function CatalogoAdminVista() {
  const { search } = useLocation()
  return <CatalogoAdmin key={search} />
}

function CatalogoAdmin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [parametros] = useSearchParams()
  const [inicial] = useState(() => {
    const estado = leerEstadoNavegacion(location.state)
    return { mensaje: estado.mensaje ?? null, consulta: estado.consulta ?? consultaDesdeUrl(parametros) }
  })
  const [mensaje, setMensaje] = useState<string | null>(inicial.mensaje)
  const cerrarMensaje = useCallback(() => setMensaje(null), [])

  // El aviso de éxito se muestra una vez: se retira del historial para que «Atrás» o recargar no lo repitan.
  useEffect(() => {
    if (inicial.mensaje) {
      const estado: EstadoNavegacionCatalogo = { consulta: inicial.consulta }
      navigate(`${location.pathname}${location.search}`, { replace: true, state: estado })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al llegar
  }, [])

  return <PantallaCatalogoAdmin catalogoModel={contenedor.catalogoModel} bajaProductoModel={contenedor.bajaProductoModel}
    consultaInicial={inicial.consulta} mensaje={mensaje} alCerrarMensaje={cerrarMensaje}
    alAgregar={() => navigate(RUTAS_CATALOGO.nuevo)}
    alEditar={(idProducto, consulta) => {
      const estado: EstadoNavegacionCatalogo = { consulta }
      navigate(RUTAS_CATALOGO.editar(idProducto), { state: estado })
    }} />
}
