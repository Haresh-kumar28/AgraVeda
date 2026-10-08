# 🏥 AgraVeda

> **Predictive Emergency Department Load & Patient Flow Management System**

AgraVeda is a **data-driven emergency department decision-support platform** designed to help healthcare teams anticipate patient load, identify operational pressure, detect patient-flow bottlenecks, and make informed resource-allocation decisions.

The platform transforms emergency-department operational data into **forecasts, pressure indicators, bottleneck insights, recommendations, resource views, and what-if scenarios** through a unified dashboard.

> **AgraVeda is a decision-support system and does not replace clinical judgment or medical professionals.**

---

## 🚨 Problem Statement

Emergency Departments (EDs) operate in highly dynamic environments where patient arrivals, waiting times, bed occupancy, staffing availability, and treatment demand can change rapidly.

Unexpected increases in patient volume can lead to:

- 🧑‍⚕️ Staff overload
- 🛏️ Bed shortages
- ⏳ Increased waiting times
- 🚑 Patient-flow congestion
- 🚧 Operational bottlenecks
- 📉 Inefficient resource allocation
- ⚠️ Reactive rather than proactive decision-making

Traditional dashboards often show **what is happening now**, but hospital administrators and emergency-department teams also need to understand:

> **What is likely to happen next, where the pressure may occur, and what action could be taken?**

AgraVeda addresses this gap by combining **forecasting, patient-flow analysis, pressure assessment, bottleneck detection, resource planning, and decision support** in a single interface.

---

# 🎯 Objective

The primary objective of AgraVeda is to help emergency departments move from:

```text
Reactive Management
       ↓
     to
Proactive Decision Support
```

The system analyzes available operational data to provide:

- 📈 Demand/load forecasts
- 🚨 Emergency pressure indicators
- 🚧 Bottleneck identification
- 🩺 Patient-flow visibility
- 👥 Resource planning insights
- 🎯 Actionable recommendations
- 🔄 What-if scenario analysis
- 🔍 Data-quality assessment

---

# 💡 How AgraVeda Works

```text
        Emergency Department Data
                    │
                    ▼
          ┌──────────────────┐
          │ Data Quality      │
          │ Assessment        │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ Load & Patient   │
          │ Flow Analysis    │
          └────────┬─────────┘
                   │
          ┌────────┴─────────┐
          ▼                  ▼
   Forecast Engine     Pressure Engine
          │                  │
          └────────┬─────────┘
                   ▼
          ┌──────────────────┐
          │ Bottleneck       │
          │ Detection        │
          └────────┬─────────┘
                   │
          ┌────────┴─────────┐
          ▼                  ▼
 Recommendation Engine   Resource Analysis
          │                  │
          └────────┬─────────┘
                   ▼
          ┌──────────────────┐
          │ Decision Support │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ What-If          │
          │ Simulation       │
          └──────────────────┘
```

---

# 🚀 Key Features

## 📊 1. Command Center

The central dashboard provides an overview of the emergency department's operational state.

It brings together important indicators such as:

- Current patient load
- Operational pressure
- Waiting trends
- Occupancy indicators
- Forecast information
- Resource status
- Critical alerts/insights

---

## 🔮 2. Emergency Load Forecasting

The forecasting module analyzes available historical patterns to estimate upcoming emergency-department demand.

It helps answer:

> **"What could the patient load look like in the upcoming period?"**

The forecast can be used to identify periods where additional operational preparation may be required.

---

## 🚨 3. Pressure Analysis

AgraVeda evaluates operational indicators to identify increasing emergency-department pressure.

Pressure analysis helps identify situations where:

- Patient volume is increasing
- Waiting times are rising
- Capacity is becoming constrained
- Patient flow is slowing
- Resource demand may exceed available capacity

---

## 🚧 4. Bottleneck Detection

Patient flow can become constrained at different stages of emergency care.

AgraVeda includes a bottleneck analysis engine that helps identify potential operational constraints.

Examples include:

- Registration pressure
- Waiting-area congestion
- Treatment capacity constraints
- Bed availability pressure
- Delayed patient movement

---

## 🩺 5. Patient Flow Analysis

AgraVeda provides a visual representation of the patient journey through the emergency department.

```text
Arrival
   ↓
Triage
   ↓
Waiting
   ↓
Assessment
   ↓
Treatment
   ↓
Observation
   ↓
Discharge / Admission
```

The purpose is to help identify where patient movement may slow down and where operational pressure can accumulate.

---

## 👥 6. Resource Planning

The platform provides resource-oriented information to support operational decisions.

Potential resources include:

- Doctors
- Nurses
- Beds
- Treatment capacity
- Emergency-department capacity

The goal is not to automatically make clinical decisions, but to provide information that can help administrators and operational teams evaluate possible resource requirements.

---

# 🎯 7. Recommendation Engine

AgraVeda converts analytical signals into operational recommendations.

For example:

```text
High Patient Load
        +
High Waiting Time
        +
Low Available Capacity
        ↓
Potential Operational Pressure
        ↓
Recommended Resource Review
```

Recommendations are intended to help teams prioritize areas requiring attention.

---

# 🔄 8. What-If Simulator

One of AgraVeda's important decision-support features is the **What-If Simulator**.

It allows users to explore hypothetical scenarios such as:

```text
What if patient arrivals increase?

What if additional beds become available?

What if staffing capacity changes?

What if emergency demand decreases?

What if operational capacity is increased?
```

The simulator helps users compare possible scenarios before making operational decisions.

---

# 🔍 9. Data Quality Analysis

Real-world healthcare data can be:

- incomplete
- noisy
- inconsistent
- sparse
- irregular

AgraVeda includes a data-quality analysis module to identify potential issues that may affect the reliability of downstream analysis.

This is important because:

> **Poor-quality input data can produce unreliable operational insights.**

---

# 📋 10. Decision Briefs

Instead of forcing users to interpret every chart individually, AgraVeda provides concise decision-oriented summaries.

The goal is to answer:

### What is happening?

Current operational condition.

### Why is it happening?

Important contributing indicators.

### What could happen next?

Forecast and pressure signals.

### What should be considered?

Potential operational actions or resource reviews.

---

# 🧠 Sparse & Noisy Data Strategy

Emergency-department datasets may not always contain enough clean historical data for sophisticated machine-learning models.

AgraVeda therefore follows a **data-aware and explainable approach**.

The system can combine:

- Historical trends
- Aggregated operational indicators
- Forecasting logic
- Rule-based/heuristic reasoning
- Data-quality checks
- Pressure calculations
- Bottleneck analysis
- Scenario simulation

This allows the platform to remain useful even when the available dataset is limited or imperfect.

---

# 🏗️ System Architecture

```text
┌─────────────────────────────────────────┐
│             AgraVeda UI                 │
│          React + TypeScript             │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│          Dashboard Modules              │
│                                         │
│ Command Center                          │
│ Patient Flow                            │
│ Forecast                                │
│ Decisions                               │
│ Resources                               │
│ Scenarios                               │
│ Data Quality                            │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│            Analysis Engines             │
│                                         │
│ Forecast Engine                         │
│ Pressure Engine                         │
│ Bottleneck Engine                       │
│ Recommendation Engine                   │
│ Data Quality Engine                     │
│ What-If Simulator                       │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│          Decision Support Layer         │
│                                         │
│ Forecasts                               │
│ Risk / Pressure Signals                 │
│ Bottlenecks                             │
│ Recommendations                         │
│ Resource Insights                       │
│ Scenario Outcomes                       │
└─────────────────────────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| ⚛️ React | User interface |
| 📘 TypeScript | Type-safe application development |
| ⚡ Vite | Development and build tooling |
| 🎨 CSS | UI styling |
| 📊 Recharts | Data visualization |
| 🧩 Lucide React | UI icons |

## Application Logic

AgraVeda contains dedicated analytical engines for:

- Forecasting
- Pressure analysis
- Bottleneck detection
- Recommendation generation
- Data-quality analysis
- What-if simulation

## Data

The current project uses **structured/synthetic emergency-department data** for demonstrating the analytical workflow and dashboard capabilities.

---

# 📂 Project Structure

```text
AgraVeda/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── pages/
│   │   ├── BottleneckPanel.tsx
│   │   ├── DataQualityPanel.tsx
│   │   ├── DecisionBrief.tsx
│   │   ├── ForecastChart.tsx
│   │   ├── ForecastDrivers.tsx
│   │   ├── Header.tsx
│   │   ├── OccupancyProjectionChart.tsx
│   │   ├── PatientFlowDiagram.tsx
│   │   ├── PressureIndicator.tsx
│   │   ├── RecommendationPanel.tsx
│   │   ├── ResourceTable.tsx
│   │   ├── Sidebar.tsx
│   │   ├── StatusCards.tsx
│   │   ├── WaitingTrendChart.tsx
│   │   └── WhatIfSimulator.tsx
│   │
│   ├── data/
│   │
│   ├── engines/
│   │   ├── bottleneckEngine.ts
│   │   ├── dataQualityEngine.ts
│   │   ├── forecastEngine.ts
│   │   ├── pressureEngine.ts
│   │   ├── recommendationEngine.ts
│   │   └── whatIfSimulator.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
│
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

---

# ⚙️ Installation & Setup

## Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git

Check your versions:

```bash
node --version
npm --version
git --version
```

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Haresh-kumar28/AgraVeda.git
```

---

## 2️⃣ Enter the Project Directory

```bash
cd AgraVeda
```

---

## 3️⃣ Install Dependencies

```bash
npm install
```

---

## 4️⃣ Start Development Server

```bash
npm run dev
```

Vite will provide a local development URL, typically:

```text
http://localhost:5173
```

Open that URL in your browser.

---

# 🧪 Available Commands

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

# 📊 Main Dashboard Modules

| Module | Purpose |
|---|---|
| 🏠 Command Center | Overall ED operational overview |
| 🩺 Patient Flow | Visualize patient movement |
| 🔮 Forecast | Analyze upcoming demand |
| 🚨 Pressure | Identify operational pressure |
| 🚧 Bottlenecks | Identify flow constraints |
| 👥 Resources | Review resource conditions |
| 🎯 Decisions | Generate decision-support insights |
| 🔄 Scenarios | Explore operational scenarios |
| 🧪 What-If | Simulate possible changes |
| 🔍 Data Quality | Assess input-data quality |

---

# 🔬 Core Analytical Engines

## Forecast Engine

Analyzes historical patterns and generates projected emergency-department load.

```text
Historical Data
      ↓
Trend Analysis
      ↓
Forecast
      ↓
Expected Load
```

---

## Pressure Engine

Evaluates operational indicators to estimate emergency-department pressure.

```text
Patient Load
     +
Waiting Time
     +
Capacity
     +
Occupancy
     ↓
Pressure Assessment
```

---

## Bottleneck Engine

Identifies areas where patient flow may become constrained.

```text
Patient Flow
     ↓
Stage Analysis
     ↓
Capacity Comparison
     ↓
Bottleneck Detection
```

---

## Recommendation Engine

Converts analytical results into actionable operational suggestions.

```text
Forecast
   +
Pressure
   +
Bottlenecks
   +
Resources
      ↓
Recommendations
```

---

## What-If Simulator

Allows users to test hypothetical operational conditions.

```text
Current State
      ↓
Change Scenario
      ↓
Simulation
      ↓
Compare Outcomes
      ↓
Decision Support
```

---

# 🏥 Example Use Case

Imagine an emergency department expects a significant increase in patient arrivals.

AgraVeda can follow a workflow such as:

```text
Expected Patient Increase
          ↓
Forecast Engine
          ↓
Higher Expected Load
          ↓
Pressure Analysis
          ↓
Potential Capacity Pressure
          ↓
Bottleneck Analysis
          ↓
Identify Critical Stage
          ↓
Recommendation Engine
          ↓
Resource Review
          ↓
What-If Simulation
          ↓
Compare Possible Actions
```

This gives operational teams a structured way to evaluate the situation **before pressure becomes critical**.

---

# 🎯 Target Users

AgraVeda is primarily designed for:

- 🏥 Hospital administrators
- 🚑 Emergency-department operations teams
- 👨‍⚕️ Healthcare management teams
- 📊 Hospital data/analytics teams
- 🏢 Healthcare organizations
- 🎓 Researchers and students working on healthcare analytics

---

# 🌟 Key Advantages

### 1. Proactive Instead of Reactive

Helps identify potential future pressure rather than only displaying current conditions.

### 2. Unified Decision Support

Combines multiple operational signals into one dashboard.

### 3. Explainable

Insights can be connected to operational indicators instead of presenting unexplained predictions.

### 4. Scenario-Based Planning

The What-If Simulator allows users to compare hypothetical situations.

### 5. Data-Aware

Includes data-quality analysis to highlight limitations in the underlying information.

### 6. Modular Architecture

Separate analysis engines make the system easier to extend.

---

# 🔐 Data & Privacy

The current demonstration version uses **synthetic/structured data**.

No real patient medical records are required for the current demonstration.

For a production deployment, appropriate healthcare data-security, privacy, access-control, audit, and regulatory requirements would need to be implemented.

---

# ⚠️ Important Disclaimer

AgraVeda is a **decision-support and demonstration system**.

It is **not a medical diagnostic system** and should not be used as a replacement for:

- Doctors
- Nurses
- Clinical staff
- Hospital administrators
- Professional medical judgment

Any operational recommendation should be reviewed by qualified personnel before implementation.

---

# 🔮 Future Roadmap

## Phase 1 — Current

- [x] Emergency-department dashboard
- [x] Patient-flow visualization
- [x] Forecasting
- [x] Pressure analysis
- [x] Bottleneck detection
- [x] Recommendation engine
- [x] Data-quality analysis
- [x] Resource analysis
- [x] What-if simulation
- [x] Decision-support views

## Phase 2 — Planned

- [ ] Real hospital dataset integration
- [ ] Real-time data ingestion
- [ ] Advanced ML forecasting
- [ ] Model-performance monitoring
- [ ] Real-time alerts
- [ ] User authentication
- [ ] Role-based access control
- [ ] Historical analytics
- [ ] Advanced resource optimization

## Phase 3 — Future

- [ ] EHR/HIS integration
- [ ] Hospital-wide deployment
- [ ] Multi-department support
- [ ] Cloud deployment
- [ ] Mobile dashboard
- [ ] Automated operational alerts
- [ ] Advanced predictive analytics

---

# 🏆 Project Vision

> **Help emergency departments anticipate operational pressure before it becomes a crisis.**

AgraVeda aims to transform emergency-department operations from:

**Data → Dashboard**

into:

**Data → Insight → Forecast → Decision → Action**

---

# 📈 Impact

AgraVeda aims to help emergency departments:

- Reduce operational uncertainty
- Anticipate demand
- Identify bottlenecks earlier
- Understand patient-flow pressure
- Improve resource planning
- Compare possible interventions
- Support faster operational decisions

The long-term vision is to create a scalable intelligent decision-support layer for emergency healthcare operations.

---

# 👨‍💻 Project Information

**Project Name:** AgraVeda

**Former Name:** EdPulse

**Domain:** Healthcare Technology / Health Analytics

**Category:** Emergency Department Decision Support

**Core Focus:** Predictive Emergency Department Load & Patient Flow Management

**Repository:** [AgraVeda](https://github.com/Haresh-kumar28/AgraVeda)

---

# 👥 Contributors

Developed as a healthcare technology and intelligent decision-support project.

**Developer:** Haresh Kumar

---

# 📄 License

This project is currently intended for:

- Educational purposes
- Research
- Hackathons
- Demonstrations
- Prototype development

Add an explicit open-source license if you intend to distribute the code under one.

---

# ⭐ Support the Project

If you find AgraVeda interesting:

⭐ Star the repository  
🍴 Fork the project  
🐛 Report issues  
💡 Suggest improvements  
🤝 Contribute to future development

---

## 🚀 AgraVeda

**Predict. Understand. Prepare. Act.**

> *Turning emergency-department data into actionable operational intelligence.*