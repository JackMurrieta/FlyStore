import { Hono } from 'hono'
//monta rutas * queues 

const app = new Hono()
app.get('/', (c) => c.text('FlyStore backend OK'))

export default app