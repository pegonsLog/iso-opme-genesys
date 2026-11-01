import { Directive, ElementRef, effect, inject, input } from '@angular/core';
import { formatInteger } from '../utils/formatters';

/**
 * Anima a contagem de um número inteiro (ex.: 0 → 128) com easing.
 * Respeita prefers-reduced-motion.
 *
 * <strong [appCountUp]="total()"></strong>
 */
@Directive({
  selector: '[appCountUp]'
})
export class CountUpDirective {
  readonly appCountUp = input.required<number | null | undefined>();
  readonly countUpDuration = input(900);

  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private valorAtual = 0;

  constructor() {
    effect((onCleanup) => {
      const destino = Math.round(Number(this.appCountUp()) || 0);
      const origem = this.valorAtual;
      const duracao = this.countUpDuration();
      const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduzirMovimento || duracao <= 0 || origem === destino) {
        this.escrever(destino);
        return;
      }

      const inicio = performance.now();
      let quadro = 0;

      const passo = (agora: number) => {
        const progresso = Math.min(1, (agora - inicio) / duracao);
        const suavizado = 1 - Math.pow(1 - progresso, 3);
        this.escrever(Math.round(origem + (destino - origem) * suavizado));
        if (progresso < 1) {
          quadro = requestAnimationFrame(passo);
        }
      };

      quadro = requestAnimationFrame(passo);
      onCleanup(() => cancelAnimationFrame(quadro));
    });
  }

  private escrever(valor: number): void {
    this.valorAtual = valor;
    this.elemento.textContent = formatInteger(valor);
  }
}
