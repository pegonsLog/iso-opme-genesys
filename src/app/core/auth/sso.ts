import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/** Nome do parâmetro de URL usado para propagar a sessão entre os apps. */
export const SSO_PARAM = 'sso';

/** URL base do CIP (Centro de Inteligência de Pessoas). */
export const CIP_BASE_URL = 'https://centrodeinteligenciadepessoas.web.app/dashboard';

/**
 * Inicializador de SSO: ao abrir o app, se houver `?sso=<token>` na URL
 * (vindo do CIP), consome o token de uso único e, se válido, autentica
 * automaticamente. Em seguida remove o parâmetro da URL.
 *
 * Roda como APP_INITIALIZER, garantindo que a sessão esteja resolvida antes
 * dos guards de rota.
 */
export function inicializarSso(): Promise<void> {
  const auth = inject(AuthService);

  return (async () => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get(SSO_PARAM);
    if (token && !auth.logado()) {
      await auth.consumirTokenSso(token);
    }

    if (token) {
      params.delete(SSO_PARAM);
      const queryStr = params.toString();
      const novaUrl =
        window.location.pathname + (queryStr ? `?${queryStr}` : '') + window.location.hash;
      window.history.replaceState({}, '', novaUrl);
    }
  })();
}

/**
 * Navega para o CIP na mesma janela, propagando a sessão via token de uso
 * único. Caso não seja possível gerar o token, abre sem SSO (login manual).
 */
export async function abrirCip(auth: AuthService): Promise<void> {
  const token = await auth.gerarTokenSso();
  const url = token ? `${CIP_BASE_URL}?${SSO_PARAM}=${encodeURIComponent(token)}` : CIP_BASE_URL;
  window.location.href = url;
}
