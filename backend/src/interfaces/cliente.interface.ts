/**
 * Representa un cliente tal como se expone en la API (camelCase).
 */
export interface Cliente {
  id: number;
  codigoCliente: string;
  nombreCliente: string;
  direccionCliente: string;
  telefono: string;
  creadoEn: string;
}

/**
 * Datos necesarios para crear un cliente nuevo.
 * El id y la fecha de creacion los asigna la base de datos.
 */
export interface NuevoCliente {
  codigoCliente: string;
  nombreCliente: string;
  direccionCliente: string;
  telefono: string;
}

/**
 * Representacion cruda de una fila de la tabla clientes (snake_case),
 * tal como la devuelve directamente el driver "pg".
 */
export interface ClienteRow {
  id: number;
  codigo_cliente: string;
  nombre_cliente: string;
  direccion_cliente: string;
  telefono: string;
  creado_en: Date;
}
