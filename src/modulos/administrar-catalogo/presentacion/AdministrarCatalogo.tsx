import { useState } from 'react'
import type { ICatalogoService } from '../dominio/puertos/ICatalogoService'
import type { IProductoService } from '../dominio/puertos/IProductoService'
import { CatalogoModel } from '../aplicacion/CatalogoModel'
import { BajaProductoModel } from '../aplicacion/BajaProductoModel'
import { ProductoModel } from '../aplicacion/ProductoModel'
import { PantallaCatalogoAdmin } from './vistas/PantallaCatalogoAdmin'
import { PantallaNuevoProducto } from './vistas/PantallaNuevoProducto'
import { CatalogoAdminLayout, type IdentidadAdmin } from './componentes/CatalogoAdminLayout'

interface Props {
  catalogoService: ICatalogoService
  productoService: IProductoService
  usuario?: IdentidadAdmin
  alCerrarSesion?: () => void
}

/** Montar dentro de RutaProtegida con los roles autorizados. Los servicios deben ser estables. */
export function AdministrarCatalogo({ catalogoService, productoService, usuario, alCerrarSesion }: Props) {
  const [modelos] = useState(() => ({
    catalogo: new CatalogoModel(catalogoService, productoService),
    baja: new BajaProductoModel(productoService),
  }))
  const [alta, setAlta] = useState<ProductoModel | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  return <CatalogoAdminLayout nuevoProducto={alta !== null} usuario={usuario} alCerrarSesion={alCerrarSesion}
    alVerCatalogo={() => { if (!alta) setMensaje(null) }}>
    {alta
    ? <PantallaNuevoProducto catalogoModel={modelos.catalogo} productoModel={alta} alRegresar={() => setAlta(null)}
        alRegistrado={texto => { setMensaje(texto); setAlta(null) }} />
    : <PantallaCatalogoAdmin catalogoModel={modelos.catalogo} bajaProductoModel={modelos.baja}
      mensaje={mensaje} alCerrarMensaje={() => setMensaje(null)}
      alAgregar={() => { setMensaje(null); setAlta(new ProductoModel(productoService)) }} />}
  </CatalogoAdminLayout>
}
