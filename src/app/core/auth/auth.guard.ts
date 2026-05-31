import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Aguarda o estado inicial de auth ser resolvido (signal `carregado`). */
function aguardarCarregado(auth: AuthService): Promise<void> {
  if (auth.carregado()) return Promise.resolve();
  return new Promise((resolve) => {
    const intervalo = setInterval(() => {
      if (auth.carregado()) {
        clearInterval(intervalo);
        resolve();
      }
    }, 30);
  });
}

/** Bloqueia rotas protegidas para usuários não autenticados. */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.autenticacaoAtiva) return true;

  await aguardarCarregado(auth);
  if (auth.estaAutenticado) return true;

  return router.createUrlTree(['/login']);
};

/** Impede que usuários já autenticados acessem a tela de login. */
export const loginGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.autenticacaoAtiva) return router.createUrlTree(['/dashboard']);

  await aguardarCarregado(auth);
  if (auth.estaAutenticado) return router.createUrlTree(['/dashboard']);

  return true;
};
