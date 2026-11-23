/**
 * DatosPersonalesView · Pestaña «Datos personales»: nombre, apellidos y teléfono editables;
 * el correo se muestra y se cambia en Seguridad (requiere confirmación por correo).
 */

import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Aviso, Boton, Campo, Icono, Texto } from '@compartido/ui'
import type { PerfilTs } from '../../dominio/PerfilTs'
import { useDatosPersonales } from '../hooks/useDatosPersonales'
import { useModelosPerfil } from '../ModelosPerfilContext'
import { TarjetaPerfil } from '../componentes/PaginaPerfil'
import estilos from '../componentes/perfil.module.css'

export default function DatosPersonalesView({ perfil }: { readonly perfil: PerfilTs }) {
  // `key`: si el perfil cambia (otra pestaña, otro usuario), el formulario arranca de nuevo.
  return <FormularioDatos key={`${perfil.nombre}|${perfil.apellidos}|${perfil.telefono}`} perfil={perfil} />
}

function FormularioDatos({ perfil }: { readonly perfil: PerfilTs }) {
  const vm = useDatosPersonales(perfil)
  const { rutaBase } = useModelosPerfil()

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    void vm.guardar()
  }

  return (
    <>
      <TarjetaPerfil id="datos" titulo="Datos personales" icono="user"
        descripcion="Así aparecerás en tus pedidos. Tu teléfono nos ayuda a coordinar la entrega.">
        <form className={estilos.formulario} onSubmit={enviar} noValidate>
          {vm.guardado && (
            <div role="status"><Aviso tono="exito" titulo="Guardamos tus datos">Tus cambios ya se ven en tu cuenta.</Aviso></div>
          )}
          {vm.error && <Aviso tono="error" titulo="No se guardaron tus cambios">{vm.error.mensaje}</Aviso>}
          <div className={estilos.rejilla}>
            <Campo etiqueta="Nombre" value={vm.datos.nombre} onChange={(e) => vm.cambiar('nombre', e.target.value)}
              autoComplete="given-name" error={vm.errores.nombre} maxLength={80} required />
            <Campo etiqueta="Apellidos" value={vm.datos.apellidos} onChange={(e) => vm.cambiar('apellidos', e.target.value)}
              autoComplete="family-name" error={vm.errores.apellidos} maxLength={120} required />
            <Campo etiqueta="Teléfono (opcional)" type="tel" inputMode="numeric" value={vm.datos.telefono}
              onChange={(e) => vm.cambiar('telefono', e.target.value)} autoComplete="tel-national"
              placeholder="644 123 4567" error={vm.errores.telefono} ayuda="10 dígitos, sin lada" />
            <div className={estilos.dato}>
              <Texto variante="etiqueta" tono="secundario">Correo electrónico</Texto>
              <Texto variante="etiqueta-fuerte" className={estilos.cortar}>{perfil.correo}</Texto>
              <Link to={`${rutaBase}/seguridad`} className={estilos.enlace}>
                {perfil.conGoogle && !perfil.tieneContrasena ? 'Ver cómo entras' : 'Cambiar correo'} <Icono nombre="arrow-right" tamano={14} />
              </Link>
            </div>
          </div>
          <div className={estilos.acciones}>
            <Boton type="submit" variante="primario" cargando={vm.guardando} disabled={!vm.modificado}
              icono={<Icono nombre="check" tamano={18} />}>
              Guardar cambios
            </Boton>
            {vm.modificado && !vm.guardando && <Boton type="button" variante="fantasma" onClick={vm.descartar}>Descartar</Boton>}
          </div>
        </form>
      </TarjetaPerfil>
    </>
  )
}
