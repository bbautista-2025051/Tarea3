import { ClientesRepository } from "../persistence/clientes.repository";
import { Cliente, NuevoCliente } from "../interfaces/cliente.interface";
import { ConflictError, ValidationError } from "../middlewares/AppError";

// Acepta numeros, espacios, guiones, parentesis y un "+" opcional al inicio.
// Exige al menos 7 digitos en total para considerarse un telefono valido.
const REGEX_TELEFONO = /^\+?[0-9\s()-]{7,20}$/;

/**
 * Capa de logica de negocio (modulo) para clientes.
 * Aqui viven las reglas de validacion y orquestacion,
 * separadas del acceso a datos (persistence) y de HTTP (controllers).
 */
export class ClientesService {
  private readonly repositorio: ClientesRepository;

  constructor() {
    this.repositorio = new ClientesRepository();
  }

  public async listarClientes(): Promise<Cliente[]> {
    return this.repositorio.obtenerTodos();
  }

  public async agregarCliente(datos: NuevoCliente): Promise<Cliente> {
    this.validarDatos(datos);

    const existente = await this.repositorio.buscarPorCodigo(
      datos.codigoCliente.trim()
    );
    if (existente) {
      throw new ConflictError(
        `Ya existe un cliente registrado con el codigo "${datos.codigoCliente}".`
      );
    }

    const clienteNormalizado: NuevoCliente = {
      codigoCliente: datos.codigoCliente.trim(),
      nombreCliente: datos.nombreCliente.trim(),
      direccionCliente: datos.direccionCliente.trim(),
      telefono: datos.telefono.trim(),
    };

    return this.repositorio.crear(clienteNormalizado);
  }

  private validarDatos(datos: NuevoCliente): void {
    const campos: Array<{ valor: string | undefined; etiqueta: string }> = [
      { valor: datos.codigoCliente, etiqueta: "codigoCliente" },
      { valor: datos.nombreCliente, etiqueta: "nombreCliente" },
      { valor: datos.direccionCliente, etiqueta: "direccionCliente" },
      { valor: datos.telefono, etiqueta: "telefono" },
    ];

    for (const campo of campos) {
      if (!campo.valor || campo.valor.trim().length === 0) {
        throw new ValidationError(`El campo "${campo.etiqueta}" es obligatorio.`);
      }
    }

    if (datos.codigoCliente.trim().length > 50) {
      throw new ValidationError(
        'El campo "codigoCliente" no puede superar los 50 caracteres.'
      );
    }

    if (datos.nombreCliente.trim().length > 150) {
      throw new ValidationError(
        'El campo "nombreCliente" no puede superar los 150 caracteres.'
      );
    }

    if (!REGEX_TELEFONO.test(datos.telefono.trim())) {
      throw new ValidationError(
        'El campo "telefono" no tiene un formato valido.'
      );
    }
  }
}
