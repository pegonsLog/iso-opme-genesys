import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { environment } from '../../../environments/environment';

/**
 * Serviço de autenticação sobre o Firebase Auth (e-mail/senha).
 *
 * Quando `firebaseEnabled` é false, a autenticação fica desativada e o
 * app é tratado como sempre autenticado (modo offline/local), evitando
 * bloquear o desenvolvimento sem backend.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = environment.firebaseEnabled ? inject(Auth) : null;

  /** Usuário atual (null = não autenticado). */
  readonly usuario = signal<User | null>(null);
  /** Indica que o estado inicial de auth já foi resolvido. */
  readonly carregado = signal(false);

  constructor() {
    if (!this.auth) {
      // Sem Firebase: considera autenticado para não travar o app local.
      this.carregado.set(true);
      return;
    }
    onAuthStateChanged(this.auth, (user) => {
      this.usuario.set(user);
      this.carregado.set(true);
    });
  }

  get autenticacaoAtiva(): boolean {
    return !!this.auth;
  }

  get estaAutenticado(): boolean {
    return !this.auth || this.usuario() !== null;
  }

  async entrar(email: string, senha: string): Promise<void> {
    if (!this.auth) return;
    await signInWithEmailAndPassword(this.auth, email, senha);
  }

  async sair(): Promise<void> {
    if (!this.auth) return;
    await signOut(this.auth);
  }
}
