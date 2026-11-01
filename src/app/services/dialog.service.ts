import { Injectable, signal } from '@angular/core';

export type DialogTom = 'primary' | 'success' | 'warning' | 'danger';

export interface DialogConfig {
  titulo: string;
  mensagem: string;
  confirmarTexto?: string;
  cancelarTexto?: string;
  tom?: DialogTom;
  /** Nome de um ícone registrado em shared/icons.ts */
  icone?: string;
}

export interface DialogAberto extends Required<DialogConfig> {
  id: number;
  tipo: 'confirm' | 'alert';
}

const ICONES: Record<DialogTom, string> = {
  primary: 'heroInformationCircle',
  success: 'heroCheckCircle',
  warning: 'heroExclamationTriangle',
  danger: 'heroExclamationTriangle'
};

/**
 * Diálogos de confirmação e alerta baseados em Promise.
 *
 *   if (await dialog.confirm({ titulo: 'Excluir?', mensagem: '...', tom: 'danger' })) { ... }
 */
@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private sequencia = 0;
  private resolver: ((resultado: boolean) => void) | null = null;
  private focoAnterior: HTMLElement | null = null;

  readonly atual = signal<DialogAberto | null>(null);

  confirm(config: DialogConfig): Promise<boolean> {
    return this.abrir('confirm', { confirmarTexto: 'Confirmar', ...config });
  }

  async alert(config: DialogConfig): Promise<void> {
    await this.abrir('alert', { confirmarTexto: 'Entendi', ...config });
  }

  /** Fecha o diálogo atual com o resultado informado. */
  fechar(resultado: boolean): void {
    if (!this.atual()) return;

    const resolver = this.resolver;
    this.resolver = null;
    this.atual.set(null);
    resolver?.(resultado);

    const foco = this.focoAnterior;
    this.focoAnterior = null;
    if (foco?.isConnected) {
      foco.focus({ preventScroll: true });
    }
  }

  private abrir(tipo: DialogAberto['tipo'], config: DialogConfig): Promise<boolean> {
    // Um diálogo por vez: o anterior é cancelado
    if (this.atual()) {
      this.fechar(false);
    }

    const tom = config.tom ?? 'primary';
    this.focoAnterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
      this.atual.set({
        id: ++this.sequencia,
        tipo,
        titulo: config.titulo,
        mensagem: config.mensagem,
        confirmarTexto: config.confirmarTexto ?? 'Confirmar',
        cancelarTexto: config.cancelarTexto ?? 'Cancelar',
        tom,
        icone: config.icone ?? ICONES[tom]
      });
    });
  }
}
