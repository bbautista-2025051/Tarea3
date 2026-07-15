import fs from "fs/promises";
import path from "path";
import Database from "../database/Database";
import { mapRowToCliente } from "../models/cliente.model";
import { Cliente, ClienteRow, NuevoCliente } from "../interfaces/cliente.interface";

const RUTA_RESPALDO_JSON = path.join(__dirname, "..", "data", "clientes.json");

/**
 * Capa de persistencia: unico lugar de la aplicacion que conoce
 * las sentencias SQL y el detalle de como se guardan los datos.
 */
export class ClientesRepository {
  private readonly db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  public async obtenerTodos(): Promise<Cliente[]> {
    const resultado = await this.db.query<ClienteRow>(
      `SELECT id, codigo_cliente, nombre_cliente, direccion_cliente, telefono, creado_en
       FROM clientes
       ORDER BY id ASC`
    );
    return resultado.rows.map(mapRowToCliente);
  }

  public async buscarPorCodigo(codigoCliente: string): Promise<Cliente | null> {
    const resultado = await this.db.query<ClienteRow>(
      `SELECT id, codigo_cliente, nombre_cliente, direccion_cliente, telefono, creado_en
       FROM clientes
       WHERE codigo_cliente = $1`,
      [codigoCliente]
    );

    if (resultado.rows.length === 0) {
      return null;
    }
    return mapRowToCliente(resultado.rows[0]);
  }

  public async crear(nuevoCliente: NuevoCliente): Promise<Cliente> {
    const resultado = await this.db.query<ClienteRow>(
      `INSERT INTO clientes (codigo_cliente, nombre_cliente, direccion_cliente, telefono)
       VALUES ($1, $2, $3, $4)
       RETURNING id, codigo_cliente, nombre_cliente, direccion_cliente, telefono, creado_en`,
      [
        nuevoCliente.codigoCliente,
        nuevoCliente.nombreCliente,
        nuevoCliente.direccionCliente,
        nuevoCliente.telefono,
      ]
    );

    const cliente = mapRowToCliente(resultado.rows[0]);

    // Mantener sincronizado el respaldo en backend/data/clientes.json
    await this.sincronizarRespaldoJson();

    return cliente;
  }

  /**
   * Vuelca el contenido completo de la tabla clientes al archivo
   * backend/data/clientes.json, usado unicamente como respaldo.
   */
  private async sincronizarRespaldoJson(): Promise<void> {
    try {
      const clientes = await this.obtenerTodos();
      await fs.mkdir(path.dirname(RUTA_RESPALDO_JSON), { recursive: true });
      await fs.writeFile(
        RUTA_RESPALDO_JSON,
        JSON.stringify(clientes, null, 2),
        "utf-8"
      );
    } catch (error) {
      // El respaldo es secundario: si falla, no debe romper la creacion del cliente,
      // pero se deja registro del problema.
      console.error("No se pudo sincronizar el respaldo clientes.json:", error);
    }
  }
}
