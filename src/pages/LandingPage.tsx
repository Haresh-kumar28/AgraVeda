import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity,
  ArrowRight,
  TrendingUp,
  GitBranch,
  Sliders,
  Database,
  ChevronDown,
  HeartPulse,
  Shield,
  Eye,
  Users,
  Lock,
  FileCheck,
  Menu,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';

/* ============================================================
   LANDING PAGE — AgraVeda Enterprise
   Predictive Emergency Department Load & Patient Flow Management
   ============================================================ */

interface LandingPageProps {
  onNavigate: (route: string) => void;
  onExploreDemo: () => void;
}

/* ---------- Seven authoritative patient-flow stages ---------- */
const FLOW_STAGES = [
  {
    num: '01',
    name: 'Arrival & Registration',
    desc: 'Initial intake from walk-in, triage referral, and EMS ambulance arrivals.',
  },
  {
    num: '02',
    name: 'Triage & Acuity Classification',
    desc: 'Emergency Severity Index (ESI) assignment to prioritize care delivery.',
  },
  {
    num: '03',
    name: 'Waiting Queue Buffer',
    desc: 'Unassigned patients awaiting exam room or physician evaluation.',
  },
  {
    num: '04',
    name: 'Physician Initial Assessment',
    desc: 'First clinical contact, medical history review, and initial diagnostic orders.',
  },
  {
    num: '05',
    name: 'Diagnostics & Laboratory',
    desc: 'CT, X-ray, point-of-care lab tests, and turnaround time holds.',
  },
  {
    num: '06',
    name: 'Active Treatment Beds',
    desc: 'Dedicated treatment beds occupied by monitored acute patients.',
  },
  {
    num: '07',
    name: 'Disposition & Handover',
    desc: 'Discharge processing, inpatient admission boarding, or facility transfer.',
  },
];

/* ---------- FAQ Data ---------- */
const FAQS = [
  {
    q: 'What is AgraVeda?',
    a: 'AgraVeda is an operational decision-support system designed for hospital emergency departments. It models patient arrival demand, tracks stage-by-stage patient flow, detects operational pressure before overcrowding occurs, and evaluates resource scenarios through deterministic what-if simulation.',
  },
  {
    q: 'What data does this prototype use?',
    a: 'This demonstration runs on structured synthetic emergency department data modeled after typical Level 1 trauma and community acute hospital demand cycles. No real protected health information (PHI) or patient-identifiable records are used.',
  },
  {
    q: 'Is AgraVeda a clinical diagnostic tool?',
    a: 'No. AgraVeda is strictly an operational workflow and resource planning prototype. It does not perform clinical triage, provide medical diagnosis, or suggest patient-level medical treatments. Clinical staff remain completely responsible for all patient care decisions.',
  },
  {
    q: 'How does role-based access work?',
    a: 'AgraVeda enforces least-privilege access across five distinct operational personas: Hospital Administrator, ED Manager, Doctor/Clinical Staff, Nurse/Operations Staff, and Analyst (Read-Only). Each role has a tailored set of capabilities. Sensitive roles require administrative verification before elevated permissions are granted.',
  },
  {
    q: 'How does data quality affect the platform\'s output?',
    a: 'Every forecast and operational assessment explicitly reports the quality, completeness, and reliability of its underlying data. Missing values, anomalies, and sample size limitations are surfaced before any advice is computed. When data quality degrades, safe fallback heuristics engage automatically.',
  },
  {
    q: 'How does the what-if scenario simulator work?',
    a: 'The simulator uses explicit, deterministic inputs — such as additional beds, nurses, or a patient surge percentage — applied against the current operational baseline. Results show projected changes in occupancy, wait times, and pressure levels. All inputs and assumptions are visible and reproducible.',
  },
  {
    q: 'How can our hospital integrate real EHR data?',
    a: 'Production integration would require connecting HL7/FHIR event feeds or ADT (Admission, Discharge, Transfer) interfaces into an authenticated backend service with appropriate encryption and facility-specific model calibration. This prototype demonstrates the analytical architecture using synthetic data.',
  },
];

/* ---------- Section visibility hook ---------- */
function useSectionObserver() {
  const refs = useRef<Map<string, HTMLElement>>(new Map());
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    refs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const register = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) refs.current.set(id, el);
  }, []);

  return { register };
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onExploreDemo,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const { register } = useSectionObserver();

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { label: 'Platform', target: 'platform' },
    { label: 'How It Works', target: 'how-it-works' },
    { label: 'Patient Flow', target: 'flow' },
    { label: 'Security & Roles', target: 'security' },
    { label: 'FAQ', target: 'faq' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] selection:bg-[#EAF4FF] selection:text-[#1B74E4]"
         style={{ fontFamily: '"Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* ====== HEADER / NAVIGATION ====== */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E8E4DF]">
        <div className="landing-container h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-left cursor-pointer focus-visible:outline-2 shrink-0"
            aria-label="Scroll to top"
          >
            <BrandLogo size="md" />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Primary navigation">
            {navItems.map((item) => (
              <button
                key={item.target}
                onClick={() => scrollTo(item.target)}
                className="text-[13px] font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors cursor-pointer bg-transparent border-none"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => onNavigate('login')}
              className="text-[13px] font-semibold text-[#1A1A1A] hover:text-[#1B74E4] px-3 py-2 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onExploreDemo}
              className="h-9 px-5 rounded-md bg-[#1B74E4] hover:bg-[#1558B0] text-white text-[13px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Explore Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#1A1A1A] cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav
            className="lg:hidden bg-white border-t border-[#E8E4DF] py-4 px-4"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.target}
                  onClick={() => scrollTo(item.target)}
                  className="text-left text-[14px] font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] py-2.5 px-3 rounded-md hover:bg-[#F5F3F0] transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
              <div className="border-t border-[#E8E4DF] mt-2 pt-3 flex flex-col gap-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('login'); }}
                  className="text-left text-[14px] font-semibold text-[#1A1A1A] py-2.5 px-3 rounded-md hover:bg-[#F5F3F0] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onExploreDemo(); }}
                  className="h-10 px-5 rounded-md bg-[#1B74E4] hover:bg-[#1558B0] text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Explore Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* ====== HERO SECTION — Cinematic Background Video ====== */}
      <section className="hero-section relative overflow-hidden border-b border-[#E8E4DF]" aria-label="Hero">
        {/* Background Video Layer — purely decorative */}
        {!videoError && (
          <video
            className="hero-video hero-bg-video"
            src="/assets/agraveda-hero-loop.mp4"
            poster="/assets/hero-poster.png"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            onError={() => setVideoError(true)}
          />
        )}

        {/* Static poster fallback for error and reduced-motion */}
        <img
          src="/assets/hero-poster.png"
          alt=""
          className={`hero-bg-poster ${videoError ? 'block' : 'hero-poster'}`}
          aria-hidden="true"
        />

        {/* Soft gradient overlays — blend video edges into #FAFAF8 canvas */}
        <div className="hero-gradient-overlay" aria-hidden="true" />

        {/* Foreground Content */}
        <div className="relative z-10 landing-container pt-20 pb-24 md:pt-28 md:pb-32 lg:pt-32 lg:pb-36">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#EAF4FF]/90 text-[#1B74E4] text-[11px] font-semibold tracking-wide uppercase backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B74E4]" aria-hidden="true"></span>
              Predictive Emergency Department Operations
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] leading-[1.08] font-bold tracking-tight text-[#1A1A1A]">
              See pressure coming.
              <br />
              <span className="editorial-serif font-medium italic text-[#1B74E4]">
                Prepare with confidence.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#555555] leading-relaxed max-w-xl">
              AgraVeda helps healthcare teams anticipate emergency department demand,
              understand patient-flow bottlenecks, and evaluate operational scenarios —
              using transparent reasoning and available data.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <button
                onClick={onExploreDemo}
                className="h-11 px-6 rounded-md bg-[#1B74E4] hover:bg-[#1558B0] text-white text-sm font-semibold flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('signup')}
                className="h-11 px-5 rounded-md bg-white/90 backdrop-blur-sm border border-[#E8E4DF] hover:border-[#B6B6B6] text-[#1A1A1A] text-sm font-semibold transition-all cursor-pointer"
              >
                Request Hospital Access
              </button>
            </div>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-[#6B6B6B]">
              <span className="w-2 h-2 rounded-full bg-[#0E7A4E] shrink-0" aria-hidden="true" />
              <span>Operational decision support · Clinical teams retain sole care authority.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====== CORE PRINCIPLES ====== */}
      <section id="how-it-works" className="py-16 bg-white border-b border-[#E8E4DF]" aria-label="Core Principles">
        <div ref={register('principles')} className="landing-container landing-section">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Eye className="w-5 h-5" />,
                title: 'Explainable Signals',
                desc: 'Every operational alert is tied directly to underlying arrival, bed, and staffing metrics with transparent reasoning.',
              },
              {
                icon: <Sliders className="w-5 h-5" />,
                title: 'Deterministic What-If',
                desc: 'Evaluate interventions using explicit inputs and reproducible calculations — no opaque models or hidden assumptions.',
              },
              {
                icon: <AlertTriangle className="w-5 h-5" />,
                title: 'Data Quality Aware',
                desc: 'Surfaces missingness, outliers, and reliability limitations before computing any operational assessment.',
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: 'Role-Governed Access',
                desc: 'Tailored views for Administrators, ED Managers, Doctors, Nurses, and Analysts with least-privilege enforcement.',
              },
            ].map((principle) => (
              <div key={principle.title} className="p-6 bg-[#FAFAF8] border border-[#E8E4DF] rounded-lg space-y-3">
                <div className="w-10 h-10 rounded-md bg-[#EAF4FF] text-[#1B74E4] flex items-center justify-center" aria-hidden="true">
                  {principle.icon}
                </div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">{principle.title}</h3>
                <p className="text-[13px] text-[#6B6B6B] leading-relaxed">{principle.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== PLATFORM ARCHITECTURE / CAPABILITIES ====== */}
      <section id="platform" className="py-20 border-b border-[#E8E4DF]" aria-label="Platform Architecture">
        <div ref={register('platform')} className="landing-container landing-section space-y-14">
          <div className="max-w-2xl space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1B74E4]">
              Operational Architecture
            </span>
            <h2 className="text-3xl sm:text-[36px] font-bold text-[#1A1A1A] tracking-tight editorial-serif">
              Six analytical engines working together
            </h2>
            <p className="text-[15px] text-[#6B6B6B] leading-relaxed">
              Designed around how emergency department leaders actually make staffing,
              escalation, and bed allocation decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <TrendingUp className="w-5 h-5" />,
                num: '01',
                title: 'Demand Forecasting',
                desc: 'Anticipate arrivals 1–6 hours ahead using temporal patterns, hour-of-day cycles, and surge multipliers with explicit MAE and RMSE validation.',
              },
              {
                icon: <GitBranch className="w-5 h-5" />,
                num: '02',
                title: 'Seven-Stage Patient Flow',
                desc: 'Track flow from Arrival through Triage, Waiting, Physician Assessment, Diagnostics, Treatment Beds, to Disposition with constriction detection.',
              },
              {
                icon: <Activity className="w-5 h-5" />,
                num: '03',
                title: 'Operational Pressure Signals',
                desc: 'Transparent 0–100 pressure score derived from projected occupancy, queue buildup, and bed utilization — no opaque risk numbers.',
              },
              {
                icon: <Sliders className="w-5 h-5" />,
                num: '04',
                title: 'What-If Scenario Simulator',
                desc: 'Model intervention strategies with explicit parameters. Compare baseline vs. simulated occupancy, wait times, and pressure before deploying staff.',
              },
              {
                icon: <HeartPulse className="w-5 h-5" />,
                num: '05',
                title: 'Decision Support Briefs',
                desc: 'Structured four-part briefs: what is happening, why, what is projected, and which operational actions to consider — supporting, not replacing, clinical judgment.',
              },
              {
                icon: <Database className="w-5 h-5" />,
                num: '06',
                title: 'Input Trustworthiness & Quality',
                desc: 'Honest reporting of missing values, anomalies, and sample size limitations. Safe fallback heuristics engage automatically when data quality degrades.',
              },
            ].map((feature) => (
              <div
                key={feature.num}
                className="group p-6 bg-white border border-[#E8E4DF] rounded-lg space-y-3 hover:border-[#B6B6B6] hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-[#EAF4FF] text-[#1B74E4] flex items-center justify-center shrink-0" aria-hidden="true">
                    {feature.icon}
                  </div>
                  <span className="text-[11px] font-mono font-medium text-[#B6B6B6]">{feature.num}</span>
                </div>
                <h3 className="text-[15px] font-bold text-[#1A1A1A]">{feature.title}</h3>
                <p className="text-[13px] text-[#6B6B6B] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== PATIENT FLOW SECTION ====== */}
      <section id="flow" className="py-20 bg-white border-b border-[#E8E4DF]" aria-label="Patient Flow">
        <div ref={register('flow')} className="landing-container landing-section space-y-14">
          <div className="max-w-2xl space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1B74E4]">
              Patient Journey
            </span>
            <h2 className="text-3xl sm:text-[36px] font-bold text-[#1A1A1A] tracking-tight editorial-serif">
              Seven-stage patient flow model
            </h2>
            <p className="text-[15px] text-[#6B6B6B] leading-relaxed">
              End-to-end emergency flow stages from arrival registration to final disposition,
              with constriction detection at each stage.
            </p>
          </div>

          {/* Desktop flow: horizontal connected stages */}
          <div className="hidden lg:block">
            <div className="flex items-start gap-0">
              {FLOW_STAGES.map((stage, idx) => (
                <React.Fragment key={stage.num}>
                  <div className="flex-1 min-w-0">
                    <div className="p-4 bg-[#FAFAF8] border border-[#E8E4DF] rounded-lg text-center space-y-2 hover:border-[#1B74E4] hover:bg-[#F0F7FF] transition-all">
                      <span className="text-[10px] font-mono font-bold text-[#1B74E4]">{stage.num}</span>
                      <h3 className="text-[12px] font-bold text-[#1A1A1A] leading-tight">{stage.name}</h3>
                      <p className="text-[11px] text-[#6B6B6B] leading-relaxed">{stage.desc}</p>
                    </div>
                  </div>
                  {idx < FLOW_STAGES.length - 1 && (
                    <div className="flex items-center pt-8 px-1 shrink-0" aria-hidden="true">
                      <ArrowRight className="w-3.5 h-3.5 text-[#B6B6B6]" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Tablet flow: 2-column grid */}
          <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
            {FLOW_STAGES.map((stage) => (
              <div key={stage.num} className="p-5 bg-[#FAFAF8] border border-[#E8E4DF] rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#1B74E4]">{stage.num}</span>
                  <h3 className="text-[13px] font-bold text-[#1A1A1A]">{stage.name}</h3>
                </div>
                <p className="text-[12px] text-[#6B6B6B] leading-relaxed">{stage.desc}</p>
              </div>
            ))}
          </div>

          {/* Mobile flow: vertical with connectors */}
          <div className="md:hidden space-y-0">
            {FLOW_STAGES.map((stage, idx) => (
              <React.Fragment key={stage.num}>
                <div className="p-4 bg-[#FAFAF8] border border-[#E8E4DF] rounded-lg space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#1B74E4]">{stage.num}</span>
                    <h3 className="text-[13px] font-bold text-[#1A1A1A]">{stage.name}</h3>
                  </div>
                  <p className="text-[12px] text-[#6B6B6B] leading-relaxed">{stage.desc}</p>
                </div>
                {idx < FLOW_STAGES.length - 1 && (
                  <div className="flow-connector" aria-hidden="true" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ====== SECURITY & ROLES ====== */}
      <section id="security" className="py-20 border-b border-[#E8E4DF]" aria-label="Security and Roles">
        <div ref={register('security')} className="landing-container landing-section space-y-14">
          <div className="max-w-2xl space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1B74E4]">
              Security & Access
            </span>
            <h2 className="text-3xl sm:text-[36px] font-bold text-[#1A1A1A] tracking-tight editorial-serif">
              Role-governed, least-privilege design
            </h2>
            <p className="text-[15px] text-[#6B6B6B] leading-relaxed">
              Access is governed by five operational personas, each with a defined set of capabilities.
              Sensitive roles require administrative verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role cards */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1B74E4]" />
                Operational Personas
              </h3>
              {[
                {
                  role: 'Hospital Administrator',
                  desc: 'Organization-wide administrative access, user provisioning, and security oversight.',
                  verified: true,
                },
                {
                  role: 'ED Manager',
                  desc: 'Operational lead for ED flow, staffing, forecasts, what-if planning, and decision support.',
                  verified: false,
                },
                {
                  role: 'Doctor / Clinical Staff',
                  desc: 'Monitoring acute ED load, patient journey constrictions, and decision briefs.',
                  verified: true,
                },
                {
                  role: 'Nurse / Operations Staff',
                  desc: 'Managing active area throughput and operational patient flow.',
                  verified: false,
                },
                {
                  role: 'Analyst (Read-Only)',
                  desc: 'Retrospective data access, forecasts, data quality diagnostics, and modeling scenarios.',
                  verified: false,
                },
              ].map((item) => (
                <div key={item.role} className="flex gap-3 p-4 bg-white border border-[#E8E4DF] rounded-lg">
                  <div className="shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-md bg-[#EAF4FF] text-[#1B74E4] flex items-center justify-center" aria-hidden="true">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-bold text-[#1A1A1A]">{item.role}</span>
                      {item.verified && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89] px-1.5 py-0.5 rounded-sm">
                          Requires Verification
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#6B6B6B] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Security principles */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#1B74E4]" />
                Access Principles
              </h3>
              {[
                {
                  icon: <Lock className="w-4 h-4" />,
                  title: 'Least-Privilege Enforcement',
                  desc: 'Each persona receives only the capabilities required for their operational function. Elevated access requires explicit provisioning.',
                },
                {
                  icon: <FileCheck className="w-4 h-4" />,
                  title: 'Session-Based Authentication',
                  desc: 'The current implementation uses session-scoped authentication. Demo sessions do not persist beyond the active browser session.',
                },
                {
                  icon: <Shield className="w-4 h-4" />,
                  title: 'Capability-Based Authorization',
                  desc: 'All data views and actions are gated by capability checks (e.g., view_forecasts, simulate_what_if, manage_users). Unauthorized access is denied at the application layer.',
                },
                {
                  icon: <CheckCircle2 className="w-4 h-4" />,
                  title: 'Sensitive Role Verification',
                  desc: 'Hospital Administrator and Clinician roles are flagged for verification upon registration. In a production deployment, these would require credential and identity verification.',
                },
              ].map((item) => (
                <div key={item.title} className="p-4 bg-white border border-[#E8E4DF] rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-[#EAF4FF] text-[#1B74E4] flex items-center justify-center" aria-hidden="true">
                      {item.icon}
                    </div>
                    <h4 className="text-[13px] font-bold text-[#1A1A1A]">{item.title}</h4>
                  </div>
                  <p className="text-[12px] text-[#6B6B6B] leading-relaxed pl-10">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====== BLUE CTA SECTION ====== */}
      <section className="py-16 sm:py-20 bg-[#1B74E4]" aria-label="Call to action">
        <div ref={register('cta')} className="landing-container landing-section text-center space-y-6">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-100">
            Emergency Operational Preparedness
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white editorial-serif">
            Ready to test operational load scenarios?
          </h2>
          <p className="text-[15px] text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Experience the AgraVeda workspace with pre-configured synthetic emergency
            datasets, deterministic calculations, and role-based permissions.
          </p>
          <div className="pt-2">
            <button
              onClick={onExploreDemo}
              className="h-11 px-6 rounded-md bg-white text-[#1B74E4] hover:bg-blue-50 text-sm font-bold flex items-center gap-2 shadow-sm mx-auto transition-all cursor-pointer"
            >
              <span>Explore Platform Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ====== FAQ ====== */}
      <section id="faq" className="py-20 bg-[#FAFAF8] border-b border-[#E8E4DF]" aria-label="Frequently Asked Questions">
        <div ref={register('faq')} className="landing-container landing-section max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1B74E4]">
              Transparency & Governance
            </span>
            <h2 className="text-3xl font-bold text-[#1A1A1A] editorial-serif">Frequently Asked Questions</h2>
            <p className="text-[13px] text-[#6B6B6B]">
              Clear expectations regarding clinical boundaries, synthetic data, and platform capabilities.
            </p>
          </div>

          <div className="divide-y divide-[#E8E4DF] border border-[#E8E4DF] rounded-lg bg-white">
            {FAQS.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between text-left px-5 py-4 text-[14px] font-semibold text-[#1A1A1A] hover:text-[#1B74E4] transition-colors cursor-pointer"
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-answer-${i}`}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#6B6B6B] shrink-0 ml-4 transition-transform ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  id={`faq-answer-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  className={`faq-answer ${openFaq === i ? 'open' : ''}`}
                  style={openFaq === i ? { maxHeight: '500px', opacity: 1, padding: '0 20px 16px 20px' } : { maxHeight: 0, opacity: 0, padding: '0 20px' }}
                >
                  <p className="text-[13px] text-[#6B6B6B] leading-relaxed border-t border-[#F5F3F0] pt-3">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="bg-[#1A1A1A] text-[#A0A0A0] py-16 text-[13px]" aria-label="Site footer">
        <div className="landing-container grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <BrandLogo size="md" white={true} />
            <p className="text-[13px] text-[#888888] leading-relaxed max-w-sm">
              AgraVeda is an emergency department operational decision-support prototype.
              Helping clinical leaders anticipate operational pressure, resolve bottlenecks,
              and model capacity.
            </p>
            <div className="text-[11px] text-[#777777]">
              © {new Date().getFullYear()} AgraVeda Operations Systems. All rights reserved.
            </div>
          </div>

          {/* Platform Modules */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-white">Platform Modules</h4>
            <ul className="space-y-2 text-[13px]">
              {['Command Center', 'Forecast & Inputs', 'Patient Flow (7 Stages)', 'What-If Simulator', 'Data Quality Engine'].map((label) => (
                <li key={label}>
                  <button
                    onClick={onExploreDemo}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Clinical Safety Disclaimer */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-white">Regulatory & Safety</h4>
            <div className="p-4 bg-[#2D2D2D] rounded-lg border border-[#3E3E3E] text-[11px] text-[#AAAAAA] leading-relaxed">
              <strong className="text-[#CCCCCC]">OPERATIONAL DECISION SUPPORT ONLY:</strong>{' '}
              AgraVeda does not diagnose, treat, or replace professional medical judgment.
              All patient triage and care decisions remain the sole responsibility of
              licensed clinical teams. This platform provides operational workflow support
              and does not make autonomous clinical decisions.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
