import { Injectable, signal } from '@angular/core';

/** Opções de exibição do diálogo de confirmação. */
export interface ConfirmOptions {
  /** Título do diálogo. */
  titulo: string;
  /** Mensagem/descrição. Aceita texto simples. */
  mensagem: string;
  /** Rótulo do botão de confirmação. Padrão: "Confirmar". */
  confirmarLabel?: string;
  /** Rótulo do botão de cancelamento. Padrão: "Cancelar". */
  cancelarLabel?: string;
  /** Quando true, o botão de confirmação usa o estilo de perigo (vermelho). */
  perigo?: boolean;
}

/** Estado interno do diálogo enquanto está aberto. */
interface ConfirmState extends Required<Omit<ConfirmOptions, 'confirmarLabel' | 'cancelarLabel'>> {
  confirmarLabel: string;
  cancelarLabel: string;
  resolver: (confirmado: boolean) => void;
}

/**
 * Serviço de diálogo de confirmação reutilizável.
 *
 * Uso típico (em qualquer componente):
 * ```ts
 * private readonly confirm = inject(ConfirmDialogService);
 *
 * async excluir(item) {
 *   const ok = await this.confirm.ask({
 *     titulo: 'Excluir item',
 *     mensagem: `Excluir "${item.nome}"? Esta ação não pode ser desfeita.`,
 *     perigo: true,
 *   });
 *   if (ok) await this.store.remove(item.id);
 * }
 * ```
 *
 * Requer que `<app-confirm-dialog />` esteja montado uma única vez na raiz
 * da aplicação (já incluído em `app.html`).
 */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  /** Estado reativo lido pelo componente de diálogo. `null` = fechado. */
  readonly estado = signal<ConfirmState | null>(null);

  /**
   * Abre o diálogo e resolve com `true` (confirmado) ou `false` (cancelado).
   * Se já houver um diálogo aberto, ele é cancelado antes de abrir o novo.
   */
  ask(opcoes: ConfirmOptions): Promise<boolean> {
    this.estado()?.resolver(false);
    return new Promise<boolean>((resolve) => {
      this.estado.set({
        titulo: opcoes.titulo,
        mensagem: opcoes.mensagem,
        confirmarLabel: opcoes.confirmarLabel ?? 'Confirmar',
        cancelarLabel: opcoes.cancelarLabel ?? 'Cancelar',
        perigo: opcoes.perigo ?? false,
        resolver: resolve,
      });
    });
  }

  /** Confirma o diálogo atual (resolve `true`). */
  confirmar(): void {
    this.fechar(true);
  }

  /** Cancela o diálogo atual (resolve `false`). */
  cancelar(): void {
    this.fechar(false);
  }

  private fechar(confirmado: boolean): void {
    const atual = this.estado();
    if (!atual) return;
    atual.resolver(confirmado);
    this.estado.set(null);
  }
}
