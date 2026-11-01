import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { AuthService } from '../../core/auth/auth.service';
import { FieldErrorComponent } from '../../shared/components/field-error/field-error.component';
import { anoAtual } from '../../shared/utils/formatters';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgIcon, FieldErrorComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly erro = signal('');
  protected readonly carregando = signal(false);
  protected readonly mostrarSenha = signal(false);
  protected readonly capsLock = signal(false);
  protected readonly tremendo = signal(false);
  protected readonly ano = anoAtual();

  protected readonly destaques = [
    { icone: 'heroAcademicCap', titulo: 'Treinamentos', texto: 'Matriz por cargo, cronograma e eficácia' },
    { icone: 'heroFolderOpen', titulo: 'Pasta auditável', texto: 'Evidências de cada colaborador' },
    { icone: 'heroShieldCheck', titulo: 'Auditoria', texto: 'Checklist e não conformidades' },
  ];

  protected async entrar(): Promise<void> {
    if (this.carregando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.tremendo.set(true);
      return;
    }

    this.carregando.set(true);
    this.erro.set('');
    const { email, senha } = this.form.getRawValue();

    try {
      const resultado = await this.authService.entrar(email, senha);
      if (resultado.sucesso) {
        await this.router.navigate(['/home']);
      } else {
        this.erro.set(resultado.erro || 'Não foi possível entrar. Tente novamente.');
        this.tremendo.set(true);
        this.form.controls.senha.reset();
      }
    } finally {
      this.carregando.set(false);
    }
  }

  protected verificarCapsLock(evento: KeyboardEvent): void {
    this.capsLock.set(evento.getModifierState?.('CapsLock') ?? false);
  }
}
