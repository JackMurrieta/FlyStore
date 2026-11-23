import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Header } from '@compartido/layout/Header'
import { Footer } from '@compartido/layout/Footer'
import { Icono, Texto, type NombreIcono } from '@compartido/ui'
import type { PerfilTs } from '../../dominio/PerfilTs'
import { useModelosPerfil } from '../ModelosPerfilContext'
import estilos from './perfil.module.css'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** Página «Mi perfil»: resumen de la cuenta, pestañas (con URL propia) y el contenido de la pestaña. */
export function PaginaPerfil({ perfil, children }: { readonly perfil: PerfilTs | null; readonly children: ReactNode }) {
  const { rutaBase } = useModelosPerfil()
  const pestanas: { ruta: string; etiqueta: string; corta?: string; icono: NombreIcono; fin?: boolean }[] = [
    { ruta: rutaBase, etiqueta: 'Datos personales', corta: 'Datos', icono: 'user', fin: true },
  ]
  if (!perfil || perfil.tipoUsuario === 'cliente') pestanas.push({ ruta: `${rutaBase}/direcciones`, etiqueta: 'Direcciones', icono: 'pin' })
  pestanas.push({ ruta: `${rutaBase}/seguridad`, etiqueta: 'Seguridad', icono: 'shield' })

  return (
    <div className={estilos.pagina}>
      <Header />
      <main className={estilos.contenido}>
        <div className={estilos.titulos}>
          <Texto variante="sobretitulo" tono="secundario">Mi cuenta</Texto>
          <Texto variante="h1" como="h1">Mi perfil</Texto>
        </div>

        {perfil && (
          <section className={estilos.resumen} aria-label="Resumen de tu cuenta">
            <span className={estilos.avatarGrande} aria-hidden="true">{perfil.iniciales}</span>
            <div className={estilos.resumenTexto}>
              <Texto variante="h3" como="p">{perfil.nombreCompleto || 'Sin nombre'}</Texto>
              <Texto variante="cuerpo-s" tono="secundario" className={estilos.cortar}>{perfil.correo}</Texto>
              <div className={estilos.etiquetas}>
                <span className={estilos.etiqueta}>{perfil.etiquetaTipoUsuario}</span>
                {perfil.conGoogle && <span className={estilos.etiqueta}><Icono nombre="google" tamano={12} /> Google</span>}
                {perfil.miembroDesde && (
                  <span className={estilos.etiqueta}>
                    Desde {MESES[perfil.miembroDesde.getMonth()]} {perfil.miembroDesde.getFullYear()}
                  </span>
                )}
              </div>
            </div>
            {perfil.tipoUsuario === 'cliente' && (
              <Link to="/mis-pedidos" className={estilos.accesoPedidos}>
                <Icono nombre="package" tamano={18} /> Mis pedidos <Icono nombre="arrow-right" tamano={16} />
              </Link>
            )}
          </section>
        )}

        <nav className={estilos.pestanas} aria-label="Secciones de tu perfil">
          {pestanas.map((pestana) => (
            <NavLink key={pestana.ruta} to={pestana.ruta} end={pestana.fin} className={estilos.pestana}>
              <Icono nombre={pestana.icono} tamano={18} />
              {/* En móvil se muestra la etiqueta corta para que las tres pestañas quepan sin desplazarse;
                  el nombre accesible sigue siendo la etiqueta completa. */}
              <span className={pestana.corta ? estilos.etiquetaLarga : undefined}>{pestana.etiqueta}</span>
              {pestana.corta && <span className={estilos.etiquetaCorta} aria-hidden="true">{pestana.corta}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={estilos.panel}>{children}</div>
      </main>
      <Footer />
    </div>
  )
}

/** Tarjeta de sección con título, descripción y contenido. */
export function TarjetaPerfil({ titulo, descripcion, icono, children, id }: {
  readonly titulo: string
  readonly descripcion?: ReactNode
  readonly icono?: NombreIcono
  readonly children: ReactNode
  readonly id?: string
}) {
  const tituloId = id ? `${id}-titulo` : undefined
  return (
    <section className={estilos.tarjeta} aria-labelledby={tituloId} id={id}>
      <div className={estilos.encabezadoTarjeta}>
        {icono && <span className={estilos.iconoTarjeta} aria-hidden="true"><Icono nombre={icono} tamano={20} /></span>}
        <div>
          <Texto variante="h3" como="h2" id={tituloId}>{titulo}</Texto>
          {descripcion && <Texto variante="cuerpo-s" como="p" tono="secundario">{descripcion}</Texto>}
        </div>
      </div>
      {children}
    </section>
  )
}
