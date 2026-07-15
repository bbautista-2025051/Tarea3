import { NextFunction, Request, Response } from "express";
import { AppError } from "./AppError";

/**
 * Middleware centralizado de manejo de errores.
 * Debe registrarse SIEMPRE al final de la cadena de middlewares/rutas.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      ok: false,
      error: err.message,
    });
    return;
  }

  console.error("Error no controlado:", err);
  res.status(500).json({
    ok: false,
    error: "Ocurrio un error interno en el servidor.",
  });
}

/**
 * Middleware para capturar rutas no existentes (404).
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    ok: false,
    error: `La ruta ${req.method} ${req.originalUrl} no existe.`,
  });
}
