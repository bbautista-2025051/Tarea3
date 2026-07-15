import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

/**
 * Clase encargada de administrar la conexion a PostgreSQL.
 * Es el UNICO punto de la aplicacion que crea y expone el Pool.
 * Implementada como singleton para reutilizar siempre la misma
 * instancia del pool de conexiones.
 */
class Database {
  private static instance: Database;
  private readonly pool: Pool;

  private constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    this.pool.on("error", (err) => {
      // Errores inesperados en clientes inactivos del pool.
      // Se registran para no derribar el proceso silenciosamente.
      console.error("Error inesperado en el pool de PostgreSQL:", err);
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * Ejecuta una consulta usando una conexion del pool.
   */
  public async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  /**
   * Obtiene un cliente dedicado del pool, util para transacciones.
   * Quien lo solicita es responsable de llamar a client.release().
   */
  public async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  /**
   * Verifica que la conexion a la base de datos funcione correctamente.
   */
  public async testConnection(): Promise<void> {
    await this.pool.query("SELECT 1");
  }

  /**
   * Cierra el pool de conexiones (util para pruebas o apagado ordenado).
   */
  public async close(): Promise<void> {
    await this.pool.end();
  }
}

export default Database;
