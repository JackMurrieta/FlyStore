/**
 * Página de una sección del panel que aún no tiene backend («Pronto»): dice qué incluirá y
 * ofrece volver a lo que sí funciona. Así la navegación no tiene enlaces rotos.
 */

import { Link, Navigate } from 'react-router-dom'
import { useSesion } from '@compartido/sesion'
import { Icono } from '@compartido/ui/iconos/Icono'
import { Insignia } from '@compartido/ui/Insignia'
import { RUTA_PANEL, seccionPorClave, type ClaveSeccion } from '../secciones'
import estilos from '../componentes/panel.module.css'

export interface ProximamenteViewProps {
  readonly seccion: ClaveSeccion
}

export function ProximamenteView({ seccion: clave }: ProximamenteViewProps) {
  const { usuario } = useSesion()
  const seccion = seccionPorClave(clave)
  // Empleados y Configuración son solo del administrador.
  if (!usuario || !seccion.roles.includes(usuario.rol)) return <Navigate to={RUTA_PANEL} replace />

  return (
    <div className={estilos.pagina}>
      <header className={estilos.encabezado}>
        <div>
          <p className={estilos.sobretitulo}>Administrar tienda</p>
          <h1 className={estilos.titulo}>{seccion.etiqueta}</h1>
          <p className={estilos.subtitulo}>{seccion.descripcion}</p>
        </div>
      </header>
      <section className={estilos.pronta} aria-labelledby="titulo-pronta">
        <span className={estilos.icono} aria-hidden="true"><Icono nombre={seccion.icono} tamano={26} /></span>
        <div>
          <Insignia tono="info">Próximamente</Insignia>
          <h2 id="titulo-pronta" className={estilos.tituloSeccion}>Esta sección todavía no está disponible</h2>
          <p className={estilos.subtitulo}>Cuando esté lista podrás:</p>
        </div>
        <ul>
          {seccion.incluira?.map((punto) => (
            <li key={punto}><Icono nombre="check" tamano={16} /> {punto}</li>
          ))}
        </ul>
        <div className={estilos.accionesPronta}>
          <Link to={RUTA_PANEL} className={estilos.enlace}><Icono nombre="chevron-left" tamano={14} /> Volver al inicio del panel</Link>
        </div>
      </section>
    </div>
  )
}

export default ProximamenteView
