/**
 * DTO del comprobante de pedido (ticket) generado por el backend.
 *
 * El backend genera una plantilla HTML con CSS para que el frontend
 * pueda mostrarlo en pantalla y permitir al usuario descargarlo como PDF
 * usando window.print() o librerías como html2pdf.js.
 *
 * Este enfoque evita guardar PDFs en storage y permite regenerar
 * el comprobante cuando sea necesario.
 */
export type ComprobantePedidoDTO = {
  /** Folio del pedido */
  readonly folio: string

  /** Fecha de emisión del comprobante en formato ISO 8601 */
  readonly fechaEmision: string

  /** HTML completo del comprobante */
  readonly html: string

  /** CSS para estilos del comprobante (opcional si ya está en el HTML) */
  readonly css?: string
}
