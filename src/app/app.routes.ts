import { Routes } from '@angular/router';
import { MainLayout } from './core/layout/main-layout';
import { EmConstrucao } from './shared/em-construcao/em-construcao';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
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
        path: 'treinamentos',
        loadComponent: () =>
          import('./features/treinamentos/treinamentos').then((m) => m.Treinamentos),
      },
      { path: 'cronograma', component: EmConstrucao, data: { titulo: 'Cronograma Anual' } },
      { path: 'integracao', component: EmConstrucao, data: { titulo: 'Integração ISO' } },
      { path: 'avaliacoes', component: EmConstrucao, data: { titulo: 'Avaliação de Eficácia' } },
      { path: 'auditoria', component: EmConstrucao, data: { titulo: 'Auditoria de RH' } },
      {
        path: 'nao-conformidades',
        component: EmConstrucao,
        data: { titulo: 'Não Conformidades' },
      },
      { path: 'documentos', component: EmConstrucao, data: { titulo: 'Documentos Regulatórios' } },
    ],
  },
  { path: '**', redirectTo: '' },
];
