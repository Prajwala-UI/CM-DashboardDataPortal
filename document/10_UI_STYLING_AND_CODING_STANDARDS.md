# 10 — UI, Styling and Coding Standards

## 1. Styling stack

| Source | Loaded from | Scope |
|---|---|---|
| Bootstrap 3.4.1 CSS | `index.html` (maxcdn) | global (as in Angular) |
| Font Awesome 4.7 CSS (`fa fa-*` classes) | `index.html` (cdnjs) | global |
| Google Fonts Poppins, Merienda, Open Sans | `index.html` (+ Poppins `@import` in `AppShell.css`) | global |
| Screen CSS | `src/Styles/*.css`, imported by the page or shell | scoped (below) |

No CSS-in-JS, no CSS modules, no Bootstrap JS/jQuery. Inline `style={{…}}` only where Angular had inline styles. [V]

## 2. Scoping rules (must keep)

Angular isolates each component's CSS. React reproduces that two ways:

| Scope | Rule | Example |
|---|---|---|
| Shell (`AppShell.css`) | every shell element has the attribute `data-shell` (spread `{...S}` in `AppShell.js`); every compound selector requires `[data-shell]` | `p[data-shell]`, `.open[data-shell] > .dropdown-menu[data-shell]` |
| Pages | the page's root element has a page class; every selector is prefixed with it | `.page-home .cms-card`, `.page-login *` |
| Keyframes | names prefixed per file | `home-cmsModalIn`, `detail-cmsSuccessIconIn`, `login-cmd-spin` |

Why: the shell CSS contains generic selectors (`p`, `a::before`, `.active`, `.modal`, `.fa`) that would otherwise restyle every page. A page selector `.page-x .y` has the same specificity as Angular's `.y[_ngcontent]`, so cascade results match. [V]

**Adding styles:** put shell rules in `AppShell.css` with `[data-shell]` on each compound and add `{...S}` to the new elements; put page rules in the page's CSS file under its root class; keep modals inside the page root (no portals) so page styles reach them.

## 3. Shared UI patterns (CSS class vocabulary from Angular)

| Pattern | Classes | Component |
|---|---|---|
| Modal | `cms-modal-overlay`, `cms-modal`, `cms-modal-sm/lg/xl`, `cms-modal-header/body/footer` | `CmsModal`, `SuccessModal` |
| Loading / error | `cms-state-msg`, `cms-state-error`, `btn-link` (Retry) | `LoadingMessage`, `ErrorMessage` |
| Status badge | `cms-badge`, `cms-badge-dot` + inline colours from `getStatusMeta` | cards, tables, header |
| Buttons | `btn-primary`, `btn-secondary` (page-defined, override Bootstrap per page) | — |
| Banners | `cms-error-banner`, `cms-success-banner` | modals, overview |
| Login controls | `cmd-*` (`cmd-select`, `cmd-input`, `cmd-alert`) | `SearchableSelect`, login forms |
| Hidden file input | `cms-hidden-file-input` + `ref.current.click()` | Add Project, banners, logo, documents, KPI logo |

## 4. Coding conventions (as used in this codebase)

| Area | Convention |
|---|---|
| Language | JavaScript with JSX in `.js` files (`.jsx` only in `src/Routes/`) |
| Components | function components, `const Name = (props) => …; export default Name;` |
| Folders | PascalCase top-level folders under `src/` (`API`, `Config`, `Routes`, `Layout`, `Hooks`, `Pages`, `Components`, `Utils`, `Styles`) — reference-project standard |
| Files | PascalCase for components/pages; camelCase for hooks (`useX.js`) and utils |
| Hooks | `useX`; return one object; event handlers named after the Angular methods (`saveAs`, `applyChangeStatus`, `loadStateKpis`) for traceability |
| Service names | camelCase of the Angular method (`cmdGetStateKpis`) |
| Payload keys | exactly as the backend expects (mixed casing) — never normalise |
| Messages | copied verbatim from Angular (including "Untill", "Are you Sure", "Mission's") |
| Comments | short header comment naming the Angular source being reproduced |
| State updates | immutable (`map`, spread); multi-field forms use a single state object with a `set(patch)` helper (`useLoginLogic`) |
| Side effects | API calls in hooks; components stay presentational (exception: Home's two modals) |
| Logging | `devLog(...)` only (off in prod); no `console.log` in components |
| Imports order | React → router → libraries → hooks → utils → components → CSS |

## 5. Accessibility notes

Matches Angular, i.e. limited: clickable `div`/`span`/`a` without `href` for several actions, icon-only buttons with `title` only, no focus management in modals. Not improved, to keep parity. [V]
