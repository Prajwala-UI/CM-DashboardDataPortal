# 08 — Forms and Validations

Diagram: [flowcharts/07_form_validation_and_submission.md](flowcharts/07_form_validation_and_submission.md).

**Approach:** controlled inputs (`value` + `onChange`), manual validation inside the action function, first failing rule sets one message and stops (no request). No form library. Messages are copied verbatim from Angular (including spelling). Forms use `<form onSubmit={e => e.preventDefault()}>` and `type="button"` buttons so Enter never reloads the page. [V]

## 1. Login view (`src/Components/Login/LoginForm.js`, logic `src/Hooks/useLoginLogic.js`)

| Field | Control | Rule | Message |
|---|---|---|---|
| Department | `SearchableSelect` | must be chosen before Designation is enabled | (placeholder "Select department first") |
| Designation | `SearchableSelect` | — | — |
| Default password (new user) | input `type` = password/text; Enter verifies | required; equals `REACT_APP_DEFAULT_PASSWORD` after 300 ms | "Please enter the default password." / "Incorrect default password." |
| Mobile (new user) | `type="tel"`, `maxLength=10`, disabled after OTP sent | `/^[6-9]\d{9}$/` | "Please enter a valid 10-digit mobile number." |
| (designation) | — | selected | "Please select your designation." |
| OTP | text | trimmed length ≥ 4 | "Please enter the OTP sent to your mobile." |
| Password / Confirm (new) | password inputs | default pwd verified → OTP verified → non-empty and equal | "Please verify the default password first." / "Please verify your mobile number with OTP first." / "Password and Confirm Password must match." |
| Password (returning) | Enter logs in | required | "Please enter your password." |

Info messages: "Default password verified. Please complete your registration.", "Registering your mobile number...", "OTP is sending...", server text or "OTP sent to your mobile number.", server text or "Mobile number verified.". The info box is hidden whenever an error is shown. Show/Hide toggles the type of all password fields together (`showpwd`). [V]

## 2. Reset view (`ResetPasswordForm.js`)

| Rule | Message |
|---|---|
| registered mobile must exist before Send OTP | "No registered mobile number found. Please pick a different designation." |
| OTP ≥ 4 | "Please enter the OTP sent to your mobile." |
| OTP verified | "Please verify your mobile number with OTP first." |
| new password required | "Please enter a new password." |
| passwords equal | "Password and Confirm Password must match." |
| postCode and mobile present | "Missing postcode or mobile number. Please re-select your designation." |

Only errors are shown in this view. Success stores the flash message and reloads. [V]

## 3. Add Project (`src/Components/Home/AddProjectModal.js`)

| Field | Rule |
|---|---|
| Name (English), ಯೋಜನೆಯ ಹೆಸರು (ಕನ್ನಡ) | both non-blank after trim → else "Please enter the project name in both English and Kannada." |
| Taglines | optional, trimmed |
| Logo | optional image (`accept="image/*"`), stored as base64 without `data:` prefix |

While submitting and after success all inputs/buttons are disabled; overlay/× cannot close while submitting. [V] [T: UI-NOAPI — validation message, no request sent]

## 4. Project overview (`useProjectDetail.saveAs` :294)

| Rule | Message |
|---|---|
| `nameEn` and `nameKn` non-blank | "Please enter the project name in both English and Kannada." |
| nodal variant: project postCode present | "This project has no PostCode on record, so it cannot be saved. Please contact the administrator." |

Not enforced (as Angular): "About … 30 Words", banner size, date order. Dates use `<input type="date">` (value `yyyy-MM-dd` or `null` when cleared). [V]

## 5. Change Status (`applyChangeStatus` :354)

Apply disabled unless a value is chosen, it differs from the current status, and nothing is saving. Nodal: "This project has no PostCode on record, so its status cannot be changed. Please contact the administrator." [V]

## 6. Milestone documents (`onDocSelected` :221)

PDF if `file.type === 'application/pdf'` or name ends `.pdf`, else "Please choose a PDF file.". Uploads immediately; the stored path is saved by the overview **Save**. [V]

## 7. KPI forms (`src/Hooks/useStateKpis.js`)

| Form | Rule | Message |
|---|---|---|
| Create | name (trimmed) required | "Please enter a KPI name." |
| Create | unit required | "Please select a unit." |
| Create | target/value blank → `'0'`; date = `"year, quarter"` or `''` | — |
| Edit | name required | "Please enter a KPI name." |
| Edit | quarter options exclude quarters used by other columns of the same year | — |
| Edit | year change resets quarter and date | — |
| Edit | cannot remove the last column | (button hidden) |

Units: Count, ₹ Cr, ₹ Lakh, %, Km, Kg, Litres, Date. Years: 2026-2027, 2027-2028. Quarter labels "Q1 Untill 30.06.YYYY" … "Q4 Untill 31.03.YYYY+1". [V]

## 8. Submission pattern

```
validate → set busy flag (inputs disabled, label "Saving…/Creating…/Deleting…")
→ call service → clear busy flag
→ HTTP error: extractErrorMessage(err, fallback)
→ 2xx not success: res.message (or formatApiResult) or fallback
→ success: banner / success modal / navigation / reload
```
