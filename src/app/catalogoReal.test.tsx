import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { SesionProvider } from '@compartido/sesion'
import type { EstadoSesionTs, ISesion } from '@compartido/sesion/ISesion'
import { Rutas } from './rutas'
vi.mock('./contenedor', async()=>{
 const {HttpClient}=await import('@infraestructura/http/HttpClient')
 const {ProductoService}=await import('@modulos/administrar-catalogo/infraestructura/ProductoService')
 const {CatalogoService}=await import('@modulos/administrar-catalogo/infraestructura/CatalogoService')
 const {CatalogoModel}=await import('@modulos/administrar-catalogo/aplicacion/CatalogoModel')
 const {BajaProductoModel}=await import('@modulos/administrar-catalogo/aplicacion/BajaProductoModel')
 const http=new HttpClient();const productoService=new ProductoService(http)
 return {contenedor:{bajaProductoModel:new BajaProductoModel(productoService),productoService,catalogoModel:new CatalogoModel(new CatalogoService(http),productoService)}}
})
vi.mock('@modulos/iniciar-sesion',()=>({IniciarSesionVista:()=> <p>Inicio de sesión requerido</p>}))
vi.mock('./vistas/InicioVista',()=>({default:()=> <p>Inicio público</p>}))
const opciones={categorias:[{id:'9223372036854775807',nombre:'Gorras'}],subcategorias:[{id:'2',nombre:'Clásicas'}],marcas:[{id:'3',nombre:'FLY'}],colores:['Rojo','Negro']}
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status})
const paginaJson=(productos:unknown[])=>json({productos,pagina:0,tamano:7,hayMas:false})
const blobTexto=(blob:Blob)=>new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsText(blob)})
function api(status=201, colores=opciones.colores){
 let terminar=()=>{}
 const pasos:string[]=[];const altas:Record<string,unknown>[]=[];let guardado=false
 vi.stubGlobal('fetch',vi.fn(async(url:string,init:RequestInit)=>{
  const u=new URL(url,'http://localhost');pasos.push(`${init.method} ${u.pathname}${u.search}`)
  expect(init.credentials).toBe('include')
  if(init.method==='POST'){
   expect(init.body).toBeInstanceOf(FormData);expect(new Headers(init.headers).has('Content-Type')).toBe(false)
   const form=init.body as FormData;const dto=JSON.parse(await blobTexto(form.get('producto') as Blob));altas.push(dto)
   expect(form.get('imagen')).toBeInstanceOf(File);expect(dto.imagenes).toBeUndefined()
   if(status===0)return new Promise<Response>(resolve=>{terminar=()=>{guardado=true;resolve(new Response(null,{status:201}))}})
   if(status!==201)return json({error:'DATOS_INVALIDOS',message:'Selecciona un color existente'},status)
   guardado=true;return new Response(null,{status:201})
  }
  if(u.pathname.endsWith('/filtros'))return json({...opciones,colores})
  if(u.pathname.endsWith('/tallas'))return json([{idTalla:'5',nombre:'M'}])
  return paginaJson(guardado?[{idProducto:'42',clave:'NUEVA',nombre:'Gorra nueva',img:'https://example.com/gorra.png',categoria:'Gorras',subcategoria:'Clásicas',marca:'FLY',estado:'BORRADOR',variantes:[{talla:'M',color:'Rojo',stock:7}],preciosProducto:[{tipoPrecio:'BASE',precio:100,minPiezas:1}]}]:[])
 }))
 return {pasos,altas,terminar:()=>terminar()}
}
function abrir(rol:'ADMIN'|'EMPLEADO'|'CLIENTE'|null='ADMIN'){
 const estado:EstadoSesionTs=rol?{estado:'autenticado',usuario:{id:1,nombre:'Admin',correo:'a@example.com',telefono:null,rol,perfilCompleto:true,iniciales:'AP'}}:{estado:'anonimo',usuario:null}
 const sesion:ISesion={obtenerEstado:()=>estado,suscribir:()=>()=>{},iniciarConGoogle:vi.fn(),cerrarSesion:vi.fn()}
 render(<MemoryRouter initialEntries={['/admin/catalogo']}><SesionProvider sesion={sesion}><Rutas/></SesionProvider></MemoryRouter>)
 return userEvent.setup()
}
async function formulario(user:ReturnType<typeof userEvent.setup>){
 await user.click(await screen.findByRole('button',{name:'Nuevo producto'}))
 await user.click(await screen.findByRole('button',{name:'Gorras'}))
 await screen.findByRole('option',{name:'M'})
 await user.selectOptions(screen.getByRole('combobox',{name:/^Marca/}),'3')
 await user.selectOptions(screen.getByRole('combobox',{name:/^Tipo de producto/}),'2')
 await user.type(screen.getByLabelText('Nombre / modelo *'),'Gorra nueva')
 await user.type(screen.getByLabelText('Clave / SKU *'),'NUEVA')
 await user.type(screen.getByLabelText('Descripción *'),'Gorra bordada')
 await user.upload(screen.getByLabelText('Imagen del producto'),new File([new Uint8Array([137,80,78,71,13,10,26,10])],'gorra.png',{type:'image/png'}))
 expect(screen.getByRole('option',{name:'Negro'})).toBeInTheDocument()
 await user.selectOptions(screen.getByRole('combobox',{name:'Color predominante *'}),'Rojo')
 await user.selectOptions(screen.getByRole('combobox',{name:'Talla *'}),'M')
 await user.clear(screen.getByLabelText('Existencia *'));await user.type(screen.getByLabelText('Existencia *'),'7')
 await user.click(screen.getByRole('button',{name:'Agregar variante'}))
 await user.type(screen.getByLabelText('Base *'),'100')
}
beforeEach(()=>{Object.defineProperty(URL,'createObjectURL',{value:vi.fn(()=> 'blob:preview'),writable:true,configurable:true});Object.defineProperty(URL,'revokeObjectURL',{value:vi.fn(),writable:true,configurable:true})})
afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks()})
describe('Catálogo real restaurado',()=>{
 it.each([null,'CLIENTE'] as const)('impide acceder sin permisos: %s',async rol=>{
  const backend=api();abrir(rol);await screen.findByText(rol?'Inicio público':'Inicio de sesión requerido');expect(backend.pasos).toHaveLength(0)
 })
 it.each(['ADMIN','EMPLEADO'] as const)('consulta con rol %s y rechaza búsqueda vacía sin HTTP',async rol=>{
  const backend=api();const user=abrir(rol);await screen.findByText('No encontramos productos')
  expect(backend.pasos).toEqual(['GET /api/productos?pagina=0&tamano=7','GET /api/catalogo/filtros'])
  await user.click(screen.getByRole('button',{name:'Buscar'}));await screen.findByText('Selecciona al menos un filtro para buscar.')
  expect(backend.pasos).toHaveLength(2)
  await user.type(screen.getByRole('searchbox'),'Gorra & roja');await user.click(screen.getByRole('button',{name:'Buscar'}))
  await waitFor(()=>expect(backend.pasos.at(-1)).toBe('GET /api/productos/buscar?texto=Gorra+%26+roja&pagina=0&tamano=7'))
  expect(backend.pasos.filter(p=>p.includes('/filtros'))).toHaveLength(1)
 })
 it('selecciona colores y envía una sola alta multipart, recarga tras 201',async()=>{
  const backend=api();const user=abrir();await formulario(user)
  await user.click(screen.getAllByRole('button',{name:'Guardar'})[0]!)
  await screen.findByText('Gorra nueva')
  expect(backend.altas).toHaveLength(1)
  expect(backend.altas[0]).toMatchObject({idCategoria:'9223372036854775807',variantes:[{talla:'M',color:'Rojo',stock:7}],preciosProducto:[{tipoPrecio:'BASE',precio:100,minPiezas:1}]})
  await waitFor(()=>expect(backend.pasos.filter(p=>p==='GET /api/productos?pagina=0&tamano=7')).toHaveLength(2))
 })
 it.each([400,409])('conserva formulario y muestra validación del backend %s',async status=>{
  const backend=api(status);const user=abrir();await formulario(user)
  await user.click(screen.getAllByRole('button',{name:'Guardar'})[0]!)
  await screen.findByText(/Selecciona un color existente/)
  expect(screen.getByLabelText('Clave / SKU *')).toBeEnabled();expect(backend.altas).toHaveLength(1)
 })

 it('bloquea envíos duplicados mientras espera la confirmación',async()=>{
  const backend=api(0);const user=abrir();await formulario(user)
  await user.click(screen.getAllByRole('button',{name:'Guardar'})[0]!)
  await waitFor(()=>expect(backend.altas).toHaveLength(1))
  expect(screen.getAllByRole('button',{name:/Guardar/})[0]).toBeDisabled()
  backend.terminar();await screen.findByText('Gorra nueva');expect(backend.altas).toHaveLength(1)
 })
 it('no permite variantes si el catálogo no tiene colores',async()=>{
  api(201,[]);const user=abrir()
  await user.click(await screen.findByRole('button',{name:'Nuevo producto'}))
  await screen.findByRole('option',{name:'Sin colores disponibles'})
  expect(screen.getByRole('combobox',{name:'Color predominante *'})).toBeDisabled()
  expect(screen.getByRole('button',{name:'Agregar variante'})).toBeDisabled()
 })
 it('rechaza imágenes mayores al límite sin enviar el alta',async()=>{
  const backend=api();const user=abrir()
  await user.click(await screen.findByRole('button',{name:'Nuevo producto'}))
  await user.upload(screen.getByLabelText('Imagen del producto'),new File([new Uint8Array(5*1024*1024+1)],'grande.png',{type:'image/png'}))
  expect(screen.getByText('Selecciona una imagen JPG, PNG o WEBP de hasta 5 MB.')).toBeInTheDocument()
  expect(screen.getAllByRole('button',{name:'Guardar'})[0]).toBeDisabled()
  expect(backend.altas).toHaveLength(0)
 })

 it('carga stock bajo con los cinco precios, muestra opciones y filtra sin rechazar el contrato', async () => {
  const consultas:string[]=[]
  vi.stubGlobal('fetch',vi.fn(async(url:string)=>{
   const ruta=new URL(url,'http://localhost');consultas.push(ruta.pathname+ruta.search)
   if(ruta.pathname.endsWith('/filtros'))return json(opciones)
   return paginaJson([{idProducto:'7',clave:'STOCK-BAJO',nombre:'Gorra de stock bajo',img:'',categoria:'Gorras',subcategoria:'Clásicas',marca:'FLY',estado:'STOCK_BAJO',variantes:[{talla:'M',color:'Rojo',stock:1}],preciosProducto:['BASE','EMPRENDEDOR','MAYOREO','DISTRIBUIDOR','SOCIO_COMERCIAL'].map((tipoPrecio,i)=>({tipoPrecio,precio:100-i*10,minPiezas:i+1}))}])
  }))
  const user=abrir()
  await screen.findByRole('cell',{name:/Stock bajo/})
  await screen.findByRole('option',{name:'FLY'})
  expect(screen.queryByText('No se pudo cargar el catálogo')).not.toBeInTheDocument()
  await user.selectOptions(screen.getByRole('combobox',{name:'Estado'}),'STOCK_BAJO')
  await user.click(screen.getByRole('button',{name:'Buscar'}))
  await waitFor(()=>expect(consultas).toContain('/api/productos/buscar?estado=STOCK_BAJO&pagina=0&tamano=7'))
  expect(screen.getByRole('cell',{name:/Stock bajo/})).toBeInTheDocument()
 })
})
