import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';

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
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly sidebarAberta = signal(true);
  protected readonly usuario = this.auth.usuario;
  protected readonly mostrarLogout = this.auth.autenticacaoAtiva;

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Colaboradores', icon: '👥', route: '/colaboradores' },
    { label: 'Cargos', icon: '🪪', route: '/cargos' },
    { label: 'Matriz de Treinamento', icon: '📚', route: '/treinamentos' },
    { label: 'Cronograma', icon: '🗓️', route: '/cronograma' },
    { label: 'Integração', icon: '✅', route: '/integracao' },
    { label: 'Avaliação de Eficácia', icon: '📝', route: '/avaliacoes' },
    { label: 'Pasta Auditável', icon: '📂', route: '/pasta-auditavel' },
    { label: 'Auditoria', icon: '🔍', route: '/auditoria' },
    { label: 'Não Conformidades', icon: '⚠️', route: '/nao-conformidades' },
    { label: 'Documentos', icon: '📁', route: '/documentos' },
  ];

  protected toggleSidebar(): void {
    this.sidebarAberta.update((v) => !v);
  }

  protected async sair(): Promise<void> {
    await this.auth.sair();
    await this.router.navigate(['/login']);
  }
}
