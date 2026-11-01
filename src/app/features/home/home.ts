import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { AuthService } from '../../core/auth/auth.service';
import { SidenavService } from '../../services/sidenav.service';
import { formatDataExtenso, saudacao } from '../../shared/utils/formatters';
import { primeiroNome } from '../../shared/utils/text';

interface Destaque {
  icone: string;
  titulo: string;
  texto: string;
  tom: 'primary' | 'teal' | 'green';
}

interface Atalho {
  path: string;
  titulo: string;
  descricao: string;
  icone: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgIcon],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home {
  private readonly sidenavService = inject(SidenavService);
  private readonly authService = inject(AuthService);

  protected readonly saudacao = saudacao();
  protected readonly hoje = this.capitalizar(formatDataExtenso());
  protected readonly nome = computed(() => primeiroNome(this.authService.usuario()?.nome));

  protected readonly destaques: Destaque[] = [
    {
      icone: 'heroAcademicCap',
      titulo: 'Competência',
      texto: 'Treinamentos por cargo, cronograma e avaliação de eficácia (cláusula 6.2).',
      tom: 'primary'
    },
    {
      icone: 'heroFolderOpen',
      titulo: 'Rastreabilidade',
      texto: 'Evidências de cada colaborador reunidas na pasta auditável.',
      tom: 'teal'
    },
    {
      icone: 'heroShieldCheck',
      titulo: 'Conformidade',
      texto: 'Checklist de auditoria e tratamento de não conformidades.',
      tom: 'green'
    }
  ];

  protected readonly atalhos: Atalho[] = [
    {
      path: '/dashboard',
      titulo: 'Dashboard',
      descricao: 'Indicadores de RH conforme a ISO 13485',
      icone: 'heroSquares2x2'
    },
    {
      path: '/colaboradores',
      titulo: 'Colaboradores',
      descricao: 'Cadastro, cargos e situação da integração',
      icone: 'heroUserGroup'
    },
    {
      path: '/treinamentos',
      titulo: 'Matriz de Treinamento',
      descricao: 'Treinamentos exigidos por cargo',
      icone: 'heroAcademicCap'
    },
    {
      path: '/cronograma',
      titulo: 'Cronograma',
      descricao: 'Planejamento e registro dos treinamentos',
      icone: 'heroCalendarDays'
    },
    {
      path: '/pasta-auditavel',
      titulo: 'Pasta Auditável',
      descricao: 'Evidências por colaborador',
      icone: 'heroFolderOpen'
    },
    {
      path: '/nao-conformidades',
      titulo: 'Não Conformidades',
      descricao: 'Registro e acompanhamento das ações',
      icone: 'heroExclamationTriangle'
    }
  ];

  constructor() {
    // Expande o menu ao voltar para o início (exceto em telas menores)
    if (!this.sidenavService.isTablet()) {
      this.sidenavService.expand();
    }
  }

  private capitalizar(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
}
