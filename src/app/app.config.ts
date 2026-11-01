import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  EnvironmentProviders,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { initializeFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { provideDataRepository } from './core/data/data-providers';
import { inicializarSso } from './core/auth/sso';
import { AppTitleStrategy } from './app-title.strategy';
import { APP_ICONS } from './shared/icons';

// Padrões do projeto: português do Brasil e Real (BRL)
registerLocaleData(localePt, 'pt-BR');

/**
 * Providers do Firebase só são registrados quando `firebaseEnabled` é true
 * (após preencher as credenciais). Enquanto isso, a app roda com o
 * repositório em memória, sem tentar conectar ao Firestore.
 */
const firebaseProviders: EnvironmentProviders[] = environment.firebaseEnabled
  ? [
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      // `ignoreUndefinedProperties` evita o erro "Unsupported field value:
      // undefined" ao gravar modelos com campos opcionais não preenchidos
      // (ex.: codigo/revisao/cbo de cargos importados).
      provideFirestore(() => initializeFirestore(getApp(), { ignoreUndefinedProperties: true })),
    ]
  : [];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions({ skipInitialTransition: true }),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
    provideNgIconsConfig({ strokeWidth: 1.75 }),
    provideIcons(APP_ICONS),
    provideDataRepository(),
    ...firebaseProviders,
    // SSO: aplica a sessão recebida via URL (?sso=) antes dos guards de rota.
    provideAppInitializer(inicializarSso),
  ],
};
