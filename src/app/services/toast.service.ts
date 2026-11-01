import { Injectable, signal } from '@angular/core';

export type ToastTipo = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  tipo: ToastTipo;
  titulo: string;
  mensagem: string;
  /** Duração em ms (0 = permanece até ser fechado). */
  duracao: number;
}

const TITULOS: Record<ToastTipo, string> = {
  success: 'Tudo certo',
  error: 'Algo deu errado',
  warning: 'Atenção',
  info: 'Informação'
};

const MAXIMO_VISIVEIS = 4;

/**
 * Notificações globais (toasts). Ficam acima de qualquer página e
 * sobrevivem à navegação — ex.: "Empresa criada" após voltar à listagem.
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private sequencia = 0;
  private readonly temporizadores = new Map<number, ReturnType<typeof setTimeout>>();

  readonly toasts = signal<Toast[]>([]);

  show(mensagem: string, tipo: ToastTipo = 'info', duracao = 4500, titulo?: string): number {
    const toast: Toast = { id: ++this.sequencia, tipo, mensagem, titulo: titulo ?? TITULOS[tipo], duracao };

    this.toasts.update((lista) => {
      const atualizada = [...lista, toast];
      const excedentes = atualizada.slice(0, Math.max(0, atualizada.length - MAXIMO_VISIVEIS));
      excedentes.forEach((item) => this.limparTemporizador(item.id));
      return atualizada.slice(-MAXIMO_VISIVEIS);
    });

    if (duracao > 0) {
      this.temporizadores.set(
        toast.id,
        setTimeout(() => this.dismiss(toast.id), duracao)
      );
    }

    return toast.id;
  }

  success(mensagem: string, titulo?: string): number {
    return this.show(mensagem, 'success', 4500, titulo);
  }

  error(mensagem: string, titulo?: string): number {
    return this.show(mensagem, 'error', 7000, titulo);
  }

  warning(mensagem: string, titulo?: string): number {
    return this.show(mensagem, 'warning', 6000, titulo);
  }

  info(mensagem: string, titulo?: string): number {
    return this.show(mensagem, 'info', 4500, titulo);
  }

  dismiss(id: number): void {
    this.limparTemporizador(id);
    this.toasts.update((lista) => lista.filter((toast) => toast.id !== id));
  }

  private limparTemporizador(id: number): void {
    const temporizador = this.temporizadores.get(id);
    if (temporizador) {
      clearTimeout(temporizador);
      this.temporizadores.delete(id);
    }
  }
}
