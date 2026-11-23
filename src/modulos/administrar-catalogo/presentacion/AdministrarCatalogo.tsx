import { useCallback, useState } from 'react'
import type { ICatalogoService } from '../dominio/puertos/ICatalogoService'
import type { IProductoService } from '../dominio/puertos/IProductoService'
import { CatalogoModel } from '../aplicacion/CatalogoModel'
import { BajaProductoModel } from '../aplicacion/BajaProductoModel'
import { ProductoModel } from '../aplicacion/ProductoModel'
import type { ConsultaCatalogoTs } from './hooks/useCatalogoAdmin'
import { PantallaCatalogoAdmin } from './vistas/PantallaCatalogoAdmin'
import { PantallaFormularioProducto } from './vistas/PantallaFormularioProducto'

interface Props {
  catalogoService: ICatalogoService
  productoService: IProductoService
}

type Vista = { tipo: 'catalogo' } | { tipo: 'formulario'; idProducto?: string }

/**
 * Raíz autocontenida del caso de uso (catálogo ↔ formulario) para usarlo sin rutas, p. ej. en la demostración.
 * En la app real cada pantalla tiene su ruta dentro del panel «Administrar tienda». Los servicios deben ser estables.
 */
export function AdministrarCatalogo({ catalogoService, productoService }: Props) {
  const [modelos] = useState(() => ({
    catalogo: new CatalogoModel(catalogoService, productoService),
    baja: new BajaProductoModel(productoService),
    producto: new ProductoModel(productoService),
  }))
  const [vista, setVista] = useState<Vista>({ tipo: 'catalogo' })
  const [consulta, setConsulta] = useState<ConsultaCatalogoTs | undefined>(undefined)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const volver = () => setVista({ tipo: 'catalogo' })
  const cerrarMensaje = useCallback(() => setMensaje(null), [])

  return vista.tipo === 'formulario'
    ? <PantallaFormularioProducto key={vista.idProducto ?? 'nuevo'} catalogoModel={modelos.catalogo} productoModel={modelos.producto}
        idProducto={vista.idProducto} alRegresar={volver} alGuardado={texto => { setMensaje(texto); volver() }} />
    : <PantallaCatalogoAdmin catalogoModel={modelos.catalogo} bajaProductoModel={modelos.baja} consultaInicial={consulta}
        mensaje={mensaje} alCerrarMensaje={cerrarMensaje}
        alAgregar={() => { setMensaje(null); setVista({ tipo: 'formulario' }) }}
        alEditar={(idProducto, actual) => { setMensaje(null); setConsulta(actual); setVista({ tipo: 'formulario', idProducto }) }} />
}
