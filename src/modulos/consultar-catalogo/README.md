# CU-01 Consultar catálogo

Tienda pública: líneas, marcas, catálogo con filtros, búsqueda y ficha del producto. Desde la ficha se liga con el
CU-02 Gestionar venta: «Agregar al carrito» crea el pedido `PENDIENTE` si el cliente aún no tiene carrito.

## Rutas

| Ruta | Pantalla (Figma) | Endpoint |
|---|---|---|
| `/categoria/:linea` | B2 · Marcas de la línea (al elegir CAPS, ESSENCE, CLOTHES o SHOES) | `GET /api/catalogo/{linea}` |
| `/categoria/:linea/productos?marca=…` | B3 · Catálogo con filtros, orden y «Ver más» (S3) | `GET /api/catalogo/{linea}` |
| `/buscar?texto=…&linea=…` | S1 · Búsqueda en toda la tienda (A1, A2, A3) | `GET /api/catalogo/buscar` |
| `/producto/:id?color=…` | S2 · Ficha con variantes y precios por esquema (A5) | `GET /api/catalogo/productos/{id}` |

`/catalogo` y `/productos` redirigen a `/categoria/caps`. Las rutas son públicas: con sesión el backend responde el
precio de referencia del tipo de cliente; sin sesión, el precio Base.

## Flujo

Vista → hook → modelo (`CatalogoEnCursoModel` / `DetalleProductoModel`) → `ICatalogoGateway` → `CatalogoHttpGateway` → API.

- **Criterios en la URL.** Búsqueda, filtros y orden viven en los parámetros (`marca=1,2&color=3&orden=PRECIO_ASC`):
  recargar, compartir el enlace o «Regresar al catálogo» los conserva. Los nombres son los mismos que lee el backend.
- **Caché de la consulta.** Al regresar de la ficha con los mismos criterios no se vuelve a pedir el catálogo y la
  página vuelve a la tarjeta que se abrió (`useDesplazamientoTienda`).
- **Tarjeta con colores (como adidas).** Abajo de la foto van los colores con existencia; al pasar el mouse (o con el
  teclado) la foto cambia a ese color; en el celular se toca. El color elegido se lleva a la ficha (`?color=`).
- **Precio.** La tarjeta muestra el precio de referencia del tipo de cliente. En la ficha el esquema cambia con las
  piezas elegidas; el carrito lo recalcula con el total de piezas del pedido.
- **Cambio de sesión.** `app/contenedor.ts` invalida el catálogo y refresca la ficha al entrar, salir o cambiar de
  cuenta, porque cambia el precio de referencia.

## Agregar al carrito (CU-01 → CU-02)

`DetalleProductoModel.agregarAlCarrito` usa el puerto `ICarritoCatalogo`; el contenedor lo implementa con
`PedidoEnCursoModel.agregarAlCarrito` del CU-02 (`POST /api/ventas/pedido-en-curso/detalles`), así `/carrito` ya
trae la línea agregada.

| Quién | Qué pasa |
|---|---|
| Cliente | Se agrega la variante (color + talla) y las piezas; aviso «Agregado al carrito» con «Ver carrito». |
| Sin sesión | Se guarda lo elegido (`AgregadoPendienteStorage`, 24 h) y se pide iniciar sesión o crear cuenta. Al volver a `/producto/:id?agregar=1` con sesión se agrega solo. Si la cuenta es nueva, la ruta de regreso se guarda al registrarse (`rutaPendiente`) y la confirmación del correo ofrece «Continuar con tu compra». |
| Sesión vencida (401) | Igual que sin sesión: se conserva lo elegido y se vuelve a pedir sesión. |
| Personal (admin/empleado, 403) | No compra en la tienda; se explica en la ficha. |

Lo pendiente se guarda en `localStorage` (y no en `sessionStorage`) porque el enlace del correo de confirmación
suele abrir otra pestaña. Son solo ids y cantidad, nunca un token; por eso esos dos archivos llevan la excepción de
la regla `no-restricted-globals`.

## Pruebas

`npx vitest run src/modulos/consultar-catalogo` · reglas (`dominio/ReglasCatalogo.test.ts`), modelos y mapper
(`aplicacion/catalogo.test.ts`) y vistas con el gateway falso (`presentacion/catalogoVistas.test.tsx`).
