# AgraVeda — Predictive Emergency Department Load & Patient Flow Management System

AgraVeda is an enterprise-grade operational decision-support system designed to help hospital emergency departments anticipate operational pressure, understand patient-flow constraints, and compare resource-planning interventions before capacity pressure becomes a crisis.

> **Operational Decision Support Notice:**
> AgraVeda is strictly an operational workflow and resource planning prototype. It does not perform clinical triage, make medical diagnoses, or prescribe treatments. Clinical teams remain solely responsible for patient care decisions.

---

## 1. Core Value Proposition

Emergency departments frequently operate near or above surge thresholds. When delays occur, they cascade through upstream stages—increasing wait queue times and leading to bed block. AgraVeda provides:

1. **6-Hour Demand Forecasting:** Models arrival trajectories and hourly peaks using time-of-day cycles and situational surge multipliers.
2. **Seven-Stage Patient Flow Visibility:** Tracks aggregate progression across:
   - Arrival & Registration
   - Triage & Acuity Classification
   - Waiting Queue Buffer
   - Physician Initial Assessment
   - Diagnostics & Laboratory
   - Active Treatment Beds
   - Disposition & Handover
3. **Transparent Operational Pressure Signals:** Explainable 0–100 pressure score derived from projected bed occupancy, waiting queue buildup, and physician/nurse ratios.
4. **Deterministic What-If Simulator:** Real-time parameter interventions (e.g. on-call nurses, supplemental observation beds, external demand surge) comparing baseline vs. simulated metrics without mutating underlying data.
5. **Actionable Decision Briefs:** Structured around: *What is happening? Why? What may happen next? What should the team consider?*
6. **Data Quality & Trustworthiness:** Automated checks for record missingness, timestamp skew, and outliers with safe fallback heuristics.

---

## 2. Authentication & Role-Based Access Control (RBAC)

AgraVeda includes a full authentication suite with route gating:
- `/` — Public Editorial Landing Page
- `/login` — Sign In with email, password, and quick-access demo personas
- `/signup` — Institutional Access Request with requested role specification
- `/forgot-password` — Password Recovery flow with honest infrastructure status
- `/access-denied` — 403 Forbidden state with role-level explanations
- `/app` — Authenticated workspace shell

### Role Matrix

| Operational Role | Overview | Forecasts & Inputs | Patient Flow | Resources | Scenarios | What-If | Decision Briefs | Data Quality | Staff Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Hospital Administrator** | Full | Read/Write | Full | Full | Full | Full | Read/Ack | Full | Full |
| **ED Manager** | Full | Read/Write | Full | Full | Full | Full | Read/Ack | Full | Restricted |
| **Doctor / Clinical Staff** | Full | Read-Only | Full | Full | Full | Full | Read | Read-Only | Restricted |
| **Nurse / Operations Staff**| Full | Read/Write | Full | Full | Full | Read-Only | Read | Read-Only | Restricted |
| **Analyst / Read-Only** | Full | Read-Only | Full | Full | Full | Full | Read | Full | Restricted |

> **Security Governance Note:**
> The browser-selected role on signup represents a *requested* role, not proof of authorization. In this demonstration environment, an in-memory `AuthAdapter` provides seed personas for reviewers. In a live deployment, role provisioning requires hospital Single Sign-On (SAML 2.0 / OIDC), credential verification, and server-side session cookies.

---

## 3. Seed Demo Personas

When testing the application at `/login`, reviewers can use pre-seeded accounts:
- **Hospital Administrator:** `Dr. Evelyn Vance, MD, MHA` (`evelyn.vance@metrohealth.demo`)
- **ED Manager:** `Marcus Chen, RN, BSN` (`marcus.chen@metrohealth.demo`)
- **Doctor / Clinical Staff:** `Dr. Sarah Jenkins, MD, FACEP` (`sarah.jenkins@metrohealth.demo`)
- **Nurse / Operations Staff:** `Priya Patel, BSN, CEN` (`priya.patel@metrohealth.demo`)
- **Analyst (Read-Only):** `Jordan Miller, MSc` (`jordan.miller@metrohealth.demo`)

Reviewers can also switch roles on the fly using the lens selector in the application topbar or sidebar.

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node v24)
- npm `v9+` or `v10+`

### Installation
```bash
# Clone the repository
git clone https://github.com/Haresh-kumar28/AgraVeda.git
cd AgraVeda

# Install dependencies
npm install

# Run the development server
npm run dev
```

### Production Build & Linting
```bash
# Type check and production bundle
npm run build

# Run fast code quality checks
npm run lint
```

---

## 5. Technical Architecture

- **Framework:** React 19 + TypeScript + Vite
- **Styling & Tokens:** Tailwind CSS v4 + Semantic CSS Variables (`--color-primary`, `--color-canvas`, `--color-text`, `--color-divider`, etc.)
- **Data Visualization:** Recharts (accessible SVG area charts, composed charts, reference lines)
- **Icons:** Lucide React
- **Analytical Engines:**
  - `forecastEngine.ts`: Hybrid time-series heuristic with temporal holdout validation (MAE, RMSE).
  - `pressureEngine.ts`: Multi-factor operational scoring (occupancy, wait time, queue depth).
  - `bottleneckEngine.ts`: Resource constraint evaluation across beds, nurses, doctors, and diagnostic imaging.
  - `recommendationEngine.ts`: Explainable decision briefs with severity prioritizing and alert fatigue suppression.
  - `whatIfSimulator.ts`: Deterministic counterfactual sensitivity engine.
  - `dataQualityEngine.ts`: Missing value detection, outlier bounds, and automated fallback logic.

---

## 6. What Is Working vs. Production Prerequisites

### Currently Working (Demo Implementation)
- Complete Public Landing Page inspired by clean healthcare editorial composition.
- Complete public authentication flow (`/login`, `/signup`, `/forgot-password`, `/access-denied`).
- Gated workspace navigation with role capability checks (`can(role, capability)`).
- Hospital Administration view with staff provisioning and role assignment.
- All 8 operational modules functioning on synthetic 14-day emergency department data.
- Live What-If intervention simulation and parameter provenance tracking.

### Production Hardening Requirements
Before deploying AgraVeda in a production hospital setting:
1. **Server-Side Authentication:** Replace `AuthAdapter` with an authenticated backend API (Node/Go/Python) issuing signed HTTP-only `SameSite=Strict` cookies with CSRF tokens.
2. **Enterprise Identity:** Integrate hospital SSO (SAML 2.0 / OIDC) via Okta, Microsoft Entra ID, or PingFederate.
3. **EHR Interface Engine:** Connect live HL7 v2 ADT or FHIR R4 interfaces for real-time arrival and bed occupancy events.
4. **Data Privacy & Compliance:** Execute Business Associate Agreements (BAAs), conduct HIPAA/HITECH security assessments, and configure audit logging.
5. **Transactional Email:** Connect Amazon SES or SendGrid with signed, short-lived reset tokens for password recovery.
6. **Clinical Validation:** Prospective observational validation study with emergency medicine department leadership.

---

## 7. License

Proprietary prototype · Designed for emergency department operational research and enterprise demonstration.