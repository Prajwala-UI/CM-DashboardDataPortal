# CM Dashboard Data Portal — React Application Documentation

Technical documentation of the React application in `E:\Prajwala\React Migration` — the React rewrite of the legacy Angular "CM Dashboard Data Portal" (Government of Karnataka).

- **Last updated:** 2026-10-16
- **Code state documented:** migration batches B1–B7 (all screens) implemented and accepted.
- **Path convention:** paths like `src/Hooks/useLoginLogic.js:273` are relative to the project root `E:\Prajwala\React Migration`; the number is a line.
- **Evidence markers:** **[V]** verified in source · **[T]** behaviour actually tested (test named) · **[?]** unknown / needs confirmation.
- **Secrets:** environment variables are documented by **name only**; no credentials or tokens appear here.
- **Legacy reference:** the original Angular app is documented in `E:\Prajwala\document\` (linked below as "Angular docs").

## Quick start

Prerequisites: Node.js 22 (tested with v22.16.0), npm 10, internet access (CDN styles and the test API), Windows/macOS/Linux.

```bash
cd "E:\Prajwala\React Migration"
npm install
npm start
```

`npm start` runs Vite on <http://localhost:3000/#/> with `REACT_APP_ENV=local` (calls the **test** API `https://testapps.bbmpgov.in/CMDashboardAPI`). The four `.env.<env>` files must exist in the root (they are gitignored; ask the team for them — key names are in [12](12_CONFIGURATION_TESTING_AND_DEPLOYMENT.md)).

| Command | Purpose |
|---|---|
| `npm start` / `npm run start:local` | dev server, base `/` |
| `npm run start:test` | dev server, base `/CM-DashboardDP/` |
| `npm run build:test` / `build:preprod` / `build:prod` | production bundle in `build/`, base `/CM-DashboardDP/` |
| `npm run build:local` | bundle with base `/` |
| `npm run preview` | serve the last build locally |

## Documents

| # | Document | Contents |
|---|---|---|
| — | [README.md](README.md) | this index and setup |
| 01 | [01_PROJECT_OVERVIEW.md](01_PROJECT_OVERVIEW.md) | purpose, stack, features, entry points |
| 02 | [02_SYSTEM_ARCHITECTURE.md](02_SYSTEM_ARCHITECTURE.md) | layers, patterns, provider tree, dependencies |
| 03 | [03_FOLDER_STRUCTURE.md](03_FOLDER_STRUCTURE.md) | every directory and file |
| 04 | [04_COMPONENT_DOCUMENTATION.md](04_COMPONENT_DOCUMENTATION.md) | pages, components (props), hooks, relationships |
| 05 | [05_ROUTING_AND_NAVIGATION.md](05_ROUTING_AND_NAVIGATION.md) | routes, guard, navigation, permissions |
| 06 | [06_API_AND_SERVICE_DOCUMENTATION.md](06_API_AND_SERVICE_DOCUMENTATION.md) | endpoints, headers, interceptors, errors |
| 07 | [07_STATE_MANAGEMENT_AND_DATA_FLOW.md](07_STATE_MANAGEMENT_AND_DATA_FLOW.md) | contexts, queries, hook state, storage |
| 08 | [08_FORMS_AND_VALIDATIONS.md](08_FORMS_AND_VALIDATIONS.md) | every form, rule and message |
| 09 | [09_AUTHENTICATION_AND_SECURITY.md](09_AUTHENTICATION_AND_SECURITY.md) | login, token, session, authorization |
| 10 | [10_UI_STYLING_AND_CODING_STANDARDS.md](10_UI_STYLING_AND_CODING_STANDARDS.md) | CSS scoping, UI patterns, conventions |
| 11 | [11_BUSINESS_LOGIC_AND_WORKFLOWS.md](11_BUSINESS_LOGIC_AND_WORKFLOWS.md) | rules and end-to-end journeys |
| 12 | [12_CONFIGURATION_TESTING_AND_DEPLOYMENT.md](12_CONFIGURATION_TESTING_AND_DEPLOYMENT.md) | env, scripts, tests done, deployment |
| 13 | [13_ERROR_HANDLING_AND_TROUBLESHOOTING.md](13_ERROR_HANDLING_AND_TROUBLESHOOTING.md) | failures, states, debugging |
| 14 | [14_KNOWN_ISSUES_AND_OPEN_QUESTIONS.md](14_KNOWN_ISSUES_AND_OPEN_QUESTIONS.md) | debt, gaps, unknowns |

## Flowcharts (`flowcharts/`, Mermaid)

[01 Architecture](flowcharts/01_application_architecture.md) · [02 Startup](flowcharts/02_application_startup.md) · [03 Routing](flowcharts/03_routing_and_navigation.md) · [04 Authentication & session](flowcharts/04_authentication_and_session.md) · [05 API request/response](flowcharts/05_api_request_response.md) · [06 Components & state](flowcharts/06_component_relationships_and_state.md) · [07 Forms](flowcharts/07_form_validation_and_submission.md) · [08 Business workflows](flowcharts/08_business_workflows.md) · [09 Error handling](flowcharts/09_error_handling.md) · [10 Build & deployment](flowcharts/10_build_and_deployment.md)

Diagrams were checked by eye (no Mermaid validator installed).

## Reading order

- **New developer:** README → 01 → 02 → 03 → 05 → flowcharts 01–04 → 04.
- **Changing an API call:** 06 → 07 → flowchart 05 → 13.
- **Changing a screen:** 04 → 08 → 10 → 11.
- **Releasing:** 12 → flowchart 10 → 14.

## Related documentation

- Angular docs: [E:\Prajwala\document\README.md](../../document/README.md) — legacy behaviour, full API payloads, parity checklist with test status.
- Migration rule followed by this code: **reproduce the Angular behaviour exactly** (including odd behaviour) unless a deviation was approved; see [02 §6](02_SYSTEM_ARCHITECTURE.md) and [14](14_KNOWN_ISSUES_AND_OPEN_QUESTIONS.md).
