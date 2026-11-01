import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard, loginGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Entrar',
    canActivate: [loginGuard],
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        title: 'Início',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'dashboard',
        title: 'Dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'colaboradores',
        title: 'Colaboradores',
        loadComponent: () =>
          import('./features/colaboradores/colaboradores').then((m) => m.Colaboradores),
      },
      {
        path: 'cargos',
        title: 'Cargos',
        loadComponent: () => import('./features/cargos/cargos').then((m) => m.Cargos),
      },
      {
        path: 'cargos/importar',
        title: 'Importar cargos',
        loadComponent: () =>
          import('./features/importar-cargos/importar-cargos').then((m) => m.ImportarCargos),
      },
      {
        path: 'treinamentos',
        title: 'Matriz de Treinamento',
        loadComponent: () =>
          import('./features/treinamentos/treinamentos').then((m) => m.Treinamentos),
      },
      {
        path: 'cronograma',
        title: 'Cronograma',
        loadComponent: () => import('./features/cronograma/cronograma').then((m) => m.Cronograma),
      },
      {
        path: 'integracao',
        title: 'Integração',
        loadComponent: () => import('./features/integracao/integracao').then((m) => m.Integracao),
      },
      {
        path: 'avaliacoes',
        title: 'Avaliação de Eficácia',
        loadComponent: () => import('./features/avaliacoes/avaliacoes').then((m) => m.Avaliacoes),
      },
      {
        path: 'pasta-auditavel',
        title: 'Pasta Auditável',
        loadComponent: () =>
          import('./features/pasta-auditavel/pasta-auditavel').then((m) => m.PastaAuditavel),
      },
      {
        path: 'auditoria',
        title: 'Auditoria',
        loadComponent: () => import('./features/auditoria/auditoria').then((m) => m.Auditoria),
      },
      {
        path: 'nao-conformidades',
        title: 'Não Conformidades',
        loadComponent: () =>
          import('./features/nao-conformidades/nao-conformidades').then((m) => m.NaoConformidades),
      },
      {
        path: 'documentos',
        title: 'Documentos',
        loadComponent: () => import('./features/documentos/documentos').then((m) => m.Documentos),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
