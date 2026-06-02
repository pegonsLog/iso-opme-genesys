import { Routes } from '@angular/router';
import { MainLayout } from './core/layout/main-layout';
import { authGuard, loginGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'colaboradores',
        loadComponent: () =>
          import('./features/colaboradores/colaboradores').then((m) => m.Colaboradores),
      },
      {
        path: 'cargos',
        loadComponent: () => import('./features/cargos/cargos').then((m) => m.Cargos),
      },
      {
        path: 'cargos/importar',
        loadComponent: () =>
          import('./features/importar-cargos/importar-cargos').then((m) => m.ImportarCargos),
      },
      {
        path: 'treinamentos',
        loadComponent: () =>
          import('./features/treinamentos/treinamentos').then((m) => m.Treinamentos),
      },
      {
        path: 'cronograma',
        loadComponent: () => import('./features/cronograma/cronograma').then((m) => m.Cronograma),
      },
      {
        path: 'integracao',
        loadComponent: () => import('./features/integracao/integracao').then((m) => m.Integracao),
      },
      {
        path: 'avaliacoes',
        loadComponent: () => import('./features/avaliacoes/avaliacoes').then((m) => m.Avaliacoes),
      },
      {
        path: 'pasta-auditavel',
        loadComponent: () =>
          import('./features/pasta-auditavel/pasta-auditavel').then((m) => m.PastaAuditavel),
      },
      {
        path: 'auditoria',
        loadComponent: () => import('./features/auditoria/auditoria').then((m) => m.Auditoria),
      },
      {
        path: 'nao-conformidades',
        loadComponent: () =>
          import('./features/nao-conformidades/nao-conformidades').then((m) => m.NaoConformidades),
      },
      {
        path: 'documentos',
        loadComponent: () => import('./features/documentos/documentos').then((m) => m.Documentos),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
