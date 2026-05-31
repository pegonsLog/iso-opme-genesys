import { Component, input } from '@angular/core';

@Component({
  selector: 'app-em-construcao',
  template: `
    <section class="ec">
      <div class="ec__icone">🚧</div>
      <h2 class="ec__titulo">{{ titulo() }}</h2>
      <p class="ec__texto">Este módulo será implementado nas próximas fases.</p>
    </section>
  `,
  styles: [
    `
      .ec {
        background: var(--color-surface);
        border: 1px dashed var(--color-border);
        border-radius: var(--radius);
        padding: 3rem 2rem;
        text-align: center;
      }
      .ec__icone {
        font-size: 2.5rem;
      }
      .ec__titulo {
        margin-top: 0.75rem;
        font-size: 1.3rem;
        font-weight: 700;
      }
      .ec__texto {
        margin-top: 0.5rem;
        color: var(--color-text-muted);
      }
    `,
  ],
})
export class EmConstrucao {
  readonly titulo = input.required<string>();
}
