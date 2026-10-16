# 05 — Routing and Navigation

Diagram: [flowcharts/03_routing_and_navigation.md](flowcharts/03_routing_and_navigation.md).

## 1. Router

`HashRouter` in `src/App.js` — URLs look like `https://<host>/CM-DashboardDP/#/home`, identical to the Angular app (decision A1). The base path comes from Vite `base` (`REACT_APP_BASE_URL`), not from the router. [V]

## 2. Route table (`src/Routes/index.jsx`)

| Path | Element | Guard | Page chunk |
|---|---|---|---|
| `/` | `Login` | — | `Pages/Login.js` |
| `/home` | `Home` | `ProtectedRoute` | `Pages/Home.js` |
| `/project/:id` | `ProjectDetail variant="user"` | `ProtectedRoute` | `Pages/ProjectDetail.js` |
| `/NodalDashboard` | `NodalDashboard` | `ProtectedRoute` | `Pages/NodalDashboard.js` |
| `/NodalUsermgt` | `NodalUsermgt` | `ProtectedRoute` | `Pages/NodalUsermgt.js` |
| `/NodalProjectDetailspage/:id` | `ProjectDetail variant="nodal"` | `ProtectedRoute` | same as `/project/:id` |
| `*` (incl. Angular's old `/dashboard`) | `<Navigate to="/" replace/>` | — | — |

All pages are `React.lazy` with one `<Suspense fallback={<Loader/>}>`. Path casing is kept from Angular (`NodalDashboard`, not `nodal-dashboard`). [V]

## 3. Protected routes (`src/Routes/ProtectedRoute.jsx`)

```
allowed = isLoginAuthenticated && sessionStorage.LOGIN_TOKEN != null
allowed  → render element
!allowed → (once, via useEffect + ref) alert('Please Login'); navigate('/', {replace:true}); setLoginAuthenticated(false); render nothing
```

**No role check** — same as Angular: a department user can open `#/NodalDashboard` by typing it, and vice versa. Permissions are enforced only by the backend [?]. [V] [T: UI-NOAPI — one alert, redirect to `#/`]

## 4. Navigation map

| From | Action | To | Code |
|---|---|---|---|
| Login | successful login, role `NODAL` | `/NodalDashboard` | `useLoginLogic.js` `finalLogin` |
| Login | successful login, other role | `/home` | same |
| Sidebar (USER) | Home | `/home` | `AppShell.js` `NavLink` |
| Sidebar (NODAL) | 100-Days' Mission / User Management | `/NodalDashboard` / `/NodalUsermgt` | same |
| Navbar brand | click (`href="#"`) | `/` (login) | `AppShell.js` |
| Home | card footer, pencil, table row | `/project/:id` | `Home.js` `openProject` |
| Project detail (user) | "All projects", Cancel | `/home` | `useProjectDetail.js` `goHome` |
| Nodal dashboard | row, chevron | `/NodalProjectDetailspage/:id` | `NodalDashboard.js` `openProject` |
| Project detail (nodal) | "All projects", Cancel | `/NodalDashboard` | `goHome` |
| Anywhere | Logout, HTTP 401 | `/` | `AuthContext.jsx` `adminLogout` |
| Protected route without login | — | `/` | `ProtectedRoute` |
| Reset password success | full page reload | `/` | `useLoginLogic.js` `submitResetPassword` |

Only the project id travels in the URL; pages re-read everything else from storage/API, so refresh and deep links work while `LOGIN_TOKEN` exists (same tab). [V]

## 5. Active link styling

`NavLink className={({isActive}) => isActive ? 'active' : undefined}` gives the sidebar the Angular `routerLinkActive="active"` look. [V] [T: UI-NOAPI]
