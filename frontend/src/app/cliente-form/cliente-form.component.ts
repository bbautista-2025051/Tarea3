import { Component, EventEmitter, Output, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ClienteService } from "../cliente.service";

@Component({
  selector: "app-cliente-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./cliente-form.component.html",
  styleUrl: "./cliente-form.component.css",
})
export class ClienteFormComponent {
  // Se emite cada vez que un cliente se guarda correctamente,
  // para que el componente padre pueda refrescar el listado.
  @Output() public clienteCreado = new EventEmitter<void>();

  // Se usa inject() (en vez de inyeccion por constructor) para que estas
  // dependencias esten disponibles antes de que se inicialice el campo
  // "formulario", que las necesita de inmediato.
  private readonly fb = inject(FormBuilder);
  private readonly clienteService = inject(ClienteService);

  protected readonly enviando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);

  protected readonly formulario = this.fb.group({
    codigoCliente: ["", [Validators.required, Validators.maxLength(50)]],
    nombreCliente: ["", [Validators.required, Validators.maxLength(150)]],
    direccionCliente: ["", [Validators.required, Validators.maxLength(255)]],
    telefono: [
      "",
      [Validators.required, Validators.pattern(/^\+?[0-9\s()-]{7,20}$/)],
    ],
  });

  protected campoInvalido(nombre: keyof typeof this.formulario.controls): boolean {
    const control = this.formulario.controls[nombre];
    return control.invalid && (control.dirty || control.touched);
  }

  protected onEnviar(): void {
    this.errorServidor.set(null);
    this.mensajeExito.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);

    const valores = this.formulario.getRawValue();

    this.clienteService
      .agregarCliente({
        codigoCliente: valores.codigoCliente ?? "",
        nombreCliente: valores.nombreCliente ?? "",
        direccionCliente: valores.direccionCliente ?? "",
        telefono: valores.telefono ?? "",
      })
      .subscribe({
        next: (cliente) => {
          this.enviando.set(false);
          this.mensajeExito.set(
            `Cliente "${cliente.nombreCliente}" guardado correctamente.`
          );
          this.formulario.reset();
          this.clienteCreado.emit();
        },
        error: (error) => {
          this.enviando.set(false);
          this.errorServidor.set(
            error?.error?.error ?? "No fue posible guardar el cliente."
          );
        },
      });
  }
}
