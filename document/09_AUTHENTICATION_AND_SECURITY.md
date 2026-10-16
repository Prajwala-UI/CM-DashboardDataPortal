# 09 — Authentication and Security

Diagram: [flowcharts/04_authentication_and_session.md](flowcharts/04_authentication_and_session.md). Secret values are not shown; variables are named only.

## 1. Login model (reproduced from Angular)

1. Login page mount → `cmdGenerateToken()` with `REACT_APP_CMD_TOKEN_USERNAME` / `REACT_APP_CMD_TOKEN_PASSWORD` → **application token** (`tokenRef.current`, also `sessionStorage.CMD_API_TOKEN`).
2. User picks department + designation and authenticates (`cmdLogin` with mobile + password).
3. On `status === 200 && data`: `sessionStorage.LOGIN_TOKEN = <application token>`, profile keys → `localStorage`, `activateSideMenu()`, navigate by role.

There is no per-user token: the token obtained in step 1 becomes the session token. [V]

## 2. Pieces

| Piece | File | Behaviour |
|---|---|---|
| `AuthProvider` | `src/Routes/AuthContext.jsx` | `isLoginAuthenticated` (from `LOGIN_TOKEN` on load); `activateSideMenu()`; `adminLogout()` = flag false, remove `LOGIN_TOKEN` and `PAGE_RELOADED`, `localStorage.clear()`, `sessionStorage.clear()`, `navigate('/')`; registers `adminLogout` as the axios 401 handler |
| `ProtectedRoute` | `src/Routes/ProtectedRoute.jsx` | flag **and** token required; else single `alert('Please Login')` and redirect; no role check |
| Request interceptor | `src/API/axiosInstance.js` | `Authorisation: bearer : <LOGIN_TOKEN>` on every request |
| Response interceptor | same | 401 → `adminLogout` |
| Inactivity | `src/Hooks/useInactivityTimer.js` | 30 min (`inactivityTimeMs` 1,800,000) without mousemove/keydown/click/scroll → remove `LOGIN_TOKEN`, `REFERENCE_ID`, `myemail_id`; `alert('No User Activity Found. Please again to continue')`; `window.location.reload()` |
| Default-password gate | `useLoginLogic.verifyDefaultPassword` | compares with `REACT_APP_DEFAULT_PASSWORD` **in the browser** |

## 3. Session lifecycle

Session = browser tab (`sessionStorage`). Ends on Logout, any 401, 30-minute idle (followed by the guard alert on protected pages), or closing the tab. No refresh token, no expiry warning. [V]

## 4. Authorization

Menus depend on `ROLE`; routes do not. Data scoping relies on the backend [?]. Nodal dashboard requests `admin_Dept_Code: ''` (all departments). [V]

## 5. Security notes

| # | Note | Status |
|---|---|---|
| N1 | Token credentials and default password come from `.env.*` (gitignored) but Vite's `define` puts **all `REACT_APP_*` values into the JS bundle** — anyone can read them | inherited risk (Angular had them in source); needs backend change |
| N2 | Default-password check is client-side | inherited |
| N3 | Mobile registered before OTP verification | inherited |
| N4 | One shared application token | inherited |
| N5 | Token in sessionStorage, profile in localStorage | inherited |
| N6 | CDN stylesheets without SRI (Bootstrap, Font Awesome, Google Fonts). Angular's CDN **scripts** (jQuery, Bootstrap JS, FA kit) are no longer loaded | improved |
| N7 | `debugger` statements removed; payload logging disabled when `REACT_APP_ENV=prod` (`devLog`) | improved |
| N8 | PDF preview iframe loads server-provided paths | inherited |
| N9 | `scripts/env-loader.js` prints loaded keys to the console but masks keys containing "password"/"passphrase"; usernames are printed | be careful with CI logs |
| N10 | No route-level role checks | inherited (parity) |

Do not "fix" N2–N4/N10 in the client without business approval — parity was a requirement; see [14](14_KNOWN_ISSUES_AND_OPEN_QUESTIONS.md).
