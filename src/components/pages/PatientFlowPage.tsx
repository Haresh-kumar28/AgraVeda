import React, { useState } from 'react';
import { EDRecord } from '../../data/syntheticData';
import { BottleneckResult } from '../../engines/bottleneckEngine';
import { ForecastResult } from '../../engines/forecastEngine';
import {
  GitBranch,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Clock,
  Bed,
  Users,
  Activity,
  CheckCircle2,
  Sliders,
  Server,
  Info,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface PatientFlowPageProps {
  currentRecord: EDRecord;
  bottlenecks: BottleneckResult;
  forecast: ForecastResult;
  onNavigate?: (page: string) => void;
}

export const PatientFlowPage: React.FC<PatientFlowPageProps> = ({
  currentRecord,
  bottlenecks,
  forecast: _forecast,
  onNavigate,
}) => {
  const primaryBneck = bottlenecks.primary;
  const [selectedStageId, setSelectedStageId] = useState<string>('treatment');

  const occPct = Math.round((currentRecord.currentOccupancy / currentRecord.totalBeds) * 100);
  const netFlowRate = currentRecord.arrivals - currentRecord.departures;

  // Authoritative Seven-Stage Definitions with Full Telemetry
  const stages = [
    {
      id: 'arrival',
      num: '01',
      name: 'Arrival & Registration',
      category: 'Intake Demand',
      metric: `${currentRecord.arrivals} pts/hr`,
      resource: null,
      description: 'Initial intake demand from walk-in registrations, triage referrals, and EMS ambulance arrivals.',
      capacityLabel: 'Inflow Velocity',
      capacityValue: `${currentRecord.arrivals} arrivals/hr`,
      loadPct: Math.min(100, Math.round((currentRecord.arrivals / 30) * 100)),
      status: 'nominal' as const,
      details: {
        intakeMix: 'Estimated 65% walk-in ambulatory, 35% EMS ambulance deliveries.',
        flowDynamics: `Current net flow balance: ${netFlowRate > 0 ? `+${netFlowRate}` : netFlowRate} pts/hr accumulation.`,
        recommendation: 'Monitor EMS diversion status if downstream bed deficit worsens.',
      },
    },
    {
      id: 'triage',
      num: '02',
      name: 'Triage & Acuity Classification',
      category: 'Clinical Prioritization',
      metric: '100% Evaluated',
      resource: null,
      description: 'Emergency Severity Index (ESI 1–5) protocol to prioritize acute clinical treatment.',
      capacityLabel: 'Acuity Intake',
      capacityValue: `${currentRecord.highAcuity} High · ${currentRecord.mediumAcuity} Med · ${currentRecord.lowAcuity} Low`,
      loadPct: 100,
      status: 'nominal' as const,
      details: {
        intakeMix: `High Acuity (ESI 1–2): ${currentRecord.highAcuity} pts (${Math.round((currentRecord.highAcuity / Math.max(1, currentRecord.arrivals)) * 100)}%) · Med Acuity (ESI 3): ${currentRecord.mediumAcuity} pts · Low Acuity (ESI 4–5): ${currentRecord.lowAcuity} pts.`,
        flowDynamics: 'High acuity patients bypass waiting queue directly into resuscitation and acute beds.',
        recommendation: 'Ensure fast-track protocol remains active for ESI 4–5 to minimize waiting buffer accumulation.',
      },
    },
    {
      id: 'waiting',
      num: '03',
      name: 'Waiting Queue Buffer',
      category: 'Unassigned Queue',
      metric: `${currentRecord.waitingPatients} Waiting`,
      resource: 'space',
      description: 'Triaged patients in waiting area buffer awaiting clinician assessment or open treatment bay.',
      capacityLabel: 'Queue Wait Proxy',
      capacityValue: `Avg ${currentRecord.averageWaitTime} min wait`,
      loadPct: Math.min(100, Math.round((currentRecord.waitingPatients / 25) * 100)),
      status: currentRecord.waitingPatients > 15 ? ('critical' as const) : currentRecord.waitingPatients > 8 ? ('constrained' as const) : ('nominal' as const),
      details: {
        intakeMix: `${currentRecord.waitingPatients} unassigned patients currently holding in buffer.`,
        flowDynamics: `Estimated door-to-clinician wait: ${currentRecord.averageWaitTime} minutes. Queue expands when downstream bed or physician capacity constricts.`,
        recommendation: currentRecord.waitingPatients > 12
          ? 'Initiate provider-in-triage or waiting-room rounding to mitigate Left-Without-Being-Seen (LWBS) risk.'
          : 'Queue depth currently within standard buffer parameters.',
      },
    },
    {
      id: 'doctor',
      num: '04',
      name: 'Physician Initial Assessment',
      category: 'Clinical Contact',
      metric: `${currentRecord.doctorsAvailable} Physicians`,
      resource: 'doctors',
      description: 'First physician contact, medical evaluation, initial order entry, and diagnostic requisitioning.',
      capacityLabel: 'Staffing Ratio',
      capacityValue: `1:6 ratio (Cap: ~${currentRecord.doctorsAvailable * 6} pts)`,
      loadPct: Math.min(100, Math.round((currentRecord.currentOccupancy / (currentRecord.doctorsAvailable * 6)) * 100)),
      status: primaryBneck.resource === 'doctors' ? ('critical' as const) : ('nominal' as const),
      details: {
        intakeMix: `${currentRecord.doctorsAvailable} board-certified emergency physicians actively staffing treatment bays.`,
        flowDynamics: `Current physician workload utilization: ${Math.min(100, Math.round((currentRecord.currentOccupancy / (currentRecord.doctorsAvailable * 6)) * 100))}%.`,
        recommendation: 'Maintain diagnostic orders early in the patient encounter to reduce total length-of-stay.',
      },
    },
    {
      id: 'diagnostics',
      num: '05',
      name: 'Diagnostics & Laboratory',
      category: 'Testing & Imaging',
      metric: `${currentRecord.diagnosticQueue} In Testing`,
      resource: 'diagnostics',
      description: 'Point-of-care laboratory panels, rapid turnaround blood work, CT scans, and plain radiographs.',
      capacityLabel: 'Testing Slots',
      capacityValue: 'Nominal 10 concurrent slots',
      loadPct: Math.min(100, Math.round((currentRecord.diagnosticQueue / 10) * 100)),
      status: primaryBneck.resource === 'diagnostics' ? ('critical' as const) : currentRecord.diagnosticQueue > 6 ? ('constrained' as const) : ('nominal' as const),
      details: {
        intakeMix: `${currentRecord.diagnosticQueue} patients undergoing active diagnostic testing holds or awaiting imaging reads.`,
        flowDynamics: 'Diagnostic turnaround time directly drives emergency department bed occupancy duration.',
        recommendation: 'Prioritize stat imaging reads for prospective discharge candidates to accelerate bay turnover.',
      },
    },
    {
      id: 'treatment',
      num: '06',
      name: 'Active Treatment Beds',
      category: 'Bed Capacity',
      metric: `${currentRecord.currentOccupancy} / ${currentRecord.totalBeds} Beds`,
      resource: 'beds',
      description: 'Dedicated monitored acute and subacute treatment bays actively occupied by emergency patients.',
      capacityLabel: 'Reserve Buffer',
      capacityValue: `${currentRecord.availableBeds} reserve beds remaining`,
      loadPct: occPct,
      status: primaryBneck.resource === 'beds' || currentRecord.availableBeds < 5 || occPct >= 90 ? ('critical' as const) : occPct >= 80 ? ('constrained' as const) : ('nominal' as const),
      details: {
        intakeMix: `${currentRecord.currentOccupancy} of ${currentRecord.totalBeds} physical treatment beds occupied (${occPct}% utilization).`,
        flowDynamics: `${currentRecord.availableBeds} unassigned reserve beds remaining. Reserve buffer depleted (< 5 beds).`,
        recommendation: 'Activate bed turnover escalation and discharge lounge transfers to free monitored acute spaces.',
      },
    },
    {
      id: 'disposition',
      num: '07',
      name: 'Disposition & Handover',
      category: 'Outflow Handover',
      metric: `${currentRecord.departures} pts/hr`,
      resource: 'nurses',
      description: 'Discharge processing, inpatient hospital admission boarding, or transfer to specialized tertiary facilities.',
      capacityLabel: 'Discharge Outflow',
      capacityValue: `${currentRecord.departures} outflow handovers/hr`,
      loadPct: Math.min(100, Math.round((currentRecord.departures / 20) * 100)),
      status: 'nominal' as const,
      details: {
        intakeMix: 'Estimated 70% home discharges with follow-up, 25% inpatient admissions, 5% tertiary transfers.',
        flowDynamics: 'Inpatient boarding delays directly cause emergency department bay holding and gridlock.',
        recommendation: 'Collaborate with inpatient bed management to expedite floor bed assignments and portering.',
      },
    },
  ];

  const selectedStage = stages.find((s) => s.id === selectedStageId) || stages[5];
  const isSelectedBottleneck = primaryBneck.resource === selectedStage.resource;

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DF]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Seven-Stage Patient Flow Journey
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B74E4] bg-[#EAF4FF] border border-[#B2DDFF] px-2 py-0.5 rounded-sm">
              Flow Bottleneck Analysis
            </span>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">
            End-to-end journey stages from arrival intake to final disposition, highlighting active bottlenecks and cascading delays.
          </p>
        </div>

        {/* Constraint Indicator & Action Links */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="text-xs text-[#6B6B6B] bg-[#FAFAF8] border border-[#E8E4DF] px-3 py-1.5 rounded-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B42318]" aria-hidden="true" />
            <span>
              Primary Constraint: <strong className="text-[#B42318]">{primaryBneck.label}</strong>
            </span>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('what-if')}
              className="h-8 px-3 rounded-md bg-[#1B74E4] hover:bg-[#1558B0] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Simulate in What-If</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Two-Column Flow Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 7 Stages Vertical Sequence with Continuous Visual Spine (6 cols) */}
        <div className="lg:col-span-6 space-y-2 relative">
          <div className="flex items-center justify-between pb-1 text-xs text-[#6B6B6B]">
            <span className="font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A]">
              Interactive Patient Journey
            </span>
            <span className="text-[11px]">Click any stage to inspect live telemetry</span>
          </div>

          {stages.map((st, idx) => {
            const isBottleneck = primaryBneck.resource === st.resource;
            const isSelected = selectedStageId === st.id;

            return (
              <div key={st.id} className="relative">
                {/* Visual Connector Spine Line */}
                {idx < stages.length - 1 && (
                  <div
                    className="absolute left-[26px] top-[44px] w-0.5 h-[calc(100%+8px)] bg-[#E8E4DF] z-0"
                    aria-hidden="true"
                  />
                )}

                {/* Stage Interactive Button/Card */}
                <button
                  type="button"
                  onClick={() => setSelectedStageId(st.id)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer relative z-10 flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-white border-[#1B74E4] ring-2 ring-[#1B74E4]/30 shadow-sm'
                      : isBottleneck
                      ? 'bg-[#FEF3F2] border-[#FECDCA] hover:border-[#B42318]'
                      : st.status === 'constrained'
                      ? 'bg-[#FFFAEB] border-[#FEDF89] hover:border-[#B54708]'
                      : 'bg-white border-[#E8E4DF] hover:border-[#B6B6B6] hover:bg-[#FAFAF8]'
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`Stage ${st.num}: ${st.name}`}
                >
                  {/* Numbered Node Circle on Spine */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-mono text-xs font-bold border transition-colors ${
                      isBottleneck
                        ? 'bg-[#B42318] text-white border-[#B42318]'
                        : isSelected
                        ? 'bg-[#1B74E4] text-white border-[#1B74E4]'
                        : st.status === 'constrained'
                        ? 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]'
                        : 'bg-[#FAFAF8] text-[#1A1A1A] border-[#E8E4DF]'
                    }`}
                  >
                    {st.num}
                  </div>

                  {/* Stage Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1A1A1A] truncate">{st.name}</span>
                        <span className="text-[10px] text-[#6B6B6B] hidden sm:inline">· {st.category}</span>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isBottleneck && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#B42318] text-white">
                            Primary Bottleneck
                          </span>
                        )}
                        {st.status === 'constrained' && !isBottleneck && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]">
                            Constrained
                          </span>
                        )}
                        <span className="text-xs font-mono font-bold bg-[#FAFAF8] border border-[#E8E4DF] px-2 py-0.5 rounded text-[#1A1A1A]">
                          {st.metric}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#6B6B6B] line-clamp-1 leading-snug">
                      {st.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-[#6B6B6B] pt-1">
                      <span>{st.capacityLabel}: <strong className="text-[#1A1A1A] font-mono">{st.capacityValue}</strong></span>
                      <span className="text-[10px] text-[#1B74E4] font-medium flex items-center gap-0.5">
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Stage Telemetry & Active Bottleneck Analysis (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Selected Stage Deep Telemetry Panel */}
          <div className="p-5 bg-white border border-[#E8E4DF] rounded-md space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#EAF4FF] text-[#1B74E4] flex items-center justify-center font-mono font-bold text-xs">
                  {selectedStage.num}
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#1A1A1A]">{selectedStage.name}</h2>
                  <span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider font-semibold">
                    {selectedStage.category}
                  </span>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  isSelectedBottleneck
                    ? 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'
                    : selectedStage.status === 'constrained'
                    ? 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]'
                    : 'bg-[#ECFDF3] text-[#0E7A4E] border-[#A6F4C5]'
                }`}
              >
                {isSelectedBottleneck
                  ? 'Active Pinch Point'
                  : selectedStage.status === 'constrained'
                  ? 'Elevated Queue'
                  : 'Operational'}
              </span>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-[#FAFAF8] rounded border border-[#E8E4DF]">
                <div className="text-[10px] uppercase font-bold text-[#6B6B6B]">Live Stage Throughput</div>
                <div className="text-base font-bold text-[#1A1A1A] font-mono mt-0.5">
                  {selectedStage.metric}
                </div>
              </div>
              <div className="p-3 bg-[#FAFAF8] rounded border border-[#E8E4DF]">
                <div className="text-[10px] uppercase font-bold text-[#6B6B6B]">Buffer / Capacity</div>
                <div className="text-base font-bold text-[#1A1A1A] font-mono mt-0.5">
                  {selectedStage.capacityValue}
                </div>
              </div>
            </div>

            {/* Stage Clinical & Operational Notes */}
            <div className="space-y-2 text-xs text-[#6B6B6B]">
              <div className="p-3 bg-[#FAFAF8] rounded border border-[#E8E4DF] space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Stage Operational Role & Protocol
                </div>
                <p className="leading-relaxed">{selectedStage.details.intakeMix}</p>
                <p className="leading-relaxed">{selectedStage.details.flowDynamics}</p>
              </div>

              <div className="p-3 bg-[#F0F7FF] rounded border border-[#B2DDFF] text-[#1558B0] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#1B74E4] shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Operational Recommendation:</strong> {selectedStage.details.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Active Constraint & Cascading Effects Panel */}
          <div className="p-5 bg-white border border-[#E8E4DF] rounded-md space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#B54708]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Active Constraint & Root Cause Evidence
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA] px-2 py-0.5 rounded">
                Horizon: +2h Peak
              </span>
            </div>

            {/* Load Comparison */}
            <div className="p-3.5 bg-[#FAFAF8] border border-[#E8E4DF] rounded-md space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#6B6B6B]">Identified Bottleneck Area:</span>
                <strong className="text-[#B42318] uppercase text-xs font-bold">{primaryBneck.label}</strong>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-[#E8E4DF]">
                <div>
                  <div className="text-[9px] text-[#6B6B6B] uppercase font-bold">Current Load</div>
                  <div className="text-base font-bold text-[#1A1A1A] mt-0.5 font-mono">
                    {primaryBneck.currentUtilization.toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-[#6B6B6B] uppercase font-bold">Projected (+2h)</div>
                  <div className="text-base font-bold text-[#B42318] mt-0.5 font-mono">
                    {primaryBneck.projectedUtilization.toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-[#6B6B6B] uppercase font-bold">Net Capacity Gap</div>
                  <div
                    className={`text-base font-bold mt-0.5 font-mono ${
                      primaryBneck.gap < 0 ? 'text-[#B42318]' : 'text-[#0E7A4E]'
                    }`}
                  >
                    {primaryBneck.gap > 0 ? `+${primaryBneck.gap}` : primaryBneck.gap}
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#6B6B6B] leading-relaxed pt-1 border-t border-[#E8E4DF]">
                {primaryBneck.impactDetail}
              </p>
            </div>

            {/* Cascading Effects Sequence Map: Upstream -> Constraint -> Downstream */}
            <div className="space-y-2.5 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                Cascading Upstream & Downstream Sequence Map
              </h4>

              <div className="p-3.5 bg-[#FAFAF8] border border-[#E8E4DF] rounded-md space-y-2.5 text-xs">
                {/* Node 1: Upstream Delay */}
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="min-w-0">
                    <strong className="text-[#1A1A1A] block">Upstream Waiting Buffer Surge (Stage 03)</strong>
                    <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                      Treatment bed saturation blocks patient movement out of triage. Waiting queue expands to {currentRecord.waitingPatients} patients; average door-to-provider wait reaches {currentRecord.averageWaitTime} min.
                    </p>
                  </div>
                </div>

                <div className="pl-2.5 py-0.5 text-[#B6B6B6]">
                  <div className="w-0.5 h-2 bg-[#E8E4DF]" />
                </div>

                {/* Node 2: Primary Constraint */}
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="min-w-0">
                    <strong className="text-[#B42318] block">Primary Pinch Point: {primaryBneck.label} (Stage 06)</strong>
                    <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                      Occupancy at {occPct}% ({currentRecord.currentOccupancy}/{currentRecord.totalBeds} beds) leaves only {currentRecord.availableBeds} reserve beds. Zero surge cushion for EMS arrivals.
                    </p>
                  </div>
                </div>

                <div className="pl-2.5 py-0.5 text-[#B6B6B6]">
                  <div className="w-0.5 h-2 bg-[#E8E4DF]" />
                </div>

                {/* Node 3: Downstream Handover */}
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#EAF4FF] text-[#1B74E4] border border-[#B2DDFF] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="min-w-0">
                    <strong className="text-[#1A1A1A] block">Downstream Disposition & Boarding Holds (Stage 07)</strong>
                    <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                      Inpatient admission bed delays prolong emergency department boarding times, preventing bay turnover for new acute arrivals.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Connected Operational Action Links */}
            {onNavigate && (
              <div className="pt-2 border-t border-[#E8E4DF] flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onNavigate('what-if')}
                  className="h-8 px-3 rounded bg-[#1B74E4] hover:bg-[#1558B0] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Test Capacity in What-If</span>
                </button>

                <button
                  onClick={() => onNavigate('resources')}
                  className="h-8 px-3 rounded bg-white border border-[#E8E4DF] hover:bg-[#FAFAF8] text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>Staff & Capacity</span>
                </button>

                <button
                  onClick={() => onNavigate('forecast-inputs')}
                  className="h-8 px-3 rounded bg-white border border-[#E8E4DF] hover:bg-[#FAFAF8] text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Adjust Inflow</span>
                </button>
              </div>
            )}
          </div>

          {/* Operational Modeling & Governance Caveat */}
          <div className="p-4 bg-[#F0F7FF] border border-[#B2DDFF] rounded-md text-xs text-[#175CD3] space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1B74E4]" />
              <span>Operational Decision Support Disclosure</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#1558B0]">
              Patient journey estimates represent deterministic operational throughput calculations calibrated against standard hospital acute demand cycles. This platform does not perform clinical triage or replace clinical admission protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientFlowPage;
