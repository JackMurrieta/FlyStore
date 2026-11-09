/**
 * Vista de Registro
 * Basada en diseño registrarse.png
 */

import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { contenedor } from '@app/contenedor'
import { useRegistro } from '../hooks/useRegistro'
import { Texto } from '@compartido/ui/Texto'
import { Campo } from '@compartido/ui/Campo'
import { Boton } from '@compartido/ui/Boton'
import { Aviso } from '@compartido/ui/Aviso'
import { Radio } from '@compartido/ui/Radio'
import { Icono } from '@compartido/ui/iconos/Icono'
import type { TipoCliente } from '../../aplicacion/dto/RegistroDTO'
import styles from './RegistroVista.module.css'

export default function RegistroVista() {
  const navigate = useNavigate()

  const [nombreCompleto, setNombreCompleto] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tipoCliente, setTipoCliente] = useState<TipoCliente>('BASE')

  const { cargando, error, exitoso, registrar, registrarConGoogle } = useRegistro(
    contenedor.autenticacionService,
    contenedor.sesionModel
  )

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Dividir nombre completo en nombre y apellidos
    const partes = nombreCompleto.trim().split(' ')
    const nombre = partes[0] || ''
    const apellidos = partes.slice(1).join(' ') || ''

    const resultado = await registrar({
      nombre,
      apellidos,
      email,
      telefono,
      password,
      tipo_usuario: tipoCliente,
    })

    if (resultado && exitoso) {
      navigate('/')
    }
  }

  const handleGoogleRegistro = () => {
    registrarConGoogle()
  }

  return (
    <div className={styles.contenedor}>
      <div className={styles.tarjeta}>
        {/* Logo FLY */}
        <div className={styles.logo}>
          <img src="/flyBlanco.svg" alt="FLY" className={styles.logoImagen} />
        </div>

        {/* Ícono de usuario circular */}
        <div className={styles.iconoUsuario}>
          <Icono nombre="user" tamano={32} />
        </div>

        {/* Encabezado */}
        <header className={styles.encabezado}>
          <Texto variante="h2" como="h1">
            Crear cuenta
          </Texto>
          <Texto variante="cuerpo" tono="secundario">
            Guarda tu historial, favoritos y datos para comprar más rápido.
          </Texto>
        </header>

        {error && <Aviso tono="error">{error.mensaje}</Aviso>}

        {exitoso && (
          <Aviso tono="exito">
            Cuenta creada exitosamente. Revisa tu correo para confirmar tu cuenta.
          </Aviso>
        )}

        {/* Botón de Google primero */}
        <Boton
          variante="secundario"
          anchoCompleto
          onClick={handleGoogleRegistro}
          disabled={cargando}
          icono={<Icono nombre="google" tamano={20} />}
        >
          Continuar con Google
        </Boton>

        {/* Divisor */}
        <div className={styles.divisor}>
          <span className={styles.divisorLinea} />
          <Texto variante="etiqueta" tono="secundario">
            o
          </Texto>
          <span className={styles.divisorLinea} />
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className={styles.formulario}>
          <Campo
            type="text"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            placeholder="Nombre completo"
            required
            autoComplete="name"
          />

          <Campo
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Teléfono"
            required
            autoComplete="tel"
          />

          <Campo
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            required
            autoComplete="email"
          />

          <Campo
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
            autoComplete="new-password"
          />

          {/* Tipo de cliente */}
          <div className={styles.tipoCliente}>
            <Texto variante="etiqueta-fuerte" className={styles.tipoClienteTitulo}>
              Tipo de cliente
            </Texto>
            <div className={styles.tipoClienteOpciones}>
              <Radio
                name="tipo_cliente"
                value="BASE"
                etiqueta="Base"
                descripcion="Precios regulares"
                checked={tipoCliente === 'BASE'}
                onChange={(e) => setTipoCliente(e.target.value as TipoCliente)}
              />
              <Radio
                name="tipo_cliente"
                value="MAYOREO"
                etiqueta="Mayoreo"
                descripcion="Descuentos por volumen"
                checked={tipoCliente === 'MAYOREO'}
                onChange={(e) => setTipoCliente(e.target.value as TipoCliente)}
              />
              <Radio
                name="tipo_cliente"
                value="DISTRIBUIDOR"
                etiqueta="Distribuidor"
                descripcion="Precios especiales de distribución"
                checked={tipoCliente === 'DISTRIBUIDOR'}
                onChange={(e) => setTipoCliente(e.target.value as TipoCliente)}
              />
              <Radio
                name="tipo_cliente"
                value="EMPRENDEDOR"
                etiqueta="Emprendedor"
                descripcion="Herramientas para tu negocio"
                checked={tipoCliente === 'EMPRENDEDOR'}
                onChange={(e) => setTipoCliente(e.target.value as TipoCliente)}
              />
              <Radio
                name="tipo_cliente"
                value="SOCIO_COMERCIAL"
                etiqueta="Socio comercial"
                descripcion="Beneficios exclusivos"
                checked={tipoCliente === 'SOCIO_COMERCIAL'}
                onChange={(e) => setTipoCliente(e.target.value as TipoCliente)}
              />
            </div>
          </div>

          <Boton type="submit" variante="primario" anchoCompleto cargando={cargando}>
            CREAR CUENTA
          </Boton>
        </form>

        {/* Footer */}
        <footer className={styles.pie}>
          <Texto variante="cuerpo-s" tono="secundario">
            ¿Ya tienes cuenta?{' '}
            <Link to="/iniciar-sesion" className={styles.enlace}>
              Inicia sesión
            </Link>
          </Texto>
          <Texto variante="mini" tono="secundario" className={styles.footer}>
            FLY STORE · CIUDAD OBREGÓN
          </Texto>
        </footer>
      </div>
    </div>
  )
}
