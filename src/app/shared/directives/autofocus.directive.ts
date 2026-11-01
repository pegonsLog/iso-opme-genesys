import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';

/** Foca o elemento assim que ele é renderizado (ex.: campo de edição recém-aberto). */
@Directive({
  selector: '[appAutofocus]'
})
export class AutofocusDirective {
  constructor() {
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => {
      elemento.focus({ preventScroll: true });
      if (elemento instanceof HTMLTextAreaElement || elemento instanceof HTMLInputElement) {
        const fim = elemento.value.length;
        elemento.setSelectionRange(fim, fim);
      }
    });
  }
}
