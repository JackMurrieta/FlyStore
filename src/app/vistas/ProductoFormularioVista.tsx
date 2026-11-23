import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { PantallaFormularioProducto } from '@modulos/administrar-catalogo'
import { contenedor } from '../contenedor'
import { RUTAS_CATALOGO, leerEstadoNavegacion, type EstadoNavegacionCatalogo } from './navegacionCatalogo'

/** /admin/catalogo/nuevo y /admin/catalogo/:idProducto/editar: el mismo formulario (Figma B2 / S1). */
export default function ProductoFormularioVista() {
  const { idProducto } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { consulta } = leerEstadoNavegacion(location.state)

  // Se reemplaza la entrada del formulario: «Atrás» desde el catálogo no reabre un formulario ya cerrado.
  const volver = (mensaje?: string) => {
    const estado: EstadoNavegacionCatalogo = { consulta, mensaje }
    navigate(RUTAS_CATALOGO.lista, { replace: true, state: estado })
  }

  return <PantallaFormularioProducto key={idProducto ?? 'nuevo'} catalogoModel={contenedor.catalogoModel}
    productoModel={contenedor.productoModel} idProducto={idProducto} alRegresar={() => volver()} alGuardado={volver} />
}
