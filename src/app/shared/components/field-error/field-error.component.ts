import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { getErrorMessage } from '../../validators/custom-validators';

/**
 * Exibe a mensagem de validação de um controle quando ele foi tocado ou alterado.
 *
 * <app-field-error [control]="form.controls.nome" />
 */
@Component({
  selector: 'app-field-error',
  imports: [NgIcon],
  template: `
    @if (control().invalid && (control().touched || control().dirty)) {
      <span class="field-error" role="alert">
        <ng-icon name="heroExclamationCircle" size="16" />
        {{ mensagem() }}
      </span>
    }
  `,
  host: { style: 'display: contents' }
})
export class FieldErrorComponent {
  readonly control = input.required<AbstractControl>();

  protected mensagem(): string {
    return getErrorMessage(this.control());
  }
}
