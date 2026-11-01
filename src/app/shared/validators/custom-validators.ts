import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

type DetalheErro = Record<string, unknown>;

/**
 * Validadores customizados para formulários
 */
export class CustomValidators {
  /** O campo não pode conter apenas espaços em branco. */
  static noWhitespace(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      if (valor === null || valor === undefined || valor === '') return null;
      return typeof valor === 'string' && valor.trim().length === 0 ? { whitespace: true } : null;
    };
  }

  /** E-mail com formato válido (mais rigoroso que Validators.email). */
  static emailFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valido = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(control.value).trim());
      return valido ? null : { emailFormat: true };
    };
  }

  /** Senha com tamanho mínimo. */
  static passwordStrength(minLength = 6): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return String(control.value).length < minLength ? { passwordStrength: { minLength } } : null;
    };
  }

  /** Dois campos do grupo devem ter o mesmo valor (ex.: confirmação de senha). */
  static matchFields(fieldName: string, matchFieldName: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const campo = group.get(fieldName);
      const confirmacao = group.get(matchFieldName);
      if (!campo || !confirmacao) return null;

      if (campo.value !== confirmacao.value) {
        confirmacao.setErrors({ ...confirmacao.errors, matchFields: true });
        return { matchFields: true };
      }

      if (confirmacao.errors?.['matchFields']) {
        const { matchFields: _removido, ...demais } = confirmacao.errors;
        confirmacao.setErrors(Object.keys(demais).length ? demais : null);
      }
      return null;
    };
  }

  /** Número maior que zero. */
  static positiveNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined || control.value === '') return null;
      return Number(control.value) > 0 ? null : { positiveNumber: true };
    };
  }

  /** Número dentro do intervalo [min, max]. */
  static range(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined || control.value === '') return null;
      const valor = Number(control.value);
      return valor < min || valor > max ? { range: { min, max, actual: valor } } : null;
    };
  }
}

/**
 * Mensagens de erro padrão em português
 */
export const ERROR_MESSAGES: Record<string, string | ((erro: DetalheErro) => string)> = {
  required: 'Este campo é obrigatório',
  email: 'E-mail inválido',
  emailFormat: 'E-mail inválido',
  whitespace: 'Este campo não pode conter apenas espaços',
  minlength: (erro) => `Mínimo de ${erro['requiredLength']} caracteres`,
  maxlength: (erro) => `Máximo de ${erro['requiredLength']} caracteres`,
  min: (erro) => `O valor mínimo é ${erro['min']}`,
  max: (erro) => `O valor máximo é ${erro['max']}`,
  passwordStrength: (erro) => `A senha deve ter no mínimo ${erro['minLength']} caracteres`,
  matchFields: 'Os campos não coincidem',
  positiveNumber: 'O valor deve ser positivo',
  range: (erro) => `O valor deve estar entre ${erro['min']} e ${erro['max']}`,
  pattern: 'Formato inválido',
  duplicado: 'Já existe um registro com este número'
};

/**
 * Retorna a mensagem do primeiro erro de um controle.
 */
export function getErrorMessage(control: AbstractControl | null): string {
  if (!control?.errors) return '';

  const [chave] = Object.keys(control.errors);
  const detalhe = control.errors[chave];
  const mensagem = ERROR_MESSAGES[chave];

  if (typeof mensagem === 'function') {
    return mensagem(typeof detalhe === 'object' && detalhe !== null ? (detalhe as DetalheErro) : {});
  }
  return mensagem ?? 'Campo inválido';
}
