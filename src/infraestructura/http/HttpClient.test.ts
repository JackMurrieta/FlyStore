import { afterEach, describe, expect, it, vi } from 'vitest'
import { HttpClient } from './HttpClient'
const json=(body:unknown,status:number)=>new Response(JSON.stringify(body),{status})
afterEach(()=>vi.unstubAllGlobals())
describe('Recuperación de sesión HTTP',()=>{
 it('comparte un refresco fallido entre peticiones concurrentes',async()=>{
  const client=new HttpClient();const expirar=vi.fn();client.configurarCallbackExpiracion(expirar)
  let completar!:(r:Response)=>void
  const fetch=vi.fn((url:string)=>url.includes('/api/auth/refresh')?new Promise<Response>(r=>{completar=r}):Promise.resolve(json({},401)))
  vi.stubGlobal('fetch',fetch)
  const resultado=Promise.allSettled([client.get('/api/productos'),client.get('/api/catalogo/filtros')])
  await vi.waitFor(()=>expect(completar).toBeTypeOf('function'))
  completar(json({},401))
  expect((await resultado).every(r=>r.status==='rejected')).toBe(true)
  expect(fetch.mock.calls.filter(([url])=>url.includes('/refresh'))).toHaveLength(1)
  expect(expirar).toHaveBeenCalled()
 })
 it('reintenta solo una vez si la petición continúa devolviendo 401',async()=>{
  const client=new HttpClient()
  const fetch=vi.fn(async(url:string)=>url.includes('/refresh')?new Response(null,{status:204}):json({},401));vi.stubGlobal('fetch',fetch)
  await expect(client.get('/api/productos')).rejects.toMatchObject({statusHTTP:401})
  expect(fetch).toHaveBeenCalledTimes(3)
 })
 it('preserva el detalle de validación del contrato Spring',async()=>{
  vi.stubGlobal('fetch',vi.fn(async()=>json({error:'DATOS_INVALIDOS',message:'Selecciona un color existente'},400)))
  await expect(new HttpClient().get('/api/productos')).rejects.toMatchObject({message:'Selecciona un color existente',codigo:'DATOS_INVALIDOS',statusHTTP:400})
 })
})
