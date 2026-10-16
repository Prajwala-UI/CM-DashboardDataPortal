# 07 — Form Validation and Submission

Related: [08_FORMS_AND_VALIDATIONS.md](../08_FORMS_AND_VALIDATIONS.md)

## Common pattern

```mermaid
flowchart TD
    A["button onClick (type=button)"] --> B["clear error / info"]
    B --> C{"rule 1 ok?"}
    C -->|"no"| X["set error message; stop"]
    C -->|"yes"| D{"rules 2..n ok?"}
    D -->|"no"| X
    D -->|"yes"| E["busy = true: inputs disabled, busy label"]
    E --> F["build payload (Utils)"] --> G["cmdService call"]
    G -->|"throws"| H["busy = false; extractErrorMessage(err, fallback)"]
    G -->|"returns"| I{"success envelope?"}
    I -->|"no"| J["busy = false; res.message or fallback"]
    I -->|"yes"| K["busy = false; banner / SuccessModal / navigate / refetch"]
```

## Add Project modal

```mermaid
flowchart TD
    A["Submit"] --> B{"nameEn.trim and nameKn.trim?"}
    B -->|"no"| B1["'Please enter the project name in both English and Kannada.'"]
    B -->|"yes"| C["buildAddProjectPayload(postCode, trimmed fields, logoBase64)"]
    C --> D["cmdAddNewProject"]
    D -->|"isSuccess"| E["success banner; onAdded(); setTimeout 1500 -> onClose()"]
    D -->|"not success / error"| F["addError"]
```

## Project overview Save

```mermaid
flowchart TD
    A["Save"] --> B{"names present?"}
    B -->|"no"| B1["saveError"]
    B -->|"yes"| C{"nodal and no postCode?"}
    C -->|"yes"| C1["postCode message"]
    C -->|"no"| D["back-fill box ids"] --> E["buildUpdateProjectPayload"] --> F["cmdUpdateProject"]
    F -->|"isOverviewSuccess"| G["SuccessModal 'Project Details Updated'"] -->|"OK"| H["loadProject()"]
    F -->|"else"| I["saveError"]
```

## Registration sequence guard

```mermaid
flowchart LR
    A["Register & Log In"] --> B{"defaultPasswordVerified?"}
    B -->|"no"| B1["'Please verify the default password first.'"]
    B -->|"yes"| C{"otpVerified?"}
    C -->|"no"| C1["'Please verify your mobile number with OTP first.'"]
    C -->|"yes"| D{"password == confirm and non-empty?"}
    D -->|"no"| D1["'Password and Confirm Password must match.'"]
    D -->|"yes"| E{"designation?"}
    E -->|"no"| E1["'Please select your designation.'"]
    E -->|"yes"| F["cmdSetMobilePassword -> finalLogin"]
```

## KPI create

```mermaid
flowchart TD
    A["Create"] --> B{"name?"}
    B -->|"no"| B1["'Please enter a KPI name.'"]
    B -->|"yes"| C{"unit?"}
    C -->|"no"| C1["'Please select a unit.'"]
    C -->|"yes"| D["date = buildKpiMilestoneDate(year, quarter)<br/>target/value default '0'"] --> E["cmdAddStateKpi"]
    E -->|"success"| F["close modal, kpiSaveSuccess popup"] -->|"OK"| G["loadStateKpis()"]
    E -->|"else"| H["createKpiError"]
```
