# Prompt: aplicar o design system do Grupo GenesysMed

> Cole tudo abaixo da linha no agente de IA do outro app. Ajuste só os itens marcados com **[PREENCHER]**.

---

## Objetivo

Este app faz parte de um pacote de apps do **Grupo GenesysMed**. Ele precisa ficar **visualmente idêntico** ao app de referência "Pesquisa de Clima" (cores, fonte, espaçamentos, raios, sombras, botões, formulários, tabelas, cards, menu lateral, login, splash screen, notificações, diálogos e animações). O usuário deve sentir que está no mesmo produto ao trocar de app.

- **App de referência (código-fonte):** `c:\projetos\pesquisaclimagrupoino` (Angular 20, standalone, signals, zoneless, SCSS).
- **Nome deste app:** [Gestão de RH · ISO 13485, ex.: "Gestão de Treinamentos"]
- **Ícone/logotipo deste app:** [src/app/assets/logos: caminho do `logo.svg` e dos PNGs; se não houver, use temporariamente os do app de referência]

## Regra principal: copiar, não reinventar

Se o código de referência estiver acessível, **copie os arquivos sem alterar valores**. Não recrie os estilos “de cabeça” e não troque nenhum token por um valor parecido. Se este app não for Angular, converta mantendo exatamente os mesmos valores (cores, tamanhos, tempos, curvas de animação).

Copie da referência para este projeto:

| Origem (referência) | Conteúdo |
| --- | --- |
| `src/styles/_variables.scss` | tokens: cores, gradientes, sombras, espaçamentos, raios, movimento, tipografia, layout, breakpoints, z-index |
| `src/styles/_mixins.scss` | mixins (`surface`, `glass`, `focus-ring`, `card-hover`, `icon-button`, `spinner`, `avatar`, `scrollbar-thin`, `mobile`, `tablet`...) |
| `src/styles/_base.scss` | CSS custom properties em `:root`, reset, tipografia, foco, seleção, tooltip |
| `src/styles/_animations.scss` | keyframes, classes `anim-*`, transições de rota (View Transitions) e `prefers-reduced-motion` |
| `src/styles/_components.scss` | componentes globais: `.btn*`, `.control`, `.field*`, `.form-card`, `.card`, `.table*`, `.badge*`, `.callout`, `.skeleton*`, `.empty-state`, `.stat-card`, `.entity-card`, `.toolbar`, `.pager`, `.segmented`, `.chip`, `.progress`, `.spinner`, `.page*`, `.prose`... |
| `src/styles.scss` | ponto de entrada (`@use` dos parciais) e utilitários (`.sr-only`, `.text-muted`, `.tabular`, `.mt-*`, `.hide-mobile`...) |
| `src/styles/README.md` | documentação dos tokens |
| `src/index.html` | bloco `<style>` e marcação da **splash screen** (`#app-splash`), links da fonte e dos ícones |
| `src/app/layout/shell/*` | layout autenticado: menu lateral + barra com a logo + área de conteúdo |
| `src/app/shared/components/sidenav/*` | menu lateral escuro, recolhível, com gaveta no celular |
| `src/app/shared/components/{page-header,toast-container,dialog-host,empty-state,field-error,search-box}/*` | componentes visuais compartilhados |
| `src/app/shared/directives/{tooltip,count-up,autofocus}.directive.ts` | tooltip, contador animado, foco automático |
| `src/app/services/{toast,dialog,sidenav}.service.ts` | serviços de notificação, diálogo de confirmação e estado do menu |
| `src/app/shared/icons.ts` | registro central de ícones (`@ng-icons/heroicons`, outline, `strokeWidth: 1.75`) |
| `src/app/components/login/login.{html,scss,ts}` | layout da tela de login (adaptar só os textos e a lógica de autenticação) |
| `src/app/assets/Logos/Genesys.png` | logo da GenesysMed |
| `public/manifest.webmanifest`, `public/favicon.ico` | modelo de manifest e favicon (trocar pelos ícones deste app) |

Em `angular.json`, configure como na referência:
- `"styles": ["src/styles.scss"]`, `"inlineStyleLanguage": "scss"` e `"stylePreprocessorOptions": { "includePaths": ["src/styles"] }`, para que cada componente use `@use "variables" as *; @use "mixins" as *;`.
- Assets: `public/` na raiz e `src/app/assets` publicado em `/assets`.

Remova bibliotecas de UI concorrentes (Bootstrap, Tailwind, Angular Material, PrimeNG etc.). Elas sobrescrevem o design system.

## Especificação (use se não puder copiar os arquivos)

### Marca e cores
- **Primária (azul):** `#0066A1`; dark `#004D7A`; darker `#003A5C`; deep `#052A43`; light `#3D8FC4`; soft `#E8F2F9`.
- **Secundária (turquesa GenesysMed):** `#3DBFB0`; dark `#2A9D8F`; strong (texto, contraste AA) `#1A7D73`; light `#6DD5C7`; soft `#E8F7F5`.
- **Destaque (verde):** `#8BC53F`; dark `#6FA32E`; strong (texto) `#4D8A1F`; light `#A8D96F`; soft `#F1F8E8`.
- **Feedback:** sucesso `#4D8A1F`/`#F1F8E8`; erro `#DC2626`/`#FEF2F2`; aviso `#B45309` (vivo `#F59E0B`)/`#FFFBEB`; informação = primária.
- **Neutros (slate):** 50 `#F8FAFC`, 100 `#F1F5F9`, 200 `#E2E8F0`, 300 `#CBD5E1`, 400 `#94A3B8`, 500 `#64748B`, 600 `#475569`, 700 `#334155`, 800 `#1E293B`, 900 `#0F172A`.
- **Texto:** títulos `#0F172A`, corpo `#1E293B`, secundário `#64748B`, desabilitado `#94A3B8`.
- **Fundos:** página `#F3F6FA`, superfície `#FFFFFF`; bordas `#E2E8F0` (forte `#CBD5E1`).

### Gradientes
- Marca: `linear-gradient(135deg, #004D7A 0%, #0066A1 48%, #2A9D8F 100%)`
- Marca horizontal: `linear-gradient(90deg, #0066A1 0%, #2A9D8F 100%)`
- Marca suave: `linear-gradient(135deg, rgba(0,102,161,.08) 0%, rgba(61,191,176,.12) 100%)`
- Botão primário: `linear-gradient(135deg, #0B7CBD 0%, #0066A1 55%, #004D7A 100%)`
- Sucesso: `linear-gradient(135deg, #6FA32E 0%, #4D8A1F 100%)`
- Menu lateral: `linear-gradient(180deg, #063654 0%, #052A43 60%, #041F33 100%)`

### Tipografia
- Fonte única: **Montserrat** (Google Fonts, pesos 400/500/600/700/800, `display=swap`, com `preconnect`), fallback `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- Tamanhos: 0.75 / 0.875 / 1 / 1.125 / 1.5 / 2 rem. Títulos em 800 (extrabold) com `letter-spacing` entre -0.02em e -0.03em; botões e rótulos em 600.

### Espaço, raios e sombras
- Espaçamentos: 4, 8, 16, 24, 32, 48 px.
- Raios: 6, 8, 12, 16, 20, 28 px e pílula (999px). Botões e campos usam 12px; cards 16px.
- Sombras:
  - xs `0 1px 2px rgba(15,23,42,.06)`
  - sm `0 1px 3px rgba(15,23,42,.08), 0 1px 2px rgba(15,23,42,.04)`
  - md `0 6px 16px -4px rgba(15,23,42,.1), 0 2px 6px -2px rgba(15,23,42,.06)`
  - lg `0 16px 32px -8px rgba(15,23,42,.16), 0 6px 12px -6px rgba(15,23,42,.08)`
  - xl `0 28px 56px -12px rgba(15,23,42,.3)`
  - brand `0 10px 24px -8px rgba(0,102,161,.55)`
- Superfície padrão (`surface`): fundo branco, borda 1px `#E2E8F0`, raio 16px, sombra sm.

### Movimento
- Curvas: ease-out `cubic-bezier(0.16, 1, 0.3, 1)`, ease-in-out `cubic-bezier(0.65, 0, 0.35, 1)`, spring `cubic-bezier(0.34, 1.56, 0.64, 1)`.
- Durações: rápida 150ms; normal 250ms; lenta 450ms.
- Páginas entram com `page-in` (0.45s). Cards e listas entram com `fade-up` escalonado (`animation-delay: calc(var(--i) * 60ms)`). Carregamento usa skeleton com brilho (`shimmer`). Erro de formulário usa `shake`.
- Troca de rota com View Transitions: a página sai em 0.16s (sobe 6px e some) e entra em 0.34s (sobe de 12px).
- Respeitar `prefers-reduced-motion`: desligar todas as animações.

### Layout
- Menu lateral: 288px (recolhido 84px), fundo com o gradiente do menu. O logotipo do app fica num quadrado branco de 44px com raio 14px. No celular (≤ 768px) vira gaveta com fundo escurecido e barra superior de 64px.
- Barra superior do conteúdo: logo da GenesysMed (32px de altura; 24px no celular) alinhada à direita.
- Conteúdo: largura máxima 1400px, padding 1.5rem 2rem (tablet 1.25rem 1.5rem).
- Breakpoints: 480px (small), 768px (mobile), 1024px (tablet).
- z-index: menu 900, barra do celular 950, overlay 1000, diálogo 1100, toast 1200.

### Componentes
- **Botões:** altura 44px (sm 36px, lg 54px), padding 0 1.25rem, raio 12px, fonte 0.9375rem/600. Primário com o gradiente do botão; ao passar o mouse, sobe 1px e ganha sombra brand; ao clicar, `scale(0.98)`. Variantes: secondary, success, danger, ghost, soft, white, icon e link.
- **Campos (`.control`):** altura mínima 46px, borda 1.5px `#E2E8F0`, raio 12px, fonte 0.9375rem. Foco com borda primária e anel suave. Rótulo acima, dica e erro abaixo.
- **Formulários:** `.form-card` com padding 2rem e `.form-grid` em duas colunas (uma no celular).
- **Tabelas:** cabeçalho fixo, linhas com hover, rolagem horizontal com sombras indicando conteúdo oculto.
- **Badges:** pílula com padding 0.25rem 0.6875rem e fonte 0.75rem. Cores: primary, teal, green, amber, red e solid.
- **Também padronizados:** callouts (raio 14px) e estados vazios ilustrados; paginação; filtro segmentado.
- **Toasts:** no canto, até 4 visíveis, fechamento automático (sucesso 4,5s, aviso 6s, erro 7s), títulos padrão "Tudo certo", "Atenção", "Algo deu errado", "Informação".
- **Diálogo de confirmação:** centralizado, com ícone e tom (warning/danger), botões "Cancelar" e ação.
- **Tooltips:** usados nos itens do menu recolhido.
- **Ícones:** Heroicons outline via `@ng-icons`, traço 1.75, registrados num único arquivo.

### Splash screen
Fica no `index.html`, com CSS inline, e aparece antes do app carregar:
- fundo `#F6F9FC` com dois gradientes radiais suaves (turquesa no topo direito, azul no canto inferior esquerdo);
- logotipo do app num quadrado branco de 88px (raio 26px), com anel girando em gradiente azul → turquesa → verde e pulso suave;
- título com o nome do app (24px/800) e subtítulo "GRUPO GENESYSMED" (12px/700, `letter-spacing: .18em`, cor `#1A7D73`);
- logo da GenesysMed com 28px de altura e barra de progresso de 180×4px;
- some com fade de 0.55s depois da primeira navegação, ficando visível no mínimo 900ms e no máximo 10s.

### Login
- Duas colunas. À esquerda, painel com o gradiente da marca, selo com o logotipo e o nome do produto, título grande (800) e cards de destaque translúcidos. À direita, cartão branco com a logo da GenesysMed (34px), "Bem-vindo(a)!", campos com ícone, botão primário em largura total e rodapé "Grupo GenesysMed © ano".
- No celular, o painel vira uma faixa no topo.
- Detalhes: mostrar/ocultar senha, aviso de Caps Lock e animação `shake` no erro.

### Identidade do pacote
- Todos os textos usam **"Grupo GenesysMed"**. Não usar "Grupo Ino" nem "InoMedical".
- Título da aba: `"<Página> · <Nome do app>"`. Sem página: `"<Nome do app> · Grupo GenesysMed"`.
- Ícones: `favicon.ico` (16/32/48), `logo.svg` como ícone da aba, `apple-touch-icon` 180px e `manifest.webmanifest` com ícones de 72 a 512 px, incluindo maskable 192 e 512, `theme_color: #0066a1` e `lang: pt-BR`.
- `<meta name="theme-color" content="#0066a1">` e `color-scheme: light`.

### Padrões regionais
- Idioma pt-BR (`LOCALE_ID` e `registerLocaleData`), moeda Real (BRL), fuso de Brasília, datas `dd/mm/yyyy` e horas `hh:mm`.

### Acessibilidade
- Link "Pular para o conteúdo", foco visível (anel de 3px na cor primária a 35%), rótulos para leitores de tela, Esc fecha menu e diálogos, contraste AA (usar as versões `-strong` para texto colorido).

## O que adaptar (e só isso)
1. Nome do app, textos e itens do menu lateral, conforme as telas deste app.
2. Logotipo e ícones deste app (`logo.svg`, favicons, manifest).
3. Lógica de autenticação e de dados. O visual do login fica igual.

Não altere nenhum token, tamanho, cor, sombra ou animação. Se precisar de um componente que não existe na referência, monte-o só com os tokens e mixins existentes e siga o padrão dos componentes atuais.

## Verificação (obrigatória)
1. Build sem erros e sem resto de Bootstrap/Tailwind no bundle.
2. Abra este app e o de referência lado a lado (https://pesquisaclimagrupoino.web.app) e compare com capturas de tela, em desktop (1366×800) e celular (390×844):
   - splash;
   - login;
   - menu lateral aberto e recolhido;
   - uma listagem com tabela;
   - um formulário;
   - um toast e um diálogo.
3. Confira no DevTools que `font-family` é Montserrat, `--primary-color` é `#0066a1` e que botões e campos têm 44px e 46px de altura.
4. Liste qualquer diferença visual que não conseguiu eliminar e explique o motivo.
