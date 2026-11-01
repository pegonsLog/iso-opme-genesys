# Design system (SCSS)

Estilos globais da aplicação, sem dependência de Bootstrap. A fonte padrão é a **Montserrat**, carregada no `index.html`.

## Estrutura

```
src/styles.scss            # ponto de entrada + utilitários
src/styles/
├── _variables.scss        # tokens: cores da marca, neutros, sombras, raios, movimento, layout
├── _mixins.scss           # mixins (não emitem CSS)
├── _base.scss             # CSS custom properties (:root), reset, tipografia, tooltip
├── _animations.scss       # keyframes, classes de animação e transições de rota
└── _components.scss       # botões, formulários, cards, tabelas, badges, acordeões...
```

## Cores da marca

| Token              | Valor     | Uso                               |
| ------------------ | --------- | --------------------------------- |
| `$primary-color`   | `#0066a1` | Azul principal (ação principal)   |
| `$secondary-color` | `#3dbfb0` | Turquesa GenesysMed               |
| `$accent-color`    | `#8bc53f` | Verde de destaque (sucesso)       |

Versões `-strong` (`$secondary-strong`, `$accent-strong`) têm contraste adequado para texto.
Todos os tokens também existem como CSS custom properties (ex.: `var(--primary-color)`).

## Usando nos componentes

```scss
@use "variables" as *;
@use "mixins" as *;

.meu-card {
  @include surface;
  padding: $spacing-lg;

  @include mobile {
    padding: $spacing-md;
  }
}
```

## Classes globais mais usadas

- Layout: `.page`, `.page-narrow`, `.page-medium`, `.toolbar`, `.section-title`
- Botões: `.btn` + `.btn-primary | .btn-success | .btn-secondary | .btn-soft | .btn-ghost | .btn-danger | .btn-white`, tamanhos `.btn-sm | .btn-lg`, `.btn-icon`
- Formulários: `.form-card`, `.form-grid`, `.field`, `.field-label`, `.control`, `.form-actions`, `.segmented`, `.search-box`
- Dados: `.entity-grid` / `.entity-card`, `.table-card` / `.table`, `.stats-grid` / `.stat-card`, `.badge-*`, `.num-pill`, `.chip`
- Feedback: `.callout.info | .success | .warning | .danger`, `.skeleton`, `.spinner`, `.empty-state`
- Acordeões: `.acc`, `.acc-trigger`, `.acc-panel`, `.acc-body`, `.acc-sub`

## Animações

- Entrada/saída de elementos com `animate.enter` / `animate.leave` (Angular 20.2+):
  `anim-fade-in`, `anim-fade-up`, `anim-scale-in`, `anim-expand` / `anim-collapse`, entre outras.
- Escalonamento em listas: defina `[style.--i]="$index"` nos itens.
- Transições entre páginas via View Transitions API (`withViewTransitions` no roteador).
- `prefers-reduced-motion` é respeitado globalmente.
