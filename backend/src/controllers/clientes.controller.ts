import { NextFunction, Request, Response } from "express";
import { ClientesService } from "../modules/clientes.service";
import { NuevoCliente } from "../interfaces/cliente.interface";

/**
 * Capa de controladores: traduce HTTP <-> logica de negocio.
 * No contiene reglas de negocio ni SQL, solo orquesta la peticion
 * y delega en el servicio correspondiente.
 */
export class ClientesController {
  private readonly servicio: ClientesService;

  constructor() {
    this.servicio = new ClientesService();
  }

  public listar = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const clientes = await this.servicio.listarClientes();
      res.status(200).json({ ok: true, data: clientes });
    } catch (error) {
      next(error);
    }
  };

  public agregar = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const datos = req.body as NuevoCliente;
      const clienteCreado = await this.servicio.agregarCliente(datos);
      res.status(201).json({ ok: true, data: clienteCreado });
    } catch (error) {
      next(error);
    }
  };
}
