import { useEffect, useState } from 'react'
import { AdministrarCatalogo } from '@modulos/administrar-catalogo'
import { crearServiciosCatalogoDemo } from './serviciosCatalogoDemo'
import estilos from './AdministrarCatalogoDemo.module.css'

export default function AdministrarCatalogoDemo() {
  const [servicios] = useState(crearServiciosCatalogoDemo)
  useEffect(() => () => servicios.liberarImagenes(), [servicios])

  return <>
    <div className={estilos.aviso} role="note">
      <strong>Modo de prueba · Administrar catálogo</strong>
      <span>Datos en memoria, sin backend. Puedes filtrar, crear productos y dar de baja. Recarga para reiniciar.</span>
    </div>
    <AdministrarCatalogo catalogoService={servicios.catalogoService} productoService={servicios.productoService}
      usuario={{ nombre: 'Usuario de prueba', rol: 'Demostración', iniciales: 'DP' }} />
  </>
}
