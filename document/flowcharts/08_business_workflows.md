# 08 — Business Workflows

One diagram per workflow. Related: [11_BUSINESS_LOGIC_AND_WORKFLOWS.md](../11_BUSINESS_LOGIC_AND_WORKFLOWS.md). Function names refer to the hooks in `src/Hooks/`.

## W1 Login (returning user)

```mermaid
flowchart TD
    A["selectDepartment"] --> B["cmdGetLineDepartments"]
    B -->|"error"| B1["'Could not load designations for this department.'"]
    B -->|"ok"| C["selectDesignation"]
    C --> D{"mobile_No valid?"}
    D -->|"no"| W2["W2 registration"]
    D -->|"yes"| E["password + Log In / Enter -> loginExisting"]
    E --> F{"password and designation mobile?"}
    F -->|"no"| F1["validation message"]
    F -->|"yes"| G["finalLogin -> cmdLogin"]
    G -->|"200 + data"| H["store token + profile, activateSideMenu, navigate by role"]
    G -->|"else"| I["res.message or 'Login failed...'"]
```

## W2 Registration

```mermaid
flowchart TD
    A["verifyDefaultPassword (300 ms, client-side)"] -->|"match"| B["mobile -> sendOtp"]
    A -->|"no match"| A1["'Incorrect default password.'"]
    B --> C{"mobile valid and designation?"}
    C -->|"no"| C1["message"]
    C -->|"yes"| D["cmdSetMobilePassword (password empty)"] -->|"ok"| E["doSendOtp -> cmdSendOtp"]
    D -->|"error"| D1["'Could not register your mobile number...'"]
    E -->|"status '1'"| F["OTP -> verifyOtp -> cmdVerifyOtp"]
    E -->|"else"| E1["message"]
    F -->|"status 200"| G["passwords -> registerAndLogin"]
    F -->|"else"| F1["message"]
    G --> H["cmdSetMobilePassword (password)"] -->|"ok"| I["finalLogin (W1)"]
    H -->|"error"| H1["'Registration failed. Please try again.'"]
```

## W3 Reset password

```mermaid
flowchart TD
    A["openResetPassword"] --> B{"designation chosen?"}
    B -->|"yes"| C["fetchMobileForReset -> cmdGetMobileNoByPostcode"]
    B -->|"no"| B1["choose department + designation"] --> C
    C -->|"mobile"| D["sendResetOtp -> cmdSendOtp"]
    C -->|"none / error"| C1["hint message"]
    D -->|"status '1'"| E["verifyResetOtp -> cmdVerifyOtp"]
    E -->|"status 200"| F["new passwords -> submitResetPassword"]
    F --> G["cmdSetMobilePassword"] -->|"ok"| H["RESET_SUCCESS_FLASH, window.location.reload()"]
    G -->|"error"| G1["'Could not reset the password...'"]
    A -.-> X["backToLogin"]
```

## W4 Project list

```mermaid
flowchart TD
    A["Home mount"] --> B["useProjects: cmdAllProjectList({postCode})"]
    B -->|"fetching"| L["'Loading Projects…'"]
    B -->|"error"| E["'Could not load projects...' + Retry"]
    B -->|"isSuccess and projects[]"| C["toProjectCardVM"]
    B -->|"otherwise"| D["empty list"]
    C & D --> F{"any?"}
    F -->|"no"| G["empty message"]
    F -->|"yes"| H["Card / Table view + legend"] --> I["openProject -> /project/:id"]
```

## W5 Add project

```mermaid
flowchart LR
    A["Add Project"] --> B["AddProjectModal"] --> C["Submit: validate names"] --> D["cmdAddNewProject"]
    D -->|"success"| E["banner, refetch list, close after 1.5 s"]
    D -->|"fail"| F["error banner"]
```

## W6 Delete project

```mermaid
flowchart LR
    A["trash"] --> B["DeleteProjectModal"] -->|"Yes"| C["cmdDeleteProject(projectId, isActive false)"]
    C -->|"success"| D["close, removeProjectLocally, refetch"]
    C -->|"fail"| E["error in modal"]
```

## W7 Overview load and save

```mermaid
flowchart TD
    A["ProjectDetail mount"] --> B["loadProject: cmdGetProjectDetail"] & K["loadStateKpis: cmdGetStateKpis"]
    B -->|"success"| C["map with pick(), resolve postCode"]
    B -->|"fail"| B1["error + Retry"]
    C --> D["edit identity / banners / logo / boxes / launch"]
    D --> E["saveAs(status)"] --> F["cmdUpdateProject"]
    F -->|"success"| G["SuccessModal"] -->|"OK"| B
    F -->|"fail"| H["saveError"]
    D -->|"Cancel"| I["goHome"]
```

## W8 Change status

```mermaid
flowchart LR
    A["select Draft / Published"] --> B{"different and not saving?"}
    B -->|"yes"| C["Apply -> applyChangeStatus"] --> D["cmdChangeProjectStatus (postCode, projectStatus, 5 id aliases)"]
    D -->|"success"| E["SuccessModal 'Project Status Updated Successfully'"] -->|"OK"| F["loadProject"]
    D -->|"fail"| G["saveError"]
```

## W9 Milestone documents

```mermaid
flowchart TD
    A["Upload / Replace"] --> B["onDocSelected"] --> C{"PDF?"}
    C -->|"no"| C1["'Please choose a PDF file.'"]
    C -->|"yes"| D["FormData ProjectId + field -> cmdUploadMissionDocuments"]
    D -->|"path found"| E["docs[key] = path"] --> F["Save (W7) persists"]
    D -->|"no path"| D1["'The file uploaded, but no file path was found...'"]
    D -->|"error"| D2["'Could not upload this document...'"]
    E --> G["View PDF -> resolveDocUrl -> DocPreviewModal"]
```

## W10 State KPIs

```mermaid
flowchart TD
    A["loadStateKpis"] --> B["extractKpiArray -> toKpiRowVM"] --> C["select first KPI if none, loadDistrictData"]
    B --> D["StateKpiTable inline edits (updateKpiEntry)"]
    D -->|"Save"| E["saveAllStateKpis: Promise.all of cmdUpdateStateKpi"]
    E -->|"all ok"| F["'All KPI values saved successfully.'"] -->|"OK"| A
    E -->|"some fail"| G["summary + row saveError"]
    D -->|"Cancel"| A
    B --> H["Create: submitCreateKpi -> cmdAddStateKpi"] -->|"ok"| F
    B --> I["Edit: openEditKpiModal -> removeEditKpiRow (cmdDeleteStateKpiTargetValue for saved) -> submitEditKpi -> cmdUpdateStateKpi"] -->|"ok"| F
    B --> J["Delete: confirmDeleteKpi -> cmdDeleteStateKpi"] -->|"was selected"| K["select first, loadDistrictKpis"]
```

## W11 District KPIs

```mermaid
flowchart TD
    A["onSelectedStateKpiChange"] --> B{"row.districts not empty?"}
    B -->|"yes"| C["embedded: totals computed locally"]
    B -->|"no"| D["loadDistrictKpis -> cmdGetProjectKpiDistrict"]
    C & D --> E["edit values (updateDistrictValue)"]
    E -->|"Save"| F["saveDistrictKpis -> cmdUpdateStateKpi"]
    F -->|"ok"| G["SuccessModal"] -->|"OK"| H["loadStateKpis"]
    F -->|"fail"| I["districtSaveError"]
    E -->|"Cancel"| A
```

## W12 Webpage Output preview

```mermaid
flowchart LR
    A["viewWebpageOutput"] --> B["open WebpageOutputModal"]
    A --> C["cmdOutputPage (logged only)"]
    B --> D["EN / KN toggle"]
    B --> E["district grid: sortDistricts, KPI select"]
    B --> F["tile / table KPI view"]
    B --> G["Mission Documents flyout -> openDocPreview"]
```

## W13 Nodal dashboard

```mermaid
flowchart TD
    A["NodalDashboard mount"] --> B["useNodalList: cmdListOfAllUsersAndProjectsList({admin_Dept_Code: ''})"]
    B -->|"fail"| B1["error + Retry"]
    B -->|"success"| C["summary + rows, page 1"]
    C --> D["filter / search / sort -> page 1"] --> E["slice 10 per page"] --> F["table + pagination"]
    F --> G["openProject -> /NodalProjectDetailspage/:id"]
```

## W14 User Management

```mermaid
flowchart LR
    A["NodalUsermgt mount"] --> B["useNodalList({admin_Dept_Code: DEPT_CODE})"] --> C["map res.data"] --> D["render null"]
```
