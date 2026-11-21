/**
 * SeguridadView · Pestaña «Seguridad»: cómo entras, correo, contraseña y sesiones.
 * Cambiar el correo envía un enlace de confirmación; la contraseña pide la actual;
 * las cuentas solo de Google no tienen contraseña de FlyStore.
 */

import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Aviso, Boton, Campo, Dialogo, Icono, Texto } from '@compartido/ui'
import type { PerfilTs } from '../../dominio/PerfilTs'
import { useSeguridad } from '../hooks/useSeguridad'
import { TarjetaPerfil } from '../componentes/PaginaPerfil'
import estilos from '../componentes/perfil.module.css'

export default function SeguridadView({ perfil }: { readonly perfil: PerfilTs }) {
  const vm = useSeguridad()
  const navegar = useNavigate()
  const soloGoogle = perfil.conGoogle && !perfil.tieneContrasena

  const enviarCorreo = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    vm.enviarCorreo()
  }
  const enviarContrasena = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    vm.guardarContrasena()
  }
  const cerrarSesiones = async () => {
    if (await vm.cerrarSesiones()) navegar('/iniciar-sesion', { replace: true })
  }

  return (
    <>
      <TarjetaPerfil id="acceso" titulo="Cómo entras" icono="key"
        descripcion="Las formas de iniciar sesión vinculadas a tu cuenta.">
        <ul className={estilos.metodos}>
          {perfil.tieneContrasena && (
            <li><Icono nombre="mail" tamano={18} /><span><strong>Correo y contraseña</strong><br />{perfil.correo}</span></li>
          )}
          {perfil.conGoogle && (
            <li><Icono nombre="google" tamano={18} /><span><strong>Google</strong><br />{perfil.correo}</span></li>
          )}
        </ul>
      </TarjetaPerfil>

      <TarjetaPerfil id="correo" titulo="Correo electrónico" icono="mail"
        descripcion={soloGoogle ? 'Tu cuenta entra con Google: tu correo es el de tu cuenta de Google.' : 'Te enviaremos un enlace al correo nuevo para confirmarlo.'}>
        <div className={estilos.dato}>
          <Texto variante="etiqueta" tono="secundario">Correo actual</Texto>
          <Texto variante="etiqueta-fuerte" className={estilos.cortar}>{perfil.correo}</Texto>
        </div>
        {perfil.correoPendiente && (
          <Aviso tono="info" titulo="Confirma tu nuevo correo">
            Enviamos un enlace a {perfil.correoPendiente}. Hasta que lo abras seguirás entrando con {perfil.correo}.
          </Aviso>
        )}
        {vm.mensajeCorreo && <div role="status"><Aviso tono="exito" titulo="Revisa tu correo">{vm.mensajeCorreo}</Aviso></div>}
        {!soloGoogle && (
          <form className={estilos.formularioLinea} onSubmit={enviarCorreo} noValidate>
            <Campo etiqueta="Nuevo correo" type="email" value={vm.correo} onChange={(e) => vm.cambiarCorreo(e.target.value)}
              autoComplete="email" error={vm.errorCorreo ?? undefined} />
            <Boton type="submit" variante="secundario" cargando={vm.enviandoCorreo} icono={<Icono nombre="mail" tamano={18} />}>
              Enviar enlace
            </Boton>
          </form>
        )}
      </TarjetaPerfil>

      <TarjetaPerfil id="contrasena" titulo="Contraseña" icono="lock"
        descripcion={soloGoogle ? 'Tu cuenta entra con Google, así que no tiene contraseña de FlyStore.' : 'Mínimo 8 caracteres, con letras y números.'}>
        {!soloGoogle && (
          <form className={estilos.formulario} onSubmit={enviarContrasena} noValidate>
            {vm.contrasenaCambiada && (
              <div role="status"><Aviso tono="exito" titulo="Contraseña actualizada">Usa tu nueva contraseña la próxima vez que entres.</Aviso></div>
            )}
            {vm.errorContrasena && <Aviso tono="error" titulo="No cambiamos tu contraseña">{vm.errorContrasena}</Aviso>}
            <div className={estilos.rejilla}>
              <Campo etiqueta="Contraseña actual" type="password" value={vm.contrasena.actual}
                onChange={(e) => vm.cambiarContrasena('actual', e.target.value)} autoComplete="current-password"
                error={vm.erroresContrasena.actual} />
              <span aria-hidden="true" className={estilos.separadorRejilla} />
              <Campo etiqueta="Nueva contraseña" type="password" value={vm.contrasena.nueva}
                onChange={(e) => vm.cambiarContrasena('nueva', e.target.value)} autoComplete="new-password"
                error={vm.erroresContrasena.nueva} />
              <Campo etiqueta="Confirma la nueva contraseña" type="password" value={vm.contrasena.confirmacion}
                onChange={(e) => vm.cambiarContrasena('confirmacion', e.target.value)} autoComplete="new-password"
                error={vm.erroresContrasena.confirmacion} />
            </div>
            <div className={estilos.acciones}>
              <Boton type="submit" variante="primario" cargando={vm.cambiandoContrasena} icono={<Icono nombre="lock" tamano={18} />}>
                Cambiar contraseña
              </Boton>
              <Link to="/recuperar-contrasena" className={estilos.enlace}>¿Olvidaste tu contraseña?</Link>
            </div>
          </form>
        )}
      </TarjetaPerfil>

      <TarjetaPerfil id="sesiones" titulo="Sesiones" icono="shield"
        descripcion="Si usaste tu cuenta en un equipo ajeno o crees que alguien más entró, cierra la sesión en todos lados.">
        {vm.errorSesiones && <Aviso tono="error">{vm.errorSesiones}</Aviso>}
        <div className={estilos.acciones}>
          <Boton variante="secundario" icono={<Icono nombre="logout" tamano={18} />} onClick={vm.pedirCerrarSesiones}>
            Cerrar sesión en todos los dispositivos
          </Boton>
        </div>
      </TarjetaPerfil>

      <Dialogo abierto={vm.confirmarSesiones} alCerrar={vm.cancelarCerrarSesiones} titulo="¿Cerrar todas tus sesiones?" icono="logout">
        <Texto variante="cuerpo" como="p" tono="secundario">
          Saldrás de FlyStore en todos tus dispositivos, incluido este. Tu carrito y tus pedidos se conservan.
        </Texto>
        <div className={estilos.accionesDialogo}>
          <Boton variante="secundario" onClick={vm.cancelarCerrarSesiones}>Cancelar</Boton>
          <Boton variante="primario" cargando={vm.cerrandoSesiones} onClick={() => void cerrarSesiones()}>Cerrar sesiones</Boton>
        </div>
      </Dialogo>
    </>
  )
}
