import { Injectable, signal } from '@angular/core';

const MEDIA_TABLET = '(max-width: 1024px)';
const MEDIA_MOBILE = '(max-width: 768px)';

/**
 * Estado do menu lateral.
 * - Desktop: expandido ou recolhido (trilho de ícones).
 * - Tablet: inicia recolhido.
 * - Mobile: gaveta sobreposta (aberta/fechada).
 */
@Injectable({
  providedIn: 'root'
})
export class SidenavService {
  private readonly tabletQuery = window.matchMedia(MEDIA_TABLET);
  private readonly mobileQuery = window.matchMedia(MEDIA_MOBILE);

  readonly isCollapsed = signal(this.tabletQuery.matches);
  readonly isTablet = signal(this.tabletQuery.matches);
  readonly isMobile = signal(this.mobileQuery.matches);
  readonly isMobileOpen = signal(false);

  constructor() {
    this.tabletQuery.addEventListener('change', (evento) => {
      this.isTablet.set(evento.matches);
      if (evento.matches) this.collapse();
    });

    this.mobileQuery.addEventListener('change', (evento) => {
      this.isMobile.set(evento.matches);
      if (!evento.matches) this.closeMobile();
    });
  }

  collapse(): void {
    this.isCollapsed.set(true);
  }

  expand(): void {
    this.isCollapsed.set(false);
  }

  toggle(): void {
    this.isCollapsed.update((valor) => !valor);
  }

  openMobile(): void {
    this.isMobileOpen.set(true);
  }

  closeMobile(): void {
    this.isMobileOpen.set(false);
  }

  toggleMobile(): void {
    this.isMobileOpen.update((valor) => !valor);
  }
}
