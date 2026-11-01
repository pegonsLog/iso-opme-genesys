import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidenavComponent } from '../../shared/components/sidenav/sidenav.component';
import { SidenavService } from '../../services/sidenav.service';

/**
 * Layout autenticado: menu lateral, barra com as logomarcas e área de conteúdo.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, SidenavComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent {
  protected readonly sidenav = inject(SidenavService);
  private readonly conteudo = viewChild.required<ElementRef<HTMLElement>>('conteudo');

  /** Link "pular para o conteúdo" (acessibilidade por teclado). */
  protected focarConteudo(): void {
    this.conteudo().nativeElement.focus();
  }
}
