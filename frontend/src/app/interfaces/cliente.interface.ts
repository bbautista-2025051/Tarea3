export interface Cliente {
  id: number;
  codigoCliente: string;
  nombreCliente: string;
  direccionCliente: string;
  telefono: string;
  creadoEn: string;
}

export interface NuevoCliente {
  codigoCliente: string;
  nombreCliente: string;
  direccionCliente: string;
  telefono: string;
}

export interface ApiRespuesta<T> {
  ok: boolean;
  data: T;
}
