import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import Database from "./database/Database";
import clientesRoutes from "./routes/clientes.routes";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

const app: Application = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ ok: true, mensaje: "API de administracion de clientes activa." });
});

app.use("/clientes", clientesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function iniciarServidor(): Promise<void> {
  try {
    const database = Database.getInstance();
    await database.testConnection();
    console.log("Conexion a PostgreSQL establecida correctamente.");

    app.listen(PORT, () => {
      console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No fue posible iniciar el servidor:", error);
    process.exit(1);
  }
}

iniciarServidor();
