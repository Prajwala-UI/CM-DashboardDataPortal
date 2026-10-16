# 06 — Component Relationships and State Flow

Related: [04_COMPONENT_DOCUMENTATION.md](../04_COMPONENT_DOCUMENTATION.md), [07_STATE_MANAGEMENT_AND_DATA_FLOW.md](../07_STATE_MANAGEMENT_AND_DATA_FLOW.md)

## Login

```mermaid
flowchart TD
    LP["Pages/Login.js"] -->|"useLoginLogic(activateSideMenu)"| LO["login object: s, set, actions"]
    LP --> LF["LoginForm (login)"]
    LP --> RF["ResetPasswordForm (login)"]
    LF & RF --> DD["DeptDesignationFields (login)"]
    DD --> SS1["SearchableSelect: departments"]
    DD --> SS2["SearchableSelect: designations"]
    LO -.-> LF & RF & DD
```

## Home

```mermaid
flowchart TD
    H["Pages/Home.js"] -->|"useProjects(postCode, deptName)"| Q[("TanStack Query ['projects', postCode]")]
    H --> PC["ProjectCard x n"]
    H --> PT["ProjectTable"]
    H --> AM["AddProjectModal (own state)"]
    H --> DM["DeleteProjectModal"]
    H --> SM["LoadingMessage / ErrorMessage"]
    AM -->|"onAdded -> refetch"| Q
    DM -->|"onDeleted -> removeProjectLocally + refetch"| Q
```

## Project detail

```mermaid
flowchart TD
    PDP["Pages/ProjectDetail.js (variant)"] -->|"useProjectDetail(id, variant)"| D["detail object"]
    PDP -->|"useStateKpis(id, detail.postCode)"| K["kpis object"]
    PDP --> DH["DetailHeader (detail)"]
    PDP --> OT["OverviewTab (detail)"]
    OT --> IS["IdentitySection"] & TB["TopBoxesSection"] & LD["LaunchDetailsSection"] & MD["MilestoneDocsSection"]
    PDP --> KT["KpisTab (kpis, isNodal)"]
    KT --> ST["StateKpiTable"] & DT["DistrictKpiTable"]
    PDP --> CK["CreateKpiModal"] & EK["EditKpiModal"] & DK["DeleteKpiModal"]
    PDP --> SU["SuccessModal x3"]
    PDP --> WO["WebpageOutputModal (detail, kpis, selectedDistrict)"]
    PDP --> DP["DocPreviewModal"]
    D -->|"postCode"| K
```

## Nodal

```mermaid
flowchart TD
    N["Pages/NodalDashboard.js"] -->|"useNodalList dashboard, ''"| QN[("['nodalList','dashboard','']")]
    N --> SC["NodalStatCards"]
    N --> NT["NodalProjectsTable"]
    N --> PG["Pagination"]
    N --> LS["local: search, filter, sort, page"]
    U["Pages/NodalUsermgt.js"] -->|"useNodalList usermgt, DEPT_CODE"| QU[("['nodalList','usermgt',code]")]
    U --> NULL["returns null"]
```

## District value ownership

```mermaid
flowchart LR
    SK["stateKpis[] (useStateKpis)"] --> R["selected row.districts"]
    R -->|"districtSource = embedded"| DR["districtRows (derived)"]
    API["Get_Project_KPI_District"] -->|"districtSource = api"| DA["districtApiRows"] --> DR
    DR -->|"updateDistrictValue"| SK
    DR -->|"updateDistrictValue"| DA
```
