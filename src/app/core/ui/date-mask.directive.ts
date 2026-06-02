import { Directive, HostListener, inject, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Máscara de data no formato dd/mm/yyyy.
 *
 * Aceita apenas dígitos e insere as barras automaticamente enquanto o
 * usuário digita. Mantém o valor do FormControl sincronizado (Reactive
 * Forms) e também funciona sem control associado.
 *
 * Uso: <input appDateMask formControlName="dataAdmissao" />
 */
@Directive({
  selector: '[appDateMask]',
})
export class DateMaskDirective {
  private readonly ngControl = inject(NgControl, { optional: true });

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatado = DateMaskDirective.formatar(input.value);
    this.aplicar(input, formatado);
  }

  @HostListener('blur')
  onBlur(): void {
    // Sem ação extra; mantido para futura validação se necessário.
  }

  private aplicar(input: HTMLInputElement, valor: string): void {
    input.value = valor;
    if (this.ngControl?.control) {
      this.ngControl.control.setValue(valor, { emitEvent: false });
    }
  }

  /** Converte uma entrada qualquer em dd/mm/yyyy parcial, só com dígitos. */
  static formatar(valor: string): string {
    const digitos = (valor ?? '').replace(/\D/g, '').slice(0, 8);
    const dia = digitos.slice(0, 2);
    const mes = digitos.slice(2, 4);
    const ano = digitos.slice(4, 8);
    let out = dia;
    if (mes) out += '/' + mes;
    if (ano) out += '/' + ano;
    return out;
  }
}
