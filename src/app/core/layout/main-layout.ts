import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  protected readonly sidebarAberta = signal(true);

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Colaboradores', icon: '👥', route: '/colaboradores' },
    { label: 'Cargos', icon: '🪪', route: '/cargos' },
    { label: 'Matriz de Treinamento', icon: '📚', route: '/treinamentos' },
    { label: 'Cronograma', icon: '🗓️', route: '/cronograma' },
    { label: 'Integração', icon: '✅', route: '/integracao' },
    { label: 'Avaliação de Eficácia', icon: '📝', route: '/avaliacoes' },
    { label: 'Auditoria', icon: '🔍', route: '/auditoria' },
    { label: 'Não Conformidades', icon: '⚠️', route: '/nao-conformidades' },
    { label: 'Documentos', icon: '📁', route: '/documentos' },
  ];

  protected toggleSidebar(): void {
    this.sidebarAberta.update((v) => !v);
  }
}
