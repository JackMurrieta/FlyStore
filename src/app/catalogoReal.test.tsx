import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { SesionProvider } from '@compartido/sesion'
import type { EstadoSesionTs, ISesion } from '@compartido/sesion/ISesion'
import { Rutas } from './rutas'
vi.mock('./contenedor', async()=>{
 const {crearContenedorCatalogo}=await import('./pruebas/contenedorCatalogoPrueba')
 return {contenedor:crearContenedorCatalogo()}
})
vi.mock('@modulos/iniciar-sesion',()=>({IniciarSesionVista:()=> <p>Inicio de sesión requerido</p>}))
vi.mock('./vistas/InicioVista',()=>({default:()=> <p>Inicio público</p>}))
const opciones={categorias:[{id:'9223372036854775807',nombre:'Gorras'}],subcategorias:[{id:'2',nombre:'Clásicas'}],marcas:[{id:'3',nombre:'FLY'}],colores:['Rojo','Negro']}
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status})
const paginaJson=(productos:unknown[])=>json({productos,pagina:0,tamano:7,hayMas:false})
const blobTexto=(blob:Blob)=>new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsText(blob)})
const png=(nombre='gorra.png',bytes=8)=>new File([new Uint8Array(bytes).fill(137)],nombre,{type:'image/png'})
const guardadoDTO={idProducto:'42',clave:'NUEVA',nombre:'Gorra nueva',img:'https://example.com/gorra.png',categoria:'Gorras',subcategoria:'Clásicas',marca:'FLY',estado:'BORRADOR',variantes:[{talla:'M',color:'Rojo',stock:7}],preciosProducto:[{tipoPrecio:'BASE',precio:100,minPiezas:1}]}
const edicionDTO={idProducto:'42',clave:'NUEVA',nombre:'Gorra nueva',descripcion:'Gorra bordada',idCategoria:'9223372036854775807',categoria:'Gorras',
 idSubcategoria:'2',subcategoria:'Clásicas',idMarca:'3',marca:'FLY',estado:'BORRADOR',
 variantes:[{idVariante:'40',sku:'NUEVA-ROJ-M',idTalla:'5',talla:'M',idColor:'1',color:'Rojo',hex:'#c00',stock:7,conPedidos:true}],
 preciosProducto:[{tipoPrecio:'BASE',precio:100,minPiezas:1}],
 imagenes:[{idImagen:'55',url:'https://example.com/gorra.png',idColor:'1',color:'Rojo',orden:0}]}
function api(status=201, colores=opciones.colores){
 let terminar=()=>{}
 const pasos:string[]=[];const altas:Record<string,unknown>[]=[];const archivos:File[][]=[];const cambios:Record<string,unknown>[]=[];let guardado=false
 vi.stubGlobal('fetch',vi.fn(async(url:string,init:RequestInit)=>{
  const u=new URL(url,'http://localhost');pasos.push(`${init.method} ${u.pathname}${u.search}`)
  expect(init.credentials).toBe('include')
  if(init.method==='POST'){
   expect(init.body).toBeInstanceOf(FormData);expect(new Headers(init.headers).has('Content-Type')).toBe(false)
   const form=init.body as FormData;const dto=JSON.parse(await blobTexto(form.get('producto') as Blob));altas.push(dto)
   expect(form.get('imagen')).toBeNull();archivos.push(form.getAll('imagenes') as File[])
   if(status===0)return new Promise<Response>(resolve=>{terminar=()=>{guardado=true;resolve(new Response(null,{status:201}))}})
   if(status!==201)return json({error:'DATOS_INVALIDOS',message:'Selecciona un color existente'},status)
   guardado=true;return new Response(null,{status:201})
  }
  if(init.method==='PUT'){
   expect(typeof init.body).toBe('string');cambios.push(JSON.parse(String(init.body)))
   return json({...edicionDTO,variantes:[{...edicionDTO.variantes[0],stock:12}]})
  }
  if(u.pathname==='/api/productos/42')return json(edicionDTO)
  if(u.pathname.endsWith('/filtros'))return json({...opciones,colores})
  if(u.pathname.endsWith('/tallas'))return json([{idTalla:'5',nombre:'M'}])
  return paginaJson(guardado?[guardadoDTO]:[])
 }))
 return {pasos,altas,archivos,cambios,terminar:()=>terminar(),guardar:()=>{guardado=true}}
}
function abrir(rol:'ADMIN'|'EMPLEADO'|'CLIENTE'|null='ADMIN'){
 const estado:EstadoSesionTs=rol?{estado:'autenticado',usuario:{id:1,nombre:'Admin',correo:'a@example.com',telefono:null,rol,perfilCompleto:true,iniciales:'AP'}}:{estado:'anonimo',usuario:null}
 const sesion:ISesion={obtenerEstado:()=>estado,suscribir:()=>()=>{},iniciarConGoogle:vi.fn(),cerrarSesion:vi.fn()}
 render(<MemoryRouter initialEntries={['/admin/catalogo']}><SesionProvider sesion={sesion}><Rutas/></SesionProvider></MemoryRouter>)
 return userEvent.setup()
}
/** Llena el alta como lo haría la persona: línea, datos, un color con su talla, existencia y foto, y precio base. */
async function formulario(user:ReturnType<typeof userEvent.setup>){
 await user.click(await screen.findByRole('button',{name:'Nuevo producto'}))
 await user.click(await screen.findByRole('button',{name:'Gorras'}))
 await user.selectOptions(screen.getByRole('combobox',{name:/^Marca/}),'3')
 await user.selectOptions(screen.getByRole('combobox',{name:/^Tipo de producto/}),'2')
 await user.type(screen.getByLabelText('Nombre / modelo *'),'Gorra nueva')
 await user.type(screen.getByLabelText('Clave / SKU *'),'NUEVA')
 await user.type(screen.getByLabelText('Descripción *'),'Gorra bordada')
 await user.click(screen.getByRole('button',{name:'Agregar color'}))
 expect(screen.getByRole('option',{name:'Negro'})).toBeInTheDocument()
 await user.selectOptions(screen.getByRole('combobox',{name:'Color predominante *'}),'Rojo')
 await waitFor(()=>expect(screen.getByRole('combobox',{name:'Talla 1 de Rojo'})).toHaveValue('M'))
 await user.clear(screen.getByLabelText('Existencia de Rojo M'));await user.type(screen.getByLabelText('Existencia de Rojo M'),'7')
 await user.upload(screen.getByLabelText('Agregar fotos de Rojo'),png())
 await user.type(screen.getByLabelText('Base * · MXN'),'100')
}
beforeEach(()=>{Object.defineProperty(URL,'createObjectURL',{value:vi.fn(()=> 'blob:preview'),writable:true,configurable:true});Object.defineProperty(URL,'revokeObjectURL',{value:vi.fn(),writable:true,configurable:true})})
afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks()})
describe('Catálogo real dentro del panel',()=>{
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
 it('envía una sola alta multipart con cada foto ligada a su color y vuelve al catálogo tras 201',async()=>{
  const backend=api();const user=abrir();await formulario(user)
  await user.click(screen.getAllByRole('button',{name:'Guardar'})[0]!)
  await screen.findByRole('heading',{name:'Catálogo'})
  expect(await screen.findByRole('cell',{name:/Gorra nueva/})).toBeInTheDocument()
  expect(screen.getByText('El producto se guardó como borrador correctamente.')).toBeInTheDocument()
  expect(backend.altas).toHaveLength(1)
  expect(backend.altas[0]).toMatchObject({idCategoria:'9223372036854775807',variantes:[{talla:'M',color:'Rojo',stock:7}],
   imagenes:[{archivo:0,color:'Rojo'}],preciosProducto:[{tipoPrecio:'BASE',precio:100,minPiezas:1}]})
  expect(backend.archivos[0]!.map(a=>a.name)).toEqual(['gorra.png'])
  await waitFor(()=>expect(backend.pasos.filter(p=>p==='GET /api/productos?pagina=0&tamano=7')).toHaveLength(2))
 })
 it('400: conserva el formulario y muestra el motivo',async()=>{
  const backend=api(400);const user=abrir();await formulario(user)
  await user.click(screen.getAllByRole('button',{name:'Guardar'})[0]!)
  await screen.findByText(/Selecciona un color existente/)
  expect(screen.getByLabelText('Clave / SKU *')).toBeEnabled();expect(backend.altas).toHaveLength(1)
 })
 it('409: marca la clave para corregirla sin perder lo capturado',async()=>{
  const backend=api(409);const user=abrir();await formulario(user)
  await user.click(screen.getAllByRole('button',{name:'Guardar'})[0]!)
  await waitFor(()=>expect(screen.getByLabelText('Clave / SKU *')).toHaveAttribute('aria-invalid','true'))
  expect(screen.getByRole('link',{name:'Clave / SKU'})).toHaveAttribute('href','#producto-datos')
  expect(screen.getByLabelText('Nombre / modelo *')).toHaveValue('Gorra nueva');expect(backend.altas).toHaveLength(1)
 })
 it('bloquea envíos duplicados mientras espera la confirmación',async()=>{
  const backend=api(0);const user=abrir();await formulario(user)
  await user.click(screen.getAllByRole('button',{name:'Guardar'})[0]!)
  await waitFor(()=>expect(backend.altas).toHaveLength(1))
  expect(screen.getAllByRole('button',{name:/Guardar/})[0]).toBeDisabled()
  backend.terminar();await screen.findByRole('cell',{name:/Gorra nueva/});expect(backend.altas).toHaveLength(1)
 })
 it('sin colores en el catálogo no deja elegir color',async()=>{
  api(201,[]);const user=abrir()
  await user.click(await screen.findByRole('button',{name:'Nuevo producto'}))
  await user.click(await screen.findByRole('button',{name:'Agregar color'}))
  expect(screen.getByRole('option',{name:'Sin colores disponibles'})).toBeInTheDocument()
  expect(screen.getByRole('combobox',{name:'Color predominante *'})).toBeDisabled()
 })
 it('rechaza fotos mayores al límite y no envía un alta sin fotos',async()=>{
  const backend=api();const user=abrir()
  await user.click(await screen.findByRole('button',{name:'Nuevo producto'}))
  await user.click(await screen.findByRole('button',{name:'Agregar color'}))
  await user.upload(screen.getByLabelText('Agregar fotos de color 1'),png('grande.png',5*1024*1024+1))
  expect(screen.getAllByText(/«grande.png» pesa más de 5 MB/).length).toBeGreaterThan(0)
  await user.click(screen.getAllByRole('button',{name:'Guardar'})[0]!)
  expect(await screen.findByText(/datos por revisar/)).toBeInTheDocument()
  expect(backend.altas).toHaveLength(0)
 })
 it('edita desde la fila: carga el producto, guarda por PUT en JSON y vuelve a la misma búsqueda',async()=>{
  const backend=api();backend.guardar();const user=abrir()
  await user.click(await screen.findByRole('button',{name:'Editar Gorra nueva'}))
  expect(await screen.findByRole('heading',{name:'Editar producto'})).toBeInTheDocument()
  expect(screen.getByText('La línea no se cambia al editar.')).toBeInTheDocument()
  expect(screen.getByRole('img',{name:'Principal: foto 1 de Rojo'})).toHaveAttribute('src','https://example.com/gorra.png')
  await user.clear(screen.getByLabelText('Existencia de Rojo M'));await user.type(screen.getByLabelText('Existencia de Rojo M'),'12')
  await user.click(screen.getAllByRole('button',{name:'Guardar cambios'})[0]!)
  await screen.findByText(/Se guardaron los cambios de «Gorra nueva»/)
  expect(backend.cambios).toEqual([{clave:'NUEVA',nombre:'Gorra nueva',descripcion:'Gorra bordada',idSubcategoria:'2',idMarca:'3',estado:'BORRADOR',
   variantes:[{idVariante:'40',stock:12}],imagenes:[{idImagen:'55',color:'Rojo'}],preciosProducto:[{tipoPrecio:'BASE',precio:100,minPiezas:1}]}])
  expect(backend.pasos).toContain('GET /api/productos/42')
 })
 it('cancelar con cambios pide confirmar antes de descartarlos',async()=>{
  const backend=api();backend.guardar();const user=abrir()
  await user.click(await screen.findByRole('button',{name:'Editar Gorra nueva'}))
  await user.type(await screen.findByLabelText('Nombre / modelo *'),' 2')
  await user.click(screen.getAllByRole('button',{name:'Cancelar'})[0]!)
  expect(await screen.findByRole('dialog',{name:'¿Descartar cambios?'})).toBeInTheDocument()
  await user.click(screen.getByRole('button',{name:'Seguir editando'}))
  expect(screen.getByLabelText('Nombre / modelo *')).toHaveValue('Gorra nueva 2')
  await user.click(screen.getAllByRole('button',{name:'Cancelar'})[0]!)
  await user.click(await screen.findByRole('button',{name:'Descartar cambios'}))
  expect(await screen.findByRole('heading',{name:'Catálogo'})).toBeInTheDocument()
  expect(backend.cambios).toHaveLength(0)
 })
 it('abre filtrado desde el Inicio del panel (?estado=BORRADOR)',async()=>{
  const consultas:string[]=[]
  vi.stubGlobal('fetch',vi.fn(async(url:string)=>{
   const ruta=new URL(url,'http://localhost');consultas.push(ruta.pathname+ruta.search)
   if(ruta.pathname.endsWith('/filtros'))return json(opciones)
   return paginaJson([])
  }))
  const estado:EstadoSesionTs={estado:'autenticado',usuario:{id:1,nombre:'Admin',correo:'a@example.com',telefono:null,rol:'ADMIN',perfilCompleto:true,iniciales:'AP'}}
  render(<MemoryRouter initialEntries={['/admin/catalogo?estado=BORRADOR']}><SesionProvider sesion={{obtenerEstado:()=>estado,suscribir:()=>()=>{},iniciarConGoogle:vi.fn(),cerrarSesion:vi.fn()}}><Rutas/></SesionProvider></MemoryRouter>)
  await waitFor(()=>expect(consultas[0]).toBe('/api/productos/buscar?estado=BORRADOR&pagina=0&tamano=7'))
  expect(await screen.findByRole('combobox',{name:'Estado'})).toHaveValue('BORRADOR')
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
