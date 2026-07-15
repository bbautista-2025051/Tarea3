import { Router } from "express";
import { ClientesController } from "../controllers/clientes.controller";

const router = Router();
const controller = new ClientesController();

// GET /clientes -> lista todos los clientes
router.get("/", controller.listar);

// POST /clientes -> crea un nuevo cliente
router.post("/", controller.agregar);

export default router;
