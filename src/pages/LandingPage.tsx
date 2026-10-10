import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  TrendingUp,
  GitBranch,
  Sliders,
  Database,
  ChevronDown,
  ChevronUp,
  HeartPulse,
} from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';

interface LandingPageProps {
  onNavigate: (route: string) => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onExploreDemo,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'What is AgraVeda?',
      a: 'AgraVeda is an operational decision-support system designed for hospital emergency departments. It models patient arrival demand, tracks stage-by-stage patient flow, detects operational pressure before overcrowding occurs, and evaluates resource scenarios through deterministic what-if simulation.',
    },
    {
      q: 'What data does this prototype use?',
      a: 'This demonstration runs on structured synthetic emergency department data modeled after typical Level 1 trauma and community acute hospital demand cycles. No real protected health information (PHI) or patient identifiable records are used.',
    },
    {
      q: 'Is AgraVeda a clinical diagnostic tool?',
      a: 'No. AgraVeda is strictly an operational workflow and resource planning prototype. It does not perform clinical triage, provide medical diagnosis, or suggest patient-level medical treatments. Clinical staff remain completely responsible for all patient care decisions.',
    },
    {
      q: 'How does role-based access work in AgraVeda?',
      a: 'AgraVeda enforces least privilege across five distinct personas: Hospital Administrator, ED Manager, Doctor/Clinical Staff, Nurse/Operations Staff, and Analyst/Read-Only. Sensitive roles require administrative verification before elevated permissions are granted.',
    },
    {
      q: 'How can our hospital integrate real EHR data?',
      a: 'Production integration requires connecting HL7/FHIR event feeds or ADT (Admission, Discharge, Transfer) interfaces into an authenticated backend service with HIPAA-compliant encryption, hardware security keys, and facility-specific model calibration.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans selection:bg-[#EAF4FF] selection:text-[#1B74E4]">
      {/* 1. Global Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#EAEAEA]">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-left cursor-pointer focus-visible:outline-2"
          >
            <BrandLogo size="md" />
          </button>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#727272]">
            <a href="#platform" className="hover:text-[#222222] transition-colors">
              Platform
            </a>
            <a href="#how-it-works" className="hover:text-[#222222] transition-colors">
              How It Works
            </a>
            <a href="#flow" className="hover:text-[#222222] transition-colors">
              Patient Flow
            </a>
            <a href="#security" className="hover:text-[#222222] transition-colors">
              Security & Roles
            </a>
            <a href="#faq" className="hover:text-[#222222] transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('login')}
              className="text-xs font-semibold text-[#222222] hover:text-[#1B74E4] px-3 py-2 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onExploreDemo}
              className="h-9 px-4 rounded-md bg-[#1B74E4] hover:bg-[#1558B0] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>Explore Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Editorial 2-column layout */}
      <section className="py-16 md:py-24 border-b border-[#EAEAEA]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Headline & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[#EAF4FF] text-[#1B74E4] text-[11px] font-semibold tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B74E4]"></span>
              Predictive Emergency Department Operations
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] leading-[1.08] font-bold tracking-tight text-[#222222]">
              See pressure coming.
              <br />
              <span className="editorial-serif font-normal italic text-[#1B74E4]">
                Prepare with confidence.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#727272] leading-relaxed max-w-xl">
              AgraVeda turns emergency operational data into demand forecasts, patient-flow visibility, pressure signals, and resource-planning insights before surge turns into crisis.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onExploreDemo}
                className="h-11 px-6 rounded-md bg-[#1B74E4] hover:bg-[#1558B0] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('signup')}
                className="h-11 px-5 rounded-md bg-white border border-[#EAEAEA] hover:border-[#B6B6B6] text-[#222222] text-xs font-semibold transition-all cursor-pointer"
              >
                Request Hospital Access
              </button>
            </div>

            <div className="pt-4 flex items-center gap-2 text-[11px] text-[#727272]">
              <span className="w-2 h-2 rounded-full bg-[#0E7A4E]" />
              <span>Operational decision support · Clinical teams remain responsible for care decisions.</span>
            </div>
          </div>

          {/* Right Column: Hero Graphic / Editorial Preview (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="border border-[#EAEAEA] rounded-md overflow-hidden bg-[#F8F9FA] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B42318] animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#222222]">
                    Operational Horizon · Next 6h
                  </span>
                </div>
                <span className="text-[10px] text-[#727272] font-mono">MetroHealth Demo</span>
              </div>

              {/* Snapshot Metric Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 border border-[#EAEAEA] rounded-sm">
                  <div className="text-[10px] uppercase font-bold text-[#727272]">Predicted Load Peak</div>
                  <div className="text-2xl font-bold text-[#B42318] mt-1">+2h Peak</div>
                  <div className="text-[11px] text-[#727272] mt-0.5">38 arrivals/hr (High)</div>
                </div>
                <div className="bg-white p-3 border border-[#EAEAEA] rounded-sm">
                  <div className="text-[10px] uppercase font-bold text-[#727272]">Primary Bottleneck</div>
                  <div className="text-2xl font-bold text-[#222222] mt-1">Bed Deficit</div>
                  <div className="text-[11px] text-[#B42318] font-medium mt-0.5">Gap: -6 beds needed</div>
                </div>
              </div>

              {/* Stage Flow Preview */}
              <div className="bg-white p-3 border border-[#EAEAEA] rounded-sm">
                <div className="flex justify-between text-[10px] font-bold uppercase text-[#727272] mb-2">
                  <span>Patient Flow Constriction</span>
                  <span className="text-[#B42318]">Treatment Area</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {['Triage', 'Queue', 'Physician', 'Treatment', 'Disposition'].map((stage, i) => (
                    <div
                      key={stage}
                      className={`flex-1 py-1 text-center rounded-[2px] text-[10px] font-semibold ${
                        i === 3
                          ? 'bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]'
                          : 'bg-[#F8F9FA] text-[#727272] border border-[#EAEAEA]'
                      }`}
                    >
                      {stage}
                    </div>
                  ))}
                </div>
              </div>

              {/* Heuristic Advisory Note */}
              <div className="p-3 bg-[#EAF4FF] border border-[#B2DDFF] rounded-sm text-xs text-[#175CD3]">
                <div className="font-semibold flex items-center gap-1.5 mb-0.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Proactive Recommendation</span>
                </div>
                <p className="text-[11px] text-[#1558B0] leading-snug">
                  Fast-track observation discharge and alert on-call nursing before the forecasted 14:00 surge peak.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Plain-Language Trust Strip */}
      <section className="py-8 bg-[#F8F9FA] border-b border-[#EAEAEA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-[#222222]">
                Explainable Signals
              </div>
              <p className="text-[11px] text-[#727272]">
                Every alert is tied directly to underlying arrival, bed, or staffing metrics.
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-[#222222]">
                Deterministic What-If
              </div>
              <p className="text-[11px] text-[#727272]">
                Evaluate bed interventions & nursing additions without mutating baseline data.
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-[#222222]">
                Data Quality Aware
              </div>
              <p className="text-[11px] text-[#727272]">
                Surfaces missingness, outliers, and timestamp lags before computing advice.
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-[#222222]">
                Role-Governed Least Privilege
              </div>
              <p className="text-[11px] text-[#727272]">
                Tailored views for Administrators, ED Managers, Doctors, Nurses, and Analysts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Operational Pillars (Feature Sections) */}
      <section id="platform" className="py-20 border-b border-[#EAEAEA]">
        <div className="max-w-7xl mx-auto px-6 space-y-20">
          <div className="max-w-2xl space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1B74E4]">
              Operational Architecture
            </span>
            <h2 className="text-3xl font-bold text-[#222222] tracking-tight">
              Six analytical engines working together
            </h2>
            <p className="text-sm text-[#727272] leading-relaxed">
              Designed around how emergency department leaders actually make staffing, escalation, and bed allocation decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-white border border-[#EAEAEA] rounded-md space-y-3 hover:border-[#B6B6B6] transition-colors">
              <div className="w-10 h-10 rounded-md bg-[#EAF4FF] text-[#1B74E4] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#222222]">1. Demand Forecasting</h3>
              <p className="text-xs text-[#727272] leading-relaxed">
                Anticipate arrivals 1 to 6 hours ahead using temporal patterns, hour-of-day cycles, and surge multipliers with explicit MAE and RMSE validation markers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-white border border-[#EAEAEA] rounded-md space-y-3 hover:border-[#B6B6B6] transition-colors">
              <div className="w-10 h-10 rounded-md bg-[#EAF4FF] text-[#1B74E4] flex items-center justify-center">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#222222]">2. Seven-Stage Patient Flow</h3>
              <p className="text-xs text-[#727272] leading-relaxed">
                Track flow from Arrival through Triage, Waiting Queue, Physician Assessment, Diagnostics, Treatment Beds, to Disposition/Discharge with constriction indicators.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-white border border-[#EAEAEA] rounded-md space-y-3 hover:border-[#B6B6B6] transition-colors">
              <div className="w-10 h-10 rounded-md bg-[#EAF4FF] text-[#1B74E4] flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#222222]">3. Operational Pressure Signals</h3>
              <p className="text-xs text-[#727272] leading-relaxed">
                Transparent 0-100 pressure score derived from projected occupancy, queue buildup, and bed utilization. Zero ungrounded black-box risk numbers.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-white border border-[#EAEAEA] rounded-md space-y-3 hover:border-[#B6B6B6] transition-colors">
              <div className="w-10 h-10 rounded-md bg-[#EAF4FF] text-[#1B74E4] flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#222222]">4. What-If Scenario Simulator</h3>
              <p className="text-xs text-[#727272] leading-relaxed">
                Model intervention strategies in real time. Compare baseline vs. simulated occupancy, wait time reductions, and pressure transitions before deploying staff.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-white border border-[#EAEAEA] rounded-md space-y-3 hover:border-[#B6B6B6] transition-colors">
              <div className="w-10 h-10 rounded-md bg-[#EAF4FF] text-[#1B74E4] flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#222222]">5. Decision Support Briefs</h3>
              <p className="text-xs text-[#727272] leading-relaxed">
                Structured four-part decision briefs: What is happening, why, what is projected next, and which operational action to consider.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-white border border-[#EAEAEA] rounded-md space-y-3 hover:border-[#B6B6B6] transition-colors">
              <div className="w-10 h-10 rounded-md bg-[#EAF4FF] text-[#1B74E4] flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#222222]">6. Input Trustworthiness & Quality</h3>
              <p className="text-xs text-[#727272] leading-relaxed">
                Honest reporting of missing values, anomalies, and sample size limitations. Safe fallback heuristics engage automatically if data quality degrades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Blue Closing Feature Banner */}
      <section className="py-16 bg-[#1B74E4] text-white">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-100">
            Emergency Operational Preparedness
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to test operational load scenarios?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Experience the AgraVeda workspace with pre-configured synthetic emergency datasets, deterministic calculations, and role-based permissions.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={onExploreDemo}
              className="h-11 px-6 rounded-md bg-white text-[#1B74E4] hover:bg-blue-50 text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>Explore Platform Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="h-11 px-6 rounded-md bg-[#1558B0] hover:bg-[#124991] text-white text-xs font-semibold border border-blue-300/30 transition-all cursor-pointer"
            >
              Sign In to Your Hospital
            </button>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="py-20 border-b border-[#EAEAEA] bg-[#F8F9FA]">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1B74E4]">
              Transparency & Governance
            </span>
            <h2 className="text-3xl font-bold text-[#222222]">Frequently Answered Questions</h2>
            <p className="text-xs text-[#727272]">
              Clear expectations regarding clinical boundaries, synthetic data, and hospital integration.
            </p>
          </div>

          <div className="divide-y divide-[#EAEAEA] border border-[#EAEAEA] rounded-md bg-white">
            {faqs.map((faq, i) => (
              <div key={i} className="p-5">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between text-left text-sm font-bold text-[#222222] hover:text-[#1B74E4] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-[#727272]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#727272]" />
                  )}
                </button>
                {openFaq === i && (
                  <p className="text-xs text-[#727272] mt-3 leading-relaxed border-t border-[#F8F9FA] pt-3">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Enterprise Footer */}
      <footer className="bg-[#222222] text-[#A0A0A0] py-16 text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <BrandLogo size="md" white={true} />
            <p className="text-xs text-[#888888] leading-relaxed max-w-sm">
              AgraVeda is an emergency department operational decision-support prototype. Helping clinical leaders anticipate operational pressure, resolve bottlenecks, and model capacity.
            </p>
            <div className="text-[11px] text-[#777777]">
              © {new Date().getFullYear()} AgraVeda Operations Systems. All rights reserved.
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform Modules</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onExploreDemo} className="hover:text-white transition-colors cursor-pointer">
                  Command Center
                </button>
              </li>
              <li>
                <button onClick={onExploreDemo} className="hover:text-white transition-colors cursor-pointer">
                  Forecast & Inputs
                </button>
              </li>
              <li>
                <button onClick={onExploreDemo} className="hover:text-white transition-colors cursor-pointer">
                  Patient Flow (7 Stages)
                </button>
              </li>
              <li>
                <button onClick={onExploreDemo} className="hover:text-white transition-colors cursor-pointer">
                  What-If Simulator
                </button>
              </li>
              <li>
                <button onClick={onExploreDemo} className="hover:text-white transition-colors cursor-pointer">
                  Data Quality Engine
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Regulatory & Safety</h4>
            <div className="p-3 bg-[#2D2D2D] rounded border border-[#3E3E3E] text-[11px] text-[#AAAAAA] leading-relaxed">
              <strong>OPERATIONAL DECISION SUPPORT ONLY:</strong> AgraVeda does not diagnose, treat, or replace professional medical judgment. All patient triage and care decisions remain the sole responsibility of licensed clinical teams.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
