import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../environments/environment";
import { ApiRespuesta, Cliente, NuevoCliente } from "./interfaces/cliente.interface";

@Injectable({
  providedIn: "root",
})
export class ClienteService {
  private readonly baseUrl = `${environment.apiUrl}/clientes`;

  constructor(private readonly http: HttpClient) {}

  public obtenerClientes(): Observable<Cliente[]> {
    return this.http
      .get<ApiRespuesta<Cliente[]>>(this.baseUrl)
      .pipe(map((respuesta) => respuesta.data));
  }

  public agregarCliente(cliente: NuevoCliente): Observable<Cliente> {
    return this.http
      .post<ApiRespuesta<Cliente>>(this.baseUrl, cliente)
      .pipe(map((respuesta) => respuesta.data));
  }
}
