import { ChangeDetectionStrategy, Component, DOCUMENT, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationError, Router, RouterOutlet } from '@angular/router';
import { filter, take } from 'rxjs';
import { DialogHostComponent } from './shared/components/dialog-host/dialog-host.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

/** Tempo mínimo (desde o início do carregamento) em que a splash permanece visível. */
const SPLASH_TEMPO_MINIMO_MS = 900;
/** Garantia: a splash nunca fica presa na tela. */
const SPLASH_TEMPO_MAXIMO_MS = 10000;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent, DialogHostComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  constructor() {
    const garantia = setTimeout(() => this.ocultarSplash(), SPLASH_TEMPO_MAXIMO_MS);

    // Remove a splash assim que a primeira navegação terminar
    this.router.events
      .pipe(
        filter(
          (evento) =>
            evento instanceof NavigationEnd || evento instanceof NavigationCancel || evento instanceof NavigationError
        ),
        take(1),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        clearTimeout(garantia);
        const espera = Math.max(0, SPLASH_TEMPO_MINIMO_MS - performance.now());
        setTimeout(() => requestAnimationFrame(() => this.ocultarSplash()), espera);
      });
  }

  private ocultarSplash(): void {
    const splash = this.document.getElementById('app-splash');
    if (!splash || splash.classList.contains('is-hidden')) return;

    splash.classList.add('is-hidden');
    const remover = () => splash.remove();
    splash.addEventListener('transitionend', remover, { once: true });
    setTimeout(remover, 800);
  }
}
