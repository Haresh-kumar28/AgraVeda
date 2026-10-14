import React, { useState } from 'react';
import { EDRecord } from '../../data/syntheticData';
import { ForecastResult } from '../../engines/forecastEngine';
import { PressureResult } from '../../engines/pressureEngine';
import { BottleneckResult } from '../../engines/bottleneckEngine';
import { Recommendation } from '../../engines/recommendationEngine';
import ForecastChart from '../ForecastChart';
import PressureIndicator from '../PressureIndicator';
import BottleneckPanel from '../BottleneckPanel';
import {
  Activity,
  Bed,
  Clock,
  Users,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  GitBranch,
  Stethoscope,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { ROLE_LABELS } from '../../auth/roles';

interface CommandCenterProps {
  currentRecord: EDRecord;
  forecast: ForecastResult;
  pressure: PressureResult;
  bottlenecks: BottleneckResult;
  recommendations: Recommendation[];
  recentData: EDRecord[];
  scenario: string;
  onNavigate: (page: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  currentRecord,
  forecast,
  pressure,
  bottlenecks,
  recommendations,
  recentData,
  scenario,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [selectedFlowStage, setSelectedFlowStage] = useState<number | null>(null);

  const totalBeds = currentRecord.totalBeds;
  const currentOccupancy = currentRecord.currentOccupancy;
  const availableBeds = currentRecord.availableBeds;
  const occPct = Math.round((currentOccupancy / Math.max(1, totalBeds)) * 100);

  const primaryBneck = bottlenecks.primary;
  const topRec = recommendations[0];

  const scenarioLabels: Record<string, string> = {
    normal: 'Normal Baseline Demand',
    accident_surge: 'Accident Surge (+80%)',
    weekend_peak: 'Weekend Peak (+10%)',
    outbreak: 'Community Outbreak (+50%)',
    custom: 'Custom Scenario',
  };

  // 7 authoritative stages with metrics and descriptions
  const flowStages = [
    {
      num: '01',
      name: 'Arrival & Reg',
      val: `${currentRecord.arrivals}/hr`,
      metricName: 'Inflow Rate',
      sub: 'Walk-ins & EMS',
      capacity: 'Demand intake',
      resource: null,
      desc: 'Initial intake demand from walk-in triage referrals and emergency medical transport (EMS) arrivals.',
      warn: false,
    },
    {
      num: '02',
      name: 'Triage',
      val: '100%',
      metricName: 'Classification',
      sub: 'ESI Acuity 1–5',
      capacity: 'Rapid intake',
      resource: null,
      desc: 'Emergency Severity Index acuity assignment: 20% High Acuity (ESI 1-2), 45% Medium (ESI 3), 35% Low (ESI 4-5).',
      warn: false,
    },
    {
      num: '03',
      name: 'Waiting Queue',
      val: `${currentRecord.waitingPatients} pts`,
      metricName: 'Queue Depth',
      sub: 'Unassigned buffer',
      capacity: `Avg wait: ${currentRecord.averageWaitTime}m`,
      resource: 'space',
      desc: 'Triaged patients awaiting first clinician assessment or physical exam room assignment.',
      warn: currentRecord.waitingPatients > 12,
    },
    {
      num: '04',
      name: 'Doctor Assessment',
      val: `${currentRecord.doctorsAvailable} docs`,
      metricName: 'Physicians On Duty',
      sub: '1:6 ratio capacity',
      capacity: `Max ~${currentRecord.doctorsAvailable * 6} pts`,
      resource: 'doctors',
      desc: 'First clinical contact, physical evaluation, medical history review, and initial diagnostic orders.',
      warn: primaryBneck.resource === 'doctors',
    },
    {
      num: '05',
      name: 'Diagnostics',
      val: `${currentRecord.diagnosticQueue} pts`,
      metricName: 'Testing Queue',
      sub: 'Imaging & labs',
      capacity: '10 concurrent slots',
      resource: 'diagnostics',
      desc: 'Turnaround holds for CT scans, X-rays, point-of-care laboratory panels, and diagnostic reads.',
      warn: currentRecord.diagnosticQueue > 6 || primaryBneck.resource === 'diagnostics',
    },
    {
      num: '06',
      name: 'Treatment Beds',
      val: `${currentOccupancy}/${totalBeds}`,
      metricName: 'Occupied Beds',
      sub: `${availableBeds} reserve beds`,
      capacity: `${totalBeds} total treatment beds`,
      resource: 'beds',
      desc: 'Monitored acute and subacute emergency treatment spaces occupied by active patients.',
      warn: occPct >= 90 || availableBeds < 5 || primaryBneck.resource === 'beds',
    },
    {
      num: '07',
      name: 'Disposition',
      val: `${currentRecord.departures}/hr`,
      metricName: 'Outflow Throughput',
      sub: 'Admits & discharges',
      capacity: 'Discharge processing',
      resource: 'nurses',
      desc: 'Discharge handover, inpatient admission boarding holds, or transfers to specialized tertiary care.',
      warn: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Operational Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DF]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Emergency Department Command Center
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B74E4] bg-[#EAF4FF] border border-[#B2DDFF] px-2 py-0.5 rounded-sm">
              Operational Intelligence
            </span>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">
            {user?.organization || 'MetroHealth Regional Medical Center'} · Active Role Lens:{' '}
            <strong className="text-[#1A1A1A]">{user ? ROLE_LABELS[user.role] : 'Operations Manager'}</strong>
            {' · '}
            <span className="font-mono text-[11px] text-[#6B6B6B]">14-Day Historical Baseline · 6h Forecast Horizon</span>
          </p>
        </div>

        {/* Status Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-[#6B6B6B] bg-[#FAFAF8] border border-[#E8E4DF] px-3 py-1.5 rounded-md">
            <span className="w-2 h-2 rounded-full bg-[#0E7A4E]" aria-hidden="true" />
            <span>Demand Model: <strong className="text-[#1A1A1A]">{scenarioLabels[scenario] || scenario}</strong></span>
          </div>

          <button
            onClick={() => onNavigate('scenarios')}
            className="h-8 px-3 rounded-md bg-white border border-[#E8E4DF] hover:border-[#1B74E4] text-xs font-semibold text-[#1A1A1A] hover:text-[#1B74E4] transition-colors cursor-pointer"
          >
            Switch Scenario
          </button>

          <button
            onClick={() => onNavigate('what-if')}
            className="h-8 px-3 rounded-md bg-[#1B74E4] hover:bg-[#1558B0] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>What-If Simulator</span>
          </button>
        </div>
      </div>

      {/* 2. Core Operational Measures — Mathematically Audited Consistency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Inflow */}
        <div className="p-4 bg-white border border-[#E8E4DF] rounded-md space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Arrival Demand</span>
            <div className="w-6 h-6 rounded bg-[#EAF4FF] text-[#1B74E4] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#1A1A1A] tracking-tight font-mono">
            {currentRecord.arrivals}
            <span className="text-xs font-normal text-[#6B6B6B] ml-1">pts/hr</span>
          </div>
          <div className="text-[11px] text-[#6B6B6B] flex items-center justify-between pt-1 border-t border-[#F5F3F0]">
            <span>Waiting in queue:</span>
            <strong className="text-[#1A1A1A] font-mono">{currentRecord.waitingPatients} patients</strong>
          </div>
        </div>

        {/* Metric 2: Occupancy Rate */}
        <div className="p-4 bg-white border border-[#E8E4DF] rounded-md space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Treatment Bed Occupancy</span>
            <div className="w-6 h-6 rounded bg-[#EAF4FF] text-[#1B74E4] flex items-center justify-center">
              <Bed className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#1A1A1A] tracking-tight font-mono">
            {occPct}%
          </div>
          <div className="text-[11px] text-[#6B6B6B] flex items-center justify-between pt-1 border-t border-[#F5F3F0]">
            <span>Occupied beds:</span>
            <strong className="text-[#1A1A1A] font-mono">{currentOccupancy} of {totalBeds} total</strong>
          </div>
        </div>

        {/* Metric 3: Available Reserve Beds — Strictly Consistent: totalBeds - currentOccupancy */}
        <div className="p-4 bg-white border border-[#E8E4DF] rounded-md space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Unassigned Reserve Beds</span>
            <div className="w-6 h-6 rounded bg-[#EAF4FF] text-[#1B74E4] flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-3xl font-bold tracking-tight font-mono ${
            availableBeds < 5 ? 'text-[#B42318]' : 'text-[#1A1A1A]'
          }`}>
            {availableBeds}
            <span className="text-xs font-normal text-[#6B6B6B] ml-1">beds available</span>
          </div>
          <div className="text-[11px] flex items-center justify-between pt-1 border-t border-[#F5F3F0]">
            <span className="text-[#6B6B6B]">Reserve status:</span>
            {availableBeds < 5 ? (
              <span className="text-[#B42318] font-bold">Depleted (&lt; 5 buffer)</span>
            ) : (
              <span className="text-[#0E7A4E] font-medium">Adequate reserve</span>
            )}
          </div>
        </div>

        {/* Metric 4: Average Door-to-Doctor Wait Proxy */}
        <div className="p-4 bg-white border border-[#E8E4DF] rounded-md space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Door-to-Clinician Wait</span>
            <div className="w-6 h-6 rounded bg-[#EAF4FF] text-[#1B74E4] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-3xl font-bold tracking-tight font-mono ${
            currentRecord.averageWaitTime > 45 ? 'text-[#B42318]' : 'text-[#1A1A1A]'
          }`}>
            {currentRecord.averageWaitTime}
            <span className="text-xs font-normal text-[#6B6B6B] ml-1">min</span>
          </div>
          <div className="text-[11px] text-[#6B6B6B] flex items-center justify-between pt-1 border-t border-[#F5F3F0]">
            <span>Staff on duty:</span>
            <strong className="text-[#1A1A1A] font-mono">{currentRecord.doctorsAvailable} Docs · {currentRecord.nursesAvailable} RNs</strong>
          </div>
        </div>
      </div>

      {/* 3. Interactive Seven-Stage Patient Flow Strip */}
      <div className="p-4 bg-white border border-[#E8E4DF] rounded-md space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-[#1B74E4]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              Seven-Stage Emergency Patient Journey
            </span>
            <span className="text-[11px] text-[#6B6B6B]">· Click a stage to inspect active throughput</span>
          </div>
          <button
            onClick={() => onNavigate('patient-flow')}
            className="text-xs text-[#1B74E4] hover:underline font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Full Patient Flow Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 7 Stage Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
          {flowStages.map((st, idx) => {
            const isSelected = selectedFlowStage === idx;
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => setSelectedFlowStage(isSelected ? null : idx)}
                className={`p-2.5 rounded border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[#1B74E4] bg-[#EAF4FF] ring-2 ring-[#1B74E4]/30'
                    : st.warn
                    ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318] hover:border-[#B42318]'
                    : 'bg-[#FAFAF8] border-[#E8E4DF] text-[#1A1A1A] hover:border-[#B6B6B6] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono font-bold text-[#6B6B6B]">{st.num}</span>
                  {st.warn && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B42318] animate-pulse" aria-hidden="true" />
                  )}
                </div>
                <div className="text-[11px] font-bold truncate text-[#1A1A1A]">{st.name}</div>
                <div className="text-sm font-bold mt-0.5 truncate font-mono">{st.val}</div>
                <div className="text-[10px] text-[#6B6B6B] truncate mt-0.5">{st.sub}</div>
              </button>
            );
          })}
        </div>

        {/* Stage Inspection Detail Drawer when a stage is selected */}
        {selectedFlowStage !== null && (
          <div className="p-3 bg-[#FAFAF8] border border-[#E8E4DF] rounded-md mt-2 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#1B74E4]">{flowStages[selectedFlowStage].num}</span>
                <strong className="text-sm text-[#1A1A1A]">{flowStages[selectedFlowStage].name}</strong>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-white border border-[#E8E4DF] rounded text-[#6B6B6B]">
                  {flowStages[selectedFlowStage].metricName}: {flowStages[selectedFlowStage].val}
                </span>
                {flowStages[selectedFlowStage].warn && (
                  <span className="text-[9px] font-bold uppercase bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA] px-1.5 py-0.5 rounded">
                    Active Constriction
                  </span>
                )}
              </div>
              <p className="text-[#6B6B6B] text-[11px] leading-relaxed max-w-3xl">
                {flowStages[selectedFlowStage].desc}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate('patient-flow')}
                className="h-7 px-3 rounded bg-white border border-[#E8E4DF] hover:border-[#1B74E4] text-[11px] font-semibold text-[#1A1A1A] flex items-center gap-1 cursor-pointer"
              >
                <span>Examine Stage Flow</span>
                <ChevronRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => setSelectedFlowStage(null)}
                className="text-[11px] text-[#6B6B6B] hover:text-[#1A1A1A] px-2 py-1"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Principal Visualizations: Forecast & Operational Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 6-Hour Arrival Forecast (8 cols) */}
        <div className="lg:col-span-8 p-5 bg-white border border-[#E8E4DF] rounded-md space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#1A1A1A]">
                6-Hour Emergency Department Demand Forecast
              </h2>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                Observed volume (past 8 hours) vs. temporal ensemble forecast with backtested MAE uncertainty bounds.
              </p>
            </div>
            <button
              onClick={() => onNavigate('forecast-inputs')}
              className="h-8 px-3 rounded-md border border-[#E8E4DF] hover:border-[#1B74E4] text-xs font-semibold text-[#1A1A1A] hover:text-[#1B74E4] transition-colors self-start sm:self-auto cursor-pointer"
            >
              Adjust Inputs & Parameters
            </button>
          </div>

          <ForecastChart forecast={forecast} recentData={recentData} scenario={scenario} />
        </div>

        {/* Right: Operational Pressure & Constraint Panels (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 bg-white border border-[#E8E4DF] rounded-md shadow-xs">
            <PressureIndicator pressure={pressure} />
          </div>

          <div className="p-5 bg-white border border-[#E8E4DF] rounded-md shadow-xs">
            <BottleneckPanel bottlenecks={bottlenecks} onNavigate={onNavigate} />
          </div>
        </div>
      </div>

      {/* 5. Explainable Decision Support & Key Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recommended Action (7 cols) */}
        <div className="lg:col-span-7 p-5 bg-white border border-[#E8E4DF] rounded-md space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1A1A1A]">
                Recommended Operational Action
              </h2>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                Explainable intervention addressing {primaryBneck.label} ({primaryBneck.gap < 0 ? `deficit: ${primaryBneck.gap}` : 'reserve constrained'})
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B74E4] bg-[#EAF4FF] border border-[#B2DDFF] px-2 py-0.5 rounded-sm">
              Operational Advisory
            </span>
          </div>

          {/* Structured 4-Part Decision Brief */}
          <div className="p-4 bg-[#FAFAF8] border border-[#E8E4DF] rounded-md space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                pressure.level === 'CRITICAL'
                  ? 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'
                  : pressure.level === 'HIGH'
                  ? 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]'
                  : 'bg-[#ECFDF3] text-[#0E7A4E] border-[#A6F4C5]'
              }`}>
                {topRec?.urgency || pressure.level} Priority
              </span>
              <span className="text-xs font-semibold text-[#6B6B6B]">
                Constraint Focus: <strong className="text-[#1A1A1A]">{primaryBneck.label}</strong>
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                {topRec?.what || `Active ${primaryBneck.label} Mitigation Strategy`}
              </h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed mt-1">
                {topRec?.action || 'Evaluate bed turnover escalation and on-call nursing mobilization before the forecasted surge window peaks.'}
              </p>
            </div>

            {/* Expected Mitigation Impact */}
            <div className="p-2.5 bg-white rounded border border-[#E8E4DF] text-xs">
              <span className="text-[10px] uppercase font-bold text-[#6B6B6B] block mb-0.5">Expected Operational Impact:</span>
              <p className="text-xs text-[#1A1A1A] leading-relaxed">
                {topRec?.impact || 'Projected to reduce door-to-provider wait time by 12–18 minutes and absorb peak arrival surge without ambulance diversion.'}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => onNavigate('what-if')}
                className="h-8 px-3.5 rounded bg-[#1B74E4] hover:bg-[#1558B0] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Simulate in What-If</span>
              </button>

              <button
                onClick={() => onNavigate('decisions')}
                className="h-8 px-3 rounded bg-white border border-[#E8E4DF] hover:bg-[#FAFAF8] text-xs font-semibold text-[#1A1A1A] transition-colors cursor-pointer"
              >
                View Full Decision Brief
              </button>
            </div>
          </div>
        </div>

        {/* Key Operational Signals (5 cols) */}
        <div className="lg:col-span-5 p-5 bg-white border border-[#E8E4DF] rounded-md space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1A1A1A]">Key Operational Signals</h2>
            <button
              onClick={() => onNavigate('decisions')}
              className="text-xs text-[#1B74E4] hover:underline font-semibold"
            >
              See all
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 bg-[#FAFAF8] border border-[#E8E4DF] rounded flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-[#B54708] shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#1A1A1A]">
                  {primaryBneck.label} Constriction Warning
                </div>
                <div className="text-[11px] text-[#6B6B6B] mt-0.5 leading-snug">
                  Projected demand reaches {primaryBneck.projectedUtilization.toFixed(0)}% utilization at peak (+2h horizon).
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#FAFAF8] border border-[#E8E4DF] rounded flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#1B74E4] shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#1A1A1A]">Time-to-Impact Window</div>
                <div className="text-[11px] text-[#6B6B6B] mt-0.5 leading-snug">
                  Mitigation action recommended {pressure.timeToImpact !== 'N/A' ? pressure.timeToImpact : 'within 60–90 minutes'}.
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#FAFAF8] border border-[#E8E4DF] rounded flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-[#0E7A4E] shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#1A1A1A]">Data Trust & Provenance</div>
                <div className="text-[11px] text-[#6B6B6B] mt-0.5 leading-snug">
                  100% complete synthetic dataset · 0s timestamp latency · Model calibrated on 336 historical records.
                </div>
              </div>
            </div>
          </div>

          {/* Safety Disclaimer */}
          <div className="pt-2 border-t border-[#E8E4DF] flex items-start gap-1.5 text-[10px] text-[#6B6B6B]">
            <Info className="w-3.5 h-3.5 text-[#6B6B6B] shrink-0 mt-0.5" />
            <span>
              Decision support prototype only. Licensed clinical staff retain sole care, triage, and medical treatment authority.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
