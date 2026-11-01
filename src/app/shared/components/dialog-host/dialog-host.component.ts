import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  afterRenderEffect,
  effect,
  inject,
  viewChild
} from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { DialogService } from '../../../services/dialog.service';

/**
 * Renderiza os diálogos abertos pelo DialogService (um por vez).
 * Acessível: role="alertdialog", foco inicial, Tab preso no diálogo e Esc para cancelar.
 */
@Component({
  selector: 'app-dialog-host',
  imports: [NgIcon],
  templateUrl: './dialog-host.component.html',
  styleUrl: './dialog-host.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'aoPressionarEsc()'
  }
})
export class DialogHostComponent {
  protected readonly dialogService = inject(DialogService);
  private readonly document = inject(DOCUMENT);

  private readonly painel = viewChild<ElementRef<HTMLElement>>('painel');
  private readonly botaoCancelar = viewChild<ElementRef<HTMLButtonElement>>('botaoCancelar');
  private readonly botaoConfirmar = viewChild<ElementRef<HTMLButtonElement>>('botaoConfirmar');

  constructor() {
    // Bloqueia a rolagem da página enquanto há um diálogo aberto
    effect(() => {
      this.document.body.classList.toggle('has-dialog', this.dialogService.atual() !== null);
    });

    // Foco inicial: "Cancelar" em ações destrutivas, botão principal nos demais casos
    afterRenderEffect(() => {
      const dialog = this.dialogService.atual();
      if (!dialog) return;

      const alvo = dialog.tipo === 'confirm' && dialog.tom === 'danger' ? this.botaoCancelar() : this.botaoConfirmar();
      alvo?.nativeElement.focus({ preventScroll: true });
    });
  }

  protected confirmar(): void {
    this.dialogService.fechar(true);
  }

  protected cancelar(): void {
    // Alertas não têm "cancelar": fechar equivale a confirmar a leitura
    this.dialogService.fechar(this.dialogService.atual()?.tipo === 'alert');
  }

  protected aoPressionarEsc(): void {
    if (this.dialogService.atual()) {
      this.cancelar();
    }
  }

  /** Mantém o foco do teclado dentro do diálogo. */
  protected prenderFoco(evento: KeyboardEvent): void {
    if (evento.key !== 'Tab') return;

    const focaveis = Array.from(
      this.painel()?.nativeElement.querySelectorAll<HTMLElement>('button:not([disabled])') ?? []
    );
    if (focaveis.length === 0) return;

    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    const ativo = this.document.activeElement;

    if (evento.shiftKey && ativo === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && ativo === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  }
}
