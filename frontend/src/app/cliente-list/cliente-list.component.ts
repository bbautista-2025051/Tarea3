import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ClienteService } from "../cliente.service";
import { Cliente } from "../interfaces/cliente.interface";

@Component({
  selector: "app-cliente-list",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./cliente-list.component.html",
  styleUrl: "./cliente-list.component.css",
})
export class ClienteListComponent implements OnInit, OnChanges {
  // Cualquier cambio en este valor (por ejemplo al crear un cliente)
  // dispara una recarga automatica del listado.
  @Input() public recargar = 0;

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor(private readonly clienteService: ClienteService) {}

  public ngOnInit(): void {
    this.cargarClientes();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["recargar"] && !changes["recargar"].firstChange) {
      this.cargarClientes();
    }
  }

  protected cargarClientes(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.clienteService.obtenerClientes().subscribe({
      next: (clientes) => {
        this.clientes.set(clientes);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set("No fue posible cargar el listado de clientes.");
        this.cargando.set(false);
      },
    });
  }
}
