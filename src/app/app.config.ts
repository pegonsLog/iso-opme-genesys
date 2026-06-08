import {
  ApplicationConfig,
  EnvironmentProviders,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { initializeFirestore, provideFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { provideDataRepository } from './core/data/data-providers';
import { inicializarSso } from './core/auth/sso';

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
    provideRouter(routes, withComponentInputBinding()),
    provideDataRepository(),
    ...firebaseProviders,
    // SSO: aplica a sessão recebida via URL (?sso=) antes dos guards de rota.
    provideAppInitializer(inicializarSso),
  ],
};
