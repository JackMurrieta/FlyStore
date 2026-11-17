import { useState } from 'react'
import { useSesion } from '@compartido/sesion/SesionContext'
import { Aviso } from '@compartido/ui/Aviso'
import { PantallaCatalogoAdmin, PantallaNuevoProducto, ProductoModel } from '@modulos/administrar-catalogo'
import { CatalogoAdminLayout } from '@modulos/administrar-catalogo/presentacion/componentes/CatalogoAdminLayout'
import { contenedor } from '../contenedor'
export default function CatalogoAdminVista() {
 const {usuario,cerrarSesion}=useSesion()
 const [alta,setAlta]=useState<ProductoModel|null>(null)
 const [mensaje,setMensaje]=useState<string|null>(null)
 const [error,setError]=useState<string|null>(null)
 return <CatalogoAdminLayout nuevoProducto={alta!==null} usuario={usuario??undefined} alVerCatalogo={()=>setError(null)} alCerrarSesion={()=>{void cerrarSesion().catch(e=>setError(e instanceof Error?e.message:'No se pudo cerrar sesión'))}}>
 {error&&<Aviso tono="error">{error}</Aviso>}
 {alta ? <PantallaNuevoProducto catalogoModel={contenedor.catalogoModel} productoModel={alta} alRegresar={()=>setAlta(null)} alRegistrado={texto=>{setMensaje(texto);setAlta(null)}}/>
 : <PantallaCatalogoAdmin catalogoModel={contenedor.catalogoModel} mensaje={mensaje} alCerrarMensaje={()=>setMensaje(null)} alAgregar={()=>{setMensaje(null);setAlta(new ProductoModel(contenedor.productoService))}}/>}
 </CatalogoAdminLayout>
}
