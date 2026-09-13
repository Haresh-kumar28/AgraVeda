# 🌱 AgraVeda

> **AI-powered personalized learning platform for smarter, adaptive, and student-centric education.**

AgraVeda is an intelligent educational platform designed to help students understand their learning progress, identify areas that need improvement, and receive personalized learning insights.

The platform combines an interactive web interface with data-driven analysis to provide students with a more structured and personalized learning experience.

---

## 🚀 Key Features

* 📊 **Learning Dashboard** — View important learning and performance insights in one place.
* 🎯 **Personalized Recommendations** — Generate recommendations based on learning data.
* 📈 **Performance Analysis** — Analyze student progress and learning trends.
* 🔍 **Data Quality Analysis** — Identify issues and inconsistencies in learning data.
* 🤖 **Intelligent Insights** — Convert learning data into meaningful insights.
* 🔮 **Forecasting** — Analyze trends and generate future performance projections.
* 🧩 **What-If Simulator** — Explore possible outcomes under different scenarios.
* 📋 **Decision Support** — Present actionable information to support better academic decisions.
* 💻 **Modern Web Interface** — Responsive dashboard-based interface built with React and TypeScript.

---

## 🎯 Problem

Traditional learning platforms often provide students with large amounts of educational content but limited personalized guidance.

Students may struggle to answer questions such as:

* What topics do I need to improve?
* How is my performance changing?
* Where should I focus next?
* What could happen if my current learning pattern continues?
* Which learning strategy may work better for me?

**AgraVeda aims to bridge this gap by transforming learning data into understandable insights and actionable recommendations.**

---

## 💡 Our Approach

AgraVeda follows a simple data-driven workflow:

```text
Student / Learning Data
          ↓
     Data Analysis
          ↓
   Performance Insights
          ↓
    Trend & Forecast
          ↓
 Personalized Recommendations
          ↓
     Better Decisions
```

---

## 🏗️ System Architecture

```text
┌─────────────────────────────┐
│       User Interface        │
│     React + TypeScript      │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│      Dashboard Modules      │
│ Performance • Decisions     │
│ Forecast • Scenarios        │
│ Resources • Data Quality    │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│       Analysis Engines      │
│                             │
│ • Forecast Engine           │
│ • Recommendation Engine     │
│ • Bottleneck Engine         │
│ • Pressure Engine           │
│ • Data Quality Engine       │
│ • What-If Simulator         │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│      Learning Insights      │
│ Recommendations & Forecasts │
└─────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* **React**
* **TypeScript**
* **Vite**
* **CSS**

### Application Logic

AgraVeda contains dedicated analysis engines for:

* Forecasting
* Recommendations
* Bottleneck detection
* Data quality analysis
* Pressure analysis
* What-if simulation

### Data

The current implementation includes structured **synthetic learning data** for demonstrating the platform's functionality.

---

## 📂 Project Structure

```text
edpulse/
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── pages/
│   │   ├── BottleneckPanel.tsx
│   │   ├── DataQualityPanel.tsx
│   │   ├── DecisionBrief.tsx
│   │   ├── ForecastChart.tsx
│   │   ├── ForecastDrivers.tsx
│   │   ├── Header.tsx
│   │   ├── PatientFlowDiagram.tsx
│   │   ├── RecommendationPanel.tsx
│   │   ├── ResourceTable.tsx
│   │   ├── StatusCards.tsx
│   │   └── WhatIfSimulator.tsx
│   │
│   ├── data/
│   │   └── syntheticData.ts
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
├── vite.config.ts
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Haresh-kumar28/AgraVeda.git
```

### 2. Navigate to the project

```bash
cd AgraVeda
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available at the local development URL shown in your terminal.

---

## 📊 Core Modules

### 📈 Forecasting

Analyzes historical learning patterns and generates projections to help understand possible future performance.

### 🎯 Recommendation Engine

Uses available learning information to generate targeted recommendations and identify areas that may require attention.

### 🔍 Data Quality

Evaluates learning data and highlights potential quality issues that could affect analysis.

### 🚧 Bottleneck Detection

Identifies potential learning bottlenecks that may be affecting progress.

### 🔄 What-If Simulation

Allows users to explore hypothetical changes and understand their potential impact.

### 🧠 Decision Support

Transforms analytical results into concise, understandable decision-oriented insights.

---

## 🖥️ Dashboard

The platform is organized into multiple functional areas:

* Command Center
* Patient/Learning Flow
* Forecast Inputs
* Decisions
* Resources
* Scenarios
* What-If Analysis
* Data Quality

These modules provide a unified interface for exploring learning data and insights.

---

## 🔮 Future Enhancements

AgraVeda can be extended with:

* 🔐 User authentication and role-based access
* ☁️ Cloud-based data storage
* 🧠 Advanced ML-based personalization
* 📱 Mobile application
* 📚 Personalized learning-path generation
* 🔔 Smart alerts and notifications
* 📊 Real-time analytics
* 🔗 Integration with Learning Management Systems
* 📈 Advanced student performance prediction
* 🗣️ AI-powered learning assistant

---

## 🌟 Vision

> **Make education more personalized, data-driven, and accessible by turning learning data into actionable intelligence.**

AgraVeda aims to move beyond simply delivering educational content and instead help students understand **how they learn, where they struggle, and what they can do next.**

---

## 👥 Contributors

Developed as an educational technology project focused on intelligent and personalized learning.

**Project:** AgraVeda
**Former Project Name:** EdPulse

---

## 📄 License

This project is currently intended for educational and demonstration purposes.

---

## ⭐ Support

If you find AgraVeda interesting, consider giving the repository a ⭐ on GitHub.
