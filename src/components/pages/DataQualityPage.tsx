import React, { useState } from 'react';
import { DataQualityReport, AuditCheck } from '../../engines/dataQualityEngine';
import { ForecastResult } from '../../engines/forecastEngine';
import { EDRecord } from '../../data/syntheticData';
import {
  ShieldCheck,
  AlertTriangle,
  Database,
  Activity,
  CheckCircle2,
  Info,
  Clock,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Layers,
  ArrowRight,
  ExternalLink,
  Lock,
  ListFilter,
  Check,
  XCircle,
} from 'lucide-react';

export interface DataQualityPageProps {
  report: DataQualityReport;
  forecast: ForecastResult;
  records?: EDRecord[];
  onNavigate?: (page: string) => void;
}

export const DataQualityPage: React.FC<DataQualityPageProps> = ({
  report,
  forecast,
  records: _records,
  onNavigate,
}) => {
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);
  const [showOutlierList, setShowOutlierList] = useState(false);

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'good':
        return 'text-[#0E7A4E] bg-[#ECFDF3] border-[#A6F4C5]';
      case 'acceptable':
        return 'text-[#175CD3] bg-[#EFF8FF] border-[#B2DDFF]';
      case 'degraded':
        return 'text-[#B54708] bg-[#FFFAEB] border-[#FEDF89]';
      case 'poor':
        return 'text-[#B42318] bg-[#FEF3F2] border-[#FECDCA]';
      default:
        return 'text-[#6B6B6B] bg-[#FAFAF8] border-[#E8E4DF]';
    }
  };

  const getCheckStatusIcon = (status: AuditCheck['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-4 h-4 text-[#0E7A4E] shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-[#B54708] shrink-0" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-[#B42318] shrink-0" />;
      default:
        return <HelpCircle className="w-4 h-4 text-[#6B6B6B] shrink-0" />;
    }
  };

  const getCheckStatusBadge = (status: AuditCheck['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-[#ECFDF3] text-[#0E7A4E] border-[#A6F4C5]';
      case 'warning':
        return 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]';
      case 'failed':
        return 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]';
      default:
        return 'bg-[#FAFAF8] text-[#6B6B6B] border-[#E8E4DF]';
    }
  };

  // Production Prerequisites Roadmap
  const productionPrerequisites = [
    {
      id: 'PRQ-01',
      title: 'Bilateral HL7 v2 / FHIR R4 ADT Feed',
      category: 'EHR Connectivity',
      status: 'Incomplete (Synthetic Sandbox)',
      statusBadge: 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]',
      supportingEvidence: 'Active mock telemetry generator providing 336 continuous synthetic hourly observations.',
      nextAction: 'Configure secure MLLP endpoint and mutual TLS certificates on hospital interface gateway.',
      responsibleOwner: 'Hospital IT Integration & Network Security',
    },
    {
      id: 'PRQ-02',
      title: 'Facility-Specific Model Recalibration',
      category: 'ML Engineering',
      status: 'Pending Historical Data',
      statusBadge: 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]',
      supportingEvidence: 'Current weights calibrated to synthetic benchmark Poisson arrival distributions (λ = 8.5/hr).',
      nextAction: 'Extract 12-month de-identified historical EHR arrival logs to fit local seasonalities.',
      responsibleOwner: 'Clinical Informatics & Biostatistics',
    },
    {
      id: 'PRQ-03',
      title: 'Institutional Single Sign-On (SAML / OIDC)',
      category: 'Security & Access',
      status: 'Prototype Local RBAC',
      statusBadge: 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]',
      supportingEvidence: 'Client-side 4-role lens switcher (ED Director, Charge RN, Provider, Analyst).',
      nextAction: 'Federate identity with enterprise Okta/Azure Active Directory SAML 2.0 tenant.',
      responsibleOwner: 'Identity & Access Management (IAM)',
    },
    {
      id: 'PRQ-04',
      title: 'Prospective Clinical Validation Protocol',
      category: 'Governance & Safety',
      status: 'Not Started',
      statusBadge: 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]',
      supportingEvidence: '24-hour retrospective rolling backtest harness (MAE: 1.1 arrivals/hr).',
      nextAction: 'Submit 60-day silent-mode parallel shadowing protocol for Department Quality Committee approval.',
      responsibleOwner: 'Chief Medical Officer / ED Quality Committee',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DF]">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#1B74E4]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Data Quality & Model Trustworthiness
            </h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Verifiable data integrity audit, rolling backtest evaluation metrics, model architecture transparency, and production readiness governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#1B74E4] bg-[#EAF4FF] border border-[#B2DDFF] px-2.5 py-1 rounded font-bold uppercase tracking-wider">
            Synthetic Operational Sandbox
          </span>
          <div className="text-xs text-[#6B6B6B] bg-white border border-[#E8E4DF] px-3 py-1 rounded flex items-center gap-1.5 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-[#1B74E4]" />
            <span>Audited Records:</span>
            <strong className="text-[#1A1A1A] font-mono">{report.totalRecords} hours</strong>
          </div>
        </div>
      </div>

      {/* SECTION 1: VERIFIABLE DATA AUDIT SCORECARD */}
      <div className="p-6 bg-white border border-[#E8E4DF] rounded-lg shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8E4DF]">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#1B74E4]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">
                Verifiable Input Data Quality Scorecard
              </h2>
            </div>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Deterministic evaluation over {report.totalRecords} records ({report.totalAuditedFields} total fields) · Window: {report.dataWindow}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${getQualityBadge(
                report.overallQuality
              )}`}
            >
              Overall: {report.overallQuality}
            </span>
          </div>
        </div>

        {/* Aggregate Quality Index Bar with Scoring Formula */}
        <div className="space-y-2 bg-[#FAFAF8] p-4 rounded-lg border border-[#E8E4DF]">
          <div className="flex justify-between items-baseline text-xs">
            <div>
              <span className="font-bold text-[#1A1A1A]">Aggregate Quality Index (AQI)</span>
              <span className="text-[11px] text-[#6B6B6B] ml-2 font-mono">
                Formula: 100 − (2 × Missing%) − (3 × Outlier%) − (2 × Skew%)
              </span>
            </div>
            <span className="font-bold font-mono text-base text-[#1A1A1A]">
              {report.qualityScore} / 100
            </span>
          </div>

          <div className="w-full bg-[#E8E4DF] h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                report.qualityScore >= 90
                  ? 'bg-[#12B76A]'
                  : report.qualityScore >= 70
                  ? 'bg-[#1B74E4]'
                  : report.qualityScore >= 40
                  ? 'bg-[#F79009]'
                  : 'bg-[#D92D20]'
              }`}
              style={{ width: `${report.qualityScore}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#6B6B6B] pt-0.5">
            <span>0 Poor (Model Suspended)</span>
            <span>40 Degraded Threshold</span>
            <span>70 Acceptable</span>
            <span>90+ Good (Production Target)</span>
          </div>
        </div>

        {/* Four Core Audit Metric Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 bg-white rounded-lg border border-[#E8E4DF] shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6B6B] block">
              Completeness
            </span>
            <div className="text-2xl font-bold font-mono text-[#1A1A1A] mt-1">
              {report.completenessPercent.toFixed(1)}%
            </div>
            <span className="text-[10px] text-[#6B6B6B] mt-0.5 block">
              {report.totalAuditedFields - report.missingValueCount}/{report.totalAuditedFields} cells
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-lg border border-[#E8E4DF] shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6B6B] block">
              Missing Values
            </span>
            <div
              className={`text-2xl font-bold font-mono mt-1 ${
                report.missingValueCount > 0 ? 'text-[#B54708]' : 'text-[#0E7A4E]'
              }`}
            >
              {report.missingValueCount}
            </div>
            <span className="text-[10px] text-[#6B6B6B] mt-0.5 block">
              {report.missingFields.length === 0 ? '0 fields affected' : `${report.missingFields.length} field(s)`}
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-lg border border-[#E8E4DF] shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6B6B] block">
              Outliers Detected
            </span>
            <div
              className={`text-2xl font-bold font-mono mt-1 ${
                report.outlierCount > 0 ? 'text-[#B54708]' : 'text-[#0E7A4E]'
              }`}
            >
              {report.outlierCount}
            </div>
            <button
              type="button"
              onClick={() => setShowOutlierList(!showOutlierList)}
              className="text-[10px] text-[#1B74E4] hover:underline mt-0.5 block"
            >
              {report.outlierCount > 0 ? (showOutlierList ? 'Hide flagged rows' : 'View flagged rows') : 'Within bounds'}
            </button>
          </div>

          <div className="p-3.5 bg-white rounded-lg border border-[#E8E4DF] shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6B6B] block">
              Timestamp Skew
            </span>
            <div
              className={`text-2xl font-bold font-mono mt-1 ${
                report.timestampIssues > 0 ? 'text-[#B42318]' : 'text-[#0E7A4E]'
              }`}
            >
              {report.timestampIssues}
            </div>
            <span className="text-[10px] text-[#6B6B6B] mt-0.5 block">
              UTC ISO-8601 hourly sequence
            </span>
          </div>
        </div>

        {/* Flagged Outlier Inspector (if open) */}
        {showOutlierList && report.outliers.length > 0 && (
          <div className="p-4 bg-[#FAFAF8] rounded-lg border border-[#E8E4DF] space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4DF]">
              <span className="font-bold text-[#1A1A1A]">Flagged Value Audit Inspection</span>
              <span className="text-[11px] text-[#6B6B6B]">{report.outliers.length} rows exceeded physical limits</span>
            </div>
            <div className="overflow-x-auto max-h-48">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] font-bold uppercase text-[#6B6B6B] border-b border-[#E8E4DF]">
                  <tr>
                    <th className="py-1.5 px-2">Record #</th>
                    <th className="py-1.5 px-2">Field</th>
                    <th className="py-1.5 px-2 text-right">Observed Value</th>
                    <th className="py-1.5 px-2">Bounding Rule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DF]">
                  {report.outliers.map((o, idx) => (
                    <tr key={idx} className="hover:bg-white">
                      <td className="py-1.5 px-2 font-mono">#{o.index}</td>
                      <td className="py-1.5 px-2 font-semibold text-[#1B74E4]">{o.field}</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-[#B42318]">{o.value}</td>
                      <td className="py-1.5 px-2 text-[#6B6B6B]">{o.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pipeline Execution Readiness */}
        <div className="p-4 bg-[#FAFAF8] rounded-lg border border-[#E8E4DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[#6B6B6B] block">Inference Pipeline Readiness</span>
            <div className="font-bold text-[#1A1A1A] text-sm mt-0.5 flex items-center gap-2">
              {report.canRunModel ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#12B76A]" />
                  <span>Primary Forecasting Engine Operational</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#D92D20]" />
                  <span>Pipeline Degraded: {report.fallbackReason}</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-[#6B6B6B] mt-0.5">
              Requires AQI ≥ 40 and minimum 24 valid historical hours. Currently {report.validRecords} valid hours.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {report.canRunModel ? (
              <span className="px-2.5 py-1 rounded text-xs font-bold uppercase bg-[#ECFDF3] text-[#0E7A4E] border border-[#A6F4C5] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Audit Passed
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded text-xs font-bold uppercase bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA] flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Degraded
              </span>
            )}
          </div>
        </div>

        {/* Expandable Audit Check Details List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              Underlying Automated Audit Checkpoints ({report.auditChecks.length})
            </h3>
            <span className="text-[11px] text-[#6B6B6B]">Click any check to inspect bounding criteria</span>
          </div>

          <div className="space-y-2">
            {report.auditChecks.map((chk) => {
              const isOpen = expandedCheck === chk.id;
              return (
                <div
                  key={chk.id}
                  className="border border-[#E8E4DF] rounded-md overflow-hidden bg-white transition-all"
                >
                  <div
                    onClick={() => setExpandedCheck(isOpen ? null : chk.id)}
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#FAFAF8] text-xs gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      {getCheckStatusIcon(chk.status)}
                      <div>
                        <div className="font-semibold text-[#1A1A1A] flex items-center gap-2">
                          <span>{chk.name}</span>
                          <span className="text-[10px] font-mono text-[#6B6B6B] bg-[#FAFAF8] px-1.5 py-0.2 rounded border border-[#E8E4DF]">
                            {chk.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B6B6B] mt-0.5">{chk.summary}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getCheckStatusBadge(chk.status)}`}>
                        {chk.status}
                      </span>
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#6B6B6B]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#6B6B6B]" />}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="p-3.5 bg-[#FAFAF8] border-t border-[#E8E4DF] text-xs space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-[#6B6B6B] block">Observed Metric</span>
                          <span className="font-mono font-bold text-[#1A1A1A]">{chk.metric}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-[#6B6B6B] block">Audit Acceptance Threshold</span>
                          <span className="font-mono text-[#1A1A1A]">{chk.threshold}</span>
                        </div>
                      </div>
                      {chk.details && (
                        <div className="pt-1 text-[11px] text-[#4A4A4A]">
                          <strong>Evaluation Detail:</strong> {chk.details}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: MODEL EVALUATION & TRUSTWORTHINESS (SEPARATE FROM DATA QUALITY) */}
      <div className="p-6 bg-white border border-[#E8E4DF] rounded-lg shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8E4DF]">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#1B74E4]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">
                Predictive Model Evaluation & Validation Provenance
              </h2>
            </div>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Empirical out-of-sample backtest metrics evaluated against synthetic ground truth
            </p>
          </div>

          <div className="p-2 bg-[#FAFAF8] border border-[#E8E4DF] rounded text-xs text-[#6B6B6B]">
            Validation Method: <strong className="text-[#1A1A1A]">Rolling 24h Out-of-Sample Backtest</strong>
          </div>
        </div>

        {/* Model Accuracy Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#FAFAF8] rounded-lg border border-[#E8E4DF]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                Mean Absolute Error (MAE)
              </span>
              <span className="text-[10px] text-[#0E7A4E] bg-[#ECFDF3] px-1.5 py-0.5 rounded border border-[#A6F4C5] font-semibold">
                Backtest 24h
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#1A1A1A] mt-2">
              {forecast.metrics.mae.toFixed(1)} <span className="text-xs font-normal text-[#6B6B6B]">arrivals / hr</span>
            </div>
            <p className="text-[11px] text-[#6B6B6B] mt-1 leading-snug">
              Average absolute divergence between hourly predicted arrivals and historical actuals over past 24 hours.
            </p>
          </div>

          <div className="p-4 bg-[#FAFAF8] rounded-lg border border-[#E8E4DF]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                Root Mean Squared Error (RMSE)
              </span>
              <span className="text-[10px] text-[#0E7A4E] bg-[#ECFDF3] px-1.5 py-0.5 rounded border border-[#A6F4C5] font-semibold">
                Penalizes Spikes
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#1A1A1A] mt-2">
              {forecast.metrics.rmse.toFixed(1)} <span className="text-xs font-normal text-[#6B6B6B]">arrivals / hr</span>
            </div>
            <p className="text-[11px] text-[#6B6B6B] mt-1 leading-snug">
              Square root of mean squared prediction errors, sensitive to sudden volume fluctuations and peak spikes.
            </p>
          </div>

          <div className="p-4 bg-[#FAFAF8] rounded-lg border border-[#E8E4DF]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                Dataset Provenance
              </span>
              <span className="text-[10px] text-[#1B74E4] bg-[#EAF4FF] px-1.5 py-0.5 rounded border border-[#B2DDFF] font-semibold">
                Controlled Baseline
              </span>
            </div>
            <div className="text-lg font-bold text-[#1A1A1A] mt-2">
              Synthetic Benchmark
            </div>
            <p className="text-[11px] text-[#6B6B6B] mt-1 leading-snug">
              14-day stationary Poisson arrival generator with recurring weekday/weekend circaseptan temporal rhythms.
            </p>
          </div>
        </div>

        {/* Critical Distinction Notice: Clean Data vs Accurate Model */}
        <div className="p-4 bg-[#FEF6EE] border border-[#F9DBAF] rounded-lg text-xs text-[#7A3E08] flex items-start gap-3">
          <Info className="w-4 h-4 text-[#B54708] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#1A1A1A] block">
              Essential Analytical Distinction: Data Quality vs. Model Accuracy
            </span>
            <p className="leading-relaxed">
              Clean, complete data is a necessary prerequisite for model stability, but <strong>100% data quality does not guarantee 100% predictive accuracy</strong>. Emergency department volume is inherently stochastic: external events such as multi-vehicle collisions or weather disruptions cause sudden arrival surges that historical models cannot anticipate without real-time external telemetry feeds.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: MODEL ARCHITECTURE TRANSPARENCY & LIMITATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-white border border-[#E8E4DF] rounded-lg shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8E4DF]">
            <Info className="w-4 h-4 text-[#1B74E4]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              Temporal Hybrid Heuristic Architecture
            </h3>
          </div>

          <div className="divide-y divide-[#E8E4DF] text-xs">
            <div className="flex justify-between py-2">
              <span className="text-[#6B6B6B]">Model Architecture</span>
              <strong className="text-[#1A1A1A]">Temporal Hybrid Heuristic</strong>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#6B6B6B]">Inference Input Signals</span>
              <span className="text-[#1A1A1A] text-right">Recent 3h Trend (35%) + Historical Same-Hour (40%) + Current Rate (25%)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#6B6B6B]">Forecasting Horizon</span>
              <strong className="text-[#1A1A1A] font-mono">+1, +2, +3, +4, +6 Hours</strong>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#6B6B6B]">Historical Validation Sample</span>
              <strong className="text-[#1A1A1A] font-mono">312 Training Hours / 24 Backtest Hours</strong>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#6B6B6B]">Degraded Fallback Logic</span>
              <span className="text-[#1A1A1A] text-right">Static Same-Hour Historical Mean (Active when AQI &lt; 40)</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border border-[#E8E4DF] rounded-lg shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8E4DF]">
            <AlertTriangle className="w-4 h-4 text-[#B54708]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              Known Limitations & Reliability Boundaries
            </h3>
          </div>

          <ul className="space-y-2 text-xs text-[#4A4A4A] leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="text-[#B54708] font-bold">•</span>
              <span><strong>Unannounced Demand Shocks:</strong> Mass casualty incidents or highway collisions cannot be inferred from historical patterns alone.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#B54708] font-bold">•</span>
              <span><strong>Inpatient Boarding Dependencies:</strong> Occupancy projections assume standard 75% discharge throughput; hospital-wide bed gridlock reduces turnover.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#B54708] font-bold">•</span>
              <span><strong>No Clinical Efficacy Claim:</strong> Models are designed for operational resource preparedness, not clinical diagnostic triage.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* SECTION 4: REAL-WORLD PRODUCTION PREREQUISITES CHECKLIST */}
      <div className="p-6 bg-white border border-[#E8E4DF] rounded-lg shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8E4DF]">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0E7A4E]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">
                Institutional Production Readiness Checklist
              </h2>
            </div>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Mandatory engineering, governance, and clinical prerequisites before deploying into live hospital operational control
            </p>
          </div>

          <span className="text-xs font-bold text-[#B42318] bg-[#FEF3F2] px-2.5 py-1 rounded border border-[#FECDCA]">
            Status: Sandbox Verification Only (Non-Production)
          </span>
        </div>

        <div className="divide-y divide-[#E8E4DF]">
          {productionPrerequisites.map((prq) => (
            <div key={prq.id} className="py-4 space-y-2 first:pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#1A1A1A]">{prq.title}</span>
                  <span className="text-[10px] font-mono text-[#6B6B6B] bg-[#FAFAF8] px-1.5 py-0.2 rounded border border-[#E8E4DF]">
                    {prq.id}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${prq.statusBadge}`}>
                  {prq.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs pt-1">
                <div className="p-2.5 bg-[#FAFAF8] rounded border border-[#E8E4DF]">
                  <span className="text-[10px] uppercase font-bold text-[#6B6B6B] block">Current Evidence</span>
                  <p className="text-[#1A1A1A] mt-0.5 leading-snug">{prq.supportingEvidence}</p>
                </div>
                <div className="p-2.5 bg-[#FAFAF8] rounded border border-[#E8E4DF]">
                  <span className="text-[10px] uppercase font-bold text-[#6B6B6B] block">Required Next Action</span>
                  <p className="text-[#1A1A1A] mt-0.5 leading-snug">{prq.nextAction}</p>
                </div>
                <div className="p-2.5 bg-[#FAFAF8] rounded border border-[#E8E4DF]">
                  <span className="text-[10px] uppercase font-bold text-[#6B6B6B] block">Responsible Lead</span>
                  <p className="text-[#1B74E4] font-semibold mt-0.5 leading-snug">{prq.responsibleOwner}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimers Footer */}
      <div className="p-4 bg-[#FAFAF8] border border-[#E8E4DF] rounded-lg text-xs text-[#6B6B6B] space-y-1">
        <span className="font-bold text-[#1A1A1A] block">Regulatory & Non-Clinical Disclaimer:</span>
        <p className="leading-relaxed">
          AgraVeda is an operational decision support demonstration platform powered by a synthetic 336-hour emergency department time-series stream. This application has not received CE mark, FDA 510(k), or SaMD clearance for medical device usage and is not intended for patient diagnostic or therapeutic evaluation.
        </p>
      </div>
    </div>
  );
};

export default DataQualityPage;
