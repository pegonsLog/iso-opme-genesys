import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { filter, map } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { CIP_BASE_URL, abrirCip } from '../../../core/auth/sso';
import { SidenavService } from '../../../services/sidenav.service';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { iniciais } from '../../utils/text';

interface ItemMenu {
  path: string;
  label: string;
  icon: string;
}

interface SecaoMenu {
  titulo: string;
  itens: ItemMenu[];
}

@Component({
  selector: 'app-sidenav',
  imports: [RouterLink, RouterLinkActive, NgIcon, TooltipDirective],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'fecharMenuMobile()'
  }
})
export class SidenavComponent {
  protected readonly sidenav = inject(SidenavService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly navegacao = viewChild<ElementRef<HTMLElement>>('navegacao');

  protected readonly secoes: SecaoMenu[] = [
    {
      titulo: 'Principal',
      itens: [
        { path: '/home', label: 'Início', icon: 'heroHome' },
        { path: '/dashboard', label: 'Dashboard', icon: 'heroSquares2x2' }
      ]
    },
    {
      titulo: 'Pessoas e cargos',
      itens: [
        { path: '/colaboradores', label: 'Colaboradores', icon: 'heroUserGroup' },
        { path: '/cargos', label: 'Cargos', icon: 'heroBriefcase' }
      ]
    },
    {
      titulo: 'Treinamentos',
      itens: [
        { path: '/treinamentos', label: 'Matriz de Treinamento', icon: 'heroAcademicCap' },
        { path: '/cronograma', label: 'Cronograma', icon: 'heroCalendarDays' },
        { path: '/integracao', label: 'Integração', icon: 'heroUserPlus' },
        { path: '/avaliacoes', label: 'Avaliação de Eficácia', icon: 'heroClipboardDocumentCheck' }
      ]
    },
    {
      titulo: 'Qualidade e auditoria',
      itens: [
        { path: '/pasta-auditavel', label: 'Pasta Auditável', icon: 'heroFolderOpen' },
        { path: '/auditoria', label: 'Auditoria', icon: 'heroDocumentMagnifyingGlass' },
        { path: '/nao-conformidades', label: 'Não Conformidades', icon: 'heroExclamationTriangle' },
        { path: '/documentos', label: 'Documentos', icon: 'heroDocumentText' }
      ]
    }
  ];

  /** URL base do CIP (fallback do link; o clique gera token de SSO). */
  protected readonly cipUrl = CIP_BASE_URL;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
      map((evento) => evento.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  protected readonly usuario = this.authService.usuario;
  /** Com a autenticação do CIP desativada, não há usuário nem botão de sair. */
  protected readonly autenticacaoAtiva = this.authService.autenticacaoAtiva;
  protected readonly nomeExibido = computed(() => this.usuario()?.nome || 'Acesso livre');
  protected readonly iniciais = computed(() => iniciais(this.usuario()?.nome));
  protected readonly perfil = computed(() => this.usuario()?.perfil ?? 'Autenticação desativada');

  /** No mobile o menu é uma gaveta e nunca fica recolhido. */
  protected readonly recolhido = computed(() => this.sidenav.isCollapsed() && !this.sidenav.isMobile());
  protected readonly menuMobileAberto = this.sidenav.isMobileOpen;

  constructor() {
    // Fecha a gaveta do mobile ao navegar
    this.router.events
      .pipe(
        filter((evento) => evento instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.sidenav.closeMobile());

    // Mantém o item ativo visível no menu
    afterRenderEffect((onCleanup) => {
      this.url();
      const navegacao = this.navegacao()?.nativeElement;
      if (!navegacao) return;
      const temporizador = setTimeout(() => this.revelarItemAtivo(navegacao), 400);
      onCleanup(() => clearTimeout(temporizador));
    });
  }

  private revelarItemAtivo(navegacao: HTMLElement): void {
    const ativo = navegacao.querySelector<HTMLElement>('.nav-link.is-active');
    if (!ativo) return;
    const area = navegacao.getBoundingClientRect();
    const item = ativo.getBoundingClientRect();
    if (item.top < area.top || item.bottom > area.bottom) {
      navegacao.scrollBy({ top: item.top - area.top - (area.height - item.height) / 2, behavior: 'smooth' });
    }
  }

  /** Abre o CIP propagando a sessão via token de uso único. */
  protected async abrirCip(evento: MouseEvent): Promise<void> {
    evento.preventDefault();
    this.fecharMenuMobile();
    await abrirCip(this.authService);
  }

  protected fecharMenuMobile(): void {
    this.sidenav.closeMobile();
  }

  protected sair(): void {
    this.authService.sair();
    void this.router.navigate(['/login']);
  }
}
