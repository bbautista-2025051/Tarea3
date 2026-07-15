import { Cliente, ClienteRow } from "../interfaces/cliente.interface";

/**
 * Convierte una fila cruda de PostgreSQL (snake_case) al modelo
 * de dominio utilizado en toda la aplicacion (camelCase).
 */
export function mapRowToCliente(row: ClienteRow): Cliente {
  return {
    id: row.id,
    codigoCliente: row.codigo_cliente,
    nombreCliente: row.nombre_cliente,
    direccionCliente: row.direccion_cliente,
    telefono: row.telefono,
    creadoEn: row.creado_en.toISOString(),
  };
}
