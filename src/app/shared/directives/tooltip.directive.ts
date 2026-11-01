import { DOCUMENT, Directive, ElementRef, OnDestroy, effect, inject, input } from '@angular/core';

/**
 * Tooltip leve posicionado à direita do elemento (usado no menu recolhido).
 * Renderizado no <body> para não ser cortado por contêineres com rolagem.
 *
 * <a appTooltip="Início" [appTooltipDisabled]="!recolhido()">...</a>
 */
@Directive({
  selector: '[appTooltip]',
  host: {
    '(mouseenter)': 'mostrar()',
    '(focusin)': 'mostrar()',
    '(mouseleave)': 'esconder()',
    '(focusout)': 'esconder()',
    '(click)': 'esconder()'
  }
})
export class TooltipDirective implements OnDestroy {
  readonly appTooltip = input.required<string>();
  readonly appTooltipDisabled = input(false);

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private balao: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.appTooltipDisabled()) this.esconder();
    });
  }

  protected mostrar(): void {
    if (this.appTooltipDisabled() || !this.appTooltip() || this.balao) return;

    const balao = this.document.createElement('div');
    balao.className = 'app-tooltip';
    balao.setAttribute('role', 'tooltip');
    balao.textContent = this.appTooltip();
    this.document.body.appendChild(balao);

    const area = this.host.getBoundingClientRect();
    balao.style.top = `${area.top + area.height / 2}px`;
    balao.style.left = `${area.right + 12}px`;
    this.balao = balao;
  }

  protected esconder(): void {
    this.balao?.remove();
    this.balao = null;
  }

  ngOnDestroy(): void {
    this.esconder();
  }
}
