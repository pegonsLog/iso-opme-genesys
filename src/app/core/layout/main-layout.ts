import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CIP_BASE_URL, abrirCip } from '../auth/sso';
import { Icon, IconName } from '../ui/icon/icon';

interface NavItem {
  label: string;
  icon: IconName;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly sidebarAberta = signal(true);
  protected readonly usuario = this.auth.usuario;
  protected readonly mostrarLogout = this.auth.autenticacaoAtiva;

  /** URL base do CIP (fallback do link; o clique gera token de SSO). */
  protected readonly cipUrl = CIP_BASE_URL;

  /** Abre o CIP propagando a sessão via token de uso único. */
  protected async abrirCip(event: MouseEvent): Promise<void> {
    event.preventDefault();
    await abrirCip(this.auth);
  }

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Colaboradores', icon: 'colaboradores', route: '/colaboradores' },
    { label: 'Cargos', icon: 'cargos', route: '/cargos' },
    { label: 'Matriz de Treinamento', icon: 'treinamentos', route: '/treinamentos' },
    { label: 'Cronograma', icon: 'cronograma', route: '/cronograma' },
    { label: 'Integração', icon: 'integracao', route: '/integracao' },
    { label: 'Avaliação de Eficácia', icon: 'avaliacoes', route: '/avaliacoes' },
    { label: 'Pasta Auditável', icon: 'pasta', route: '/pasta-auditavel' },
    { label: 'Auditoria', icon: 'auditoria', route: '/auditoria' },
    { label: 'Não Conformidades', icon: 'alerta', route: '/nao-conformidades' },
    { label: 'Documentos', icon: 'documentos', route: '/documentos' },
  ];

  protected toggleSidebar(): void {
    this.sidebarAberta.update((v) => !v);
  }

  protected async sair(): Promise<void> {
    await this.auth.sair();
    await this.router.navigate(['/login']);
  }
}
