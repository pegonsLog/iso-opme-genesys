import { Component, HostListener, inject } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';

/**
 * Host visual do diálogo de confirmação. Deve ser montado uma única vez na
 * raiz da aplicação. Renderiza apenas quando há um diálogo aberto no
 * `ConfirmDialogService`.
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  private readonly service = inject(ConfirmDialogService);

  protected readonly estado = this.service.estado;

  protected confirmar(): void {
    this.service.confirmar();
  }

  protected cancelar(): void {
    this.service.cancelar();
  }

  /** Permite cancelar com a tecla Esc. */
  @HostListener('document:keydown.escape')
  protected aoEscape(): void {
    if (this.estado()) this.service.cancelar();
  }
}
