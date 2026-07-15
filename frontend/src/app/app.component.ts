import { Component, signal } from "@angular/core";
import { ClienteFormComponent } from "./cliente-form/cliente-form.component";
import { ClienteListComponent } from "./cliente-list/cliente-list.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [ClienteFormComponent, ClienteListComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  // Se incrementa cada vez que se crea un cliente para forzar
  // al componente de listado a refrescar sus datos automaticamente.
  protected readonly recargarListado = signal(0);

  protected onClienteCreado(): void {
    this.recargarListado.update((valor) => valor + 1);
  }
}
