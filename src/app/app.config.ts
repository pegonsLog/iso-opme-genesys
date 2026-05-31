import {
  ApplicationConfig,
  EnvironmentProviders,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { provideDataRepository } from './core/data/data-providers';

/**
 * Providers do Firebase só são registrados quando `firebaseEnabled` é true
 * (após preencher as credenciais). Enquanto isso, a app roda com o
 * repositório em memória, sem tentar conectar ao Firestore.
 */
const firebaseProviders: EnvironmentProviders[] = environment.firebaseEnabled
  ? [
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideFirestore(() => getFirestore()),
      provideAuth(() => getAuth()),
    ]
  : [];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideDataRepository(),
    ...firebaseProviders,
  ],
};
