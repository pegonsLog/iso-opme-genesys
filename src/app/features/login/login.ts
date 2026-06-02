import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseError } from '@angular/fire/app';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected async entrar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.erro.set(null);
    this.carregando.set(true);
    const { email, senha } = this.form.getRawValue();
    try {
      await this.auth.entrar(email, senha);
      await this.router.navigate(['/dashboard']);
    } catch (e) {
      this.erro.set(this.mensagemErro(e));
    } finally {
      this.carregando.set(false);
    }
  }

  private mensagemErro(e: unknown): string {
    if (e instanceof FirebaseError) {
      switch (e.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          return 'E-mail ou senha inválidos.';
        case 'auth/too-many-requests':
          return 'Muitas tentativas. Tente novamente mais tarde.';
        case 'auth/user-disabled':
          return 'Este usuário foi desativado.';
        default:
          return 'Não foi possível entrar. Tente novamente.';
      }
    }
    return 'Não foi possível entrar. Tente novamente.';
  }
}
