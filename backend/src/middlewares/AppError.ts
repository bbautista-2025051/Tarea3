/**
 * Error de aplicacion con codigo HTTP asociado.
 * Permite que el manejador centralizado de errores responda
 * con el status code correcto segun el tipo de fallo.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
    this.name = "ConflictError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}
