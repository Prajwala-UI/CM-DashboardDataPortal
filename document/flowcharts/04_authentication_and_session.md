# 04 — Authentication and Session Management

Related: [09_AUTHENTICATION_AND_SECURITY.md](../09_AUTHENTICATION_AND_SECURITY.md). Registration and reset details: [08_business_workflows.md](08_business_workflows.md).

## Login and session start

```mermaid
flowchart TD
    A["Login mount"] --> B["cmdGenerateToken (env credentials)"]
    B -->|"ok"| C["tokenRef = access_token<br/>sessionStorage.CMD_API_TOKEN"]
    B -->|"error"| B1["'Unable to connect to the server...'"]
    C --> D["departments -> designations"]
    D --> E{"designation mobile valid?"}
    E -->|"yes"| F["password -> loginExisting"]
    E -->|"no"| G["registration flow -> registerAndLogin"]
    F & G --> H["finalLogin: cmdLogin(mobile, password)"]
    H -->|"status 200 and data"| I["sessionStorage.LOGIN_TOKEN = tokenRef<br/>localStorage profile keys"]
    H -->|"else"| H1["error message"]
    I --> J["AuthContext.activateSideMenu()"]
    J --> K["AppShell shows navbar + role sidebar"]
    K --> L{"ROLE == NODAL?"}
    L -->|"yes"| M["/NodalDashboard"]
    L -->|"no"| N["/home"]
```

## Session end

```mermaid
flowchart TD
    subgraph Triggers
        T1["Logout link"]
        T2["HTTP 401 (axios response interceptor)"]
        T3["30 min no mousemove/keydown/click/scroll"]
        T4["Protected route without token"]
    end
    T1 & T2 --> L["AuthContext.adminLogout()"]
    L --> L1["flag false; remove LOGIN_TOKEN, PAGE_RELOADED<br/>localStorage.clear(); sessionStorage.clear()"] --> L2["navigate /"]
    T3 --> I1["remove LOGIN_TOKEN, REFERENCE_ID, myemail_id"] --> I2["alert 'No User Activity Found...'"] --> I3["window.location.reload()"] --> T4
    T4 --> P1["alert 'Please Login'"] --> P2["navigate / and flag false"]
```

## Every request

```mermaid
sequenceDiagram
    participant H as Hook
    participant S as cmdService
    participant X as axiosInstance
    participant B as Backend
    H->>S: cmdX(payload, getCmdToken())
    S->>X: headers Content-Type + Authorization Bearer token
    X->>X: add Authorisation = "bearer : " + LOGIN_TOKEN
    X->>B: request
    B-->>X: response
    alt 401
        X->>X: unauthorizedHandler() = adminLogout
    end
    X-->>H: data or rejected error
```
