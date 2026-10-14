import React, { useState } from 'react';
import { BottleneckResult, ResourceBottleneck } from '../../engines/bottleneckEngine';
import { EDRecord } from '../../data/syntheticData';
import { ForecastResult } from '../../engines/forecastEngine';
import {
  Server,
  Bed,
  Users,
  Stethoscope,
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sliders,
  TrendingUp,
  ShieldAlert,
  Info,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface ResourcesPageProps {
  bottlenecks: BottleneckResult;
  currentRecord: EDRecord;
  forecast: ForecastResult;
  onNavigate?: (page: string) => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({
  bottlenecks,
  currentRecord,
  forecast: _forecast,
  onNavigate,
}) => {
  const [selectedResource, setSelectedResource] = useState<string | null>(bottlenecks.primary?.resource || 'beds');

  const resourceMeta: Record<
    string,
    {
      name: string;
      shortName: string;
      icon: React.ElementType;
      unit: string;
      ratio: string;
      category: string;
      description: string;
      recommendedBuffer: string;
    }
  > = {
    beds: {
      name: 'Treatment Beds',
      shortName: 'Beds',
      icon: Bed,
      unit: 'licensed beds',
      ratio: 'Monitored acute & observation care',
      category: 'Physical Facility',
      description: 'Acute resuscitation bays, rapid assessment, and monitored ED treatment stretchers.',
      recommendedBuffer: '≥ 15% reserve for acute EMS surges',
    },
    nurses: {
      name: 'Nursing Staff',
      shortName: 'Nurses',
      icon: Users,
      unit: 'active nurses',
      ratio: '1:4 nurse-to-patient ratio',
      category: 'Clinical Nursing',
      description: 'Active bedside, triage, and rapid medication administration nursing staff.',
      recommendedBuffer: '≥ 1 float nurse for high-acuity resuscitation',
    },
    doctors: {
      name: 'Attending Physicians',
      shortName: 'Physicians',
      icon: Stethoscope,
      unit: 'board MDs',
      ratio: '1:6 physician-to-patient ratio',
      category: 'Medical Providers',
      description: 'Emergency medicine attending physicians and advanced practice providers.',
      recommendedBuffer: '≥ 1 provider on-call for peak arrival waves',
    },
    diagnostics: {
      name: 'Diagnostic Slots',
      shortName: 'Diagnostics',
      icon: Activity,
      unit: 'concurrent slots',
      ratio: '10 concurrent rapid slots (60% order rate)',
      category: 'Diagnostic Ancillary',
      description: 'Dedicated rapid CT, ultrasound, stat laboratory, and plain radiography slots.',
      recommendedBuffer: '≥ 2 open slots for code stroke/trauma scans',
    },
  };

  const getStatusBadge = (status: 'ok' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]">
            <AlertCircle className="w-3 h-3 text-[#D92D20]" />
            Critical
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]">
            <AlertTriangle className="w-3 h-3 text-[#F79009]" />
            Elevated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-[#ECFDF3] text-[#0E7A4E] border border-[#A6F4C5]">
            <CheckCircle2 className="w-3 h-3 text-[#12B76A]" />
            Balanced
          </span>
        );
    }
  };

  const getGapMeaning = (gap: number, available: number, required: number) => {
    if (gap < 0) {
      return {
        label: `Deficit (${Math.abs(gap)} needed)`,
        color: 'text-[#B42318]',
        bg: 'bg-[#FEF3F2] border-[#FECDCA]',
        desc: 'Capacity ceiling breached; demand exceeds immediate supply.',
      };
    }
    if (gap === 0) {
      return {
        label: 'At Ceiling (0 Reserve Buffer)',
        color: 'text-[#B54708]',
        bg: 'bg-[#FFFAEB] border-[#FEDF89]',
        desc: '100% capacity utilized. Zero operational margin for arrival spikes.',
      };
    }
    const pctBuffer = Math.round((gap / available) * 100);
    return {
      label: `Operational Buffer (+${gap} spare)`,
      color: 'text-[#0E7A4E]',
      bg: 'bg-[#ECFDF3] border-[#A6F4C5]',
      desc: `${pctBuffer}% reserve cushion available to absorb unscheduled influx.`,
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DF]">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#1B74E4]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Staff & Capacity Resource Intelligence
            </h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Authoritative operational supply vs. projected +2h demand across physical beds, nursing ratios, physician coverage, and diagnostic slots.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs text-[#6B6B6B] bg-white border border-[#E8E4DF] px-3 py-1.5 rounded flex items-center gap-1.5 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-[#1B74E4]" />
            <span>Horizon:</span>
            <strong className="text-[#1A1A1A] font-medium">+2h Peak Demand</strong>
          </div>
          <div className="text-xs text-[#6B6B6B] bg-white border border-[#E8E4DF] px-3 py-1.5 rounded flex items-center gap-1.5 shadow-sm">
            <Info className="w-3.5 h-3.5 text-[#6B6B6B]" />
            <span>Staffing Models:</span>
            <strong className="text-[#1A1A1A] font-medium">1:4 RN | 1:6 MD</strong>
          </div>
        </div>
      </div>

      {/* Primary Constraint Alert Banner */}
      {bottlenecks.primary && (
        <div className="bg-[#FEF6EE] border border-[#F9DBAF] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-md bg-[#F79009]/15 text-[#B54708] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFFAEB] text-[#B54708] px-2 py-0.5 rounded border border-[#FEDF89]">
                  Primary Operational Constraint
                </span>
                <span className="text-xs font-bold text-[#1A1A1A]">
                  {bottlenecks.primary.label}
                </span>
              </div>
              <p className="text-xs text-[#7A3E08] mt-1 font-medium">
                {bottlenecks.primary.impact || bottlenecks.primary.impactDetail}
              </p>
              <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                Recommended Action: <span className="font-semibold text-[#1A1A1A]">{bottlenecks.primary.mitigation || 'Expedite patient transitions and balance capacity.'}</span>
              </p>
            </div>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('what-if')}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded bg-white text-[#1B74E4] hover:bg-[#F8F9FA] border border-[#D0D5DD] transition-colors shrink-0 shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5" />
              Simulate Surge In What-If
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 4 Refined Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {bottlenecks.all.map((item) => {
          const meta = resourceMeta[item.resource] || {
            name: item.label,
            shortName: item.label,
            icon: Activity,
            unit: 'units',
            ratio: 'Standard operational model',
            category: 'Resource',
            description: 'Operational ED asset',
            recommendedBuffer: 'Adequate operational margin',
          };
          const Icon = meta.icon;
          const isSelected = selectedResource === item.resource;
          const gapInfo = getGapMeaning(item.gap, item.available, item.required);

          const isCritical = item.status === 'critical';
          const isWarning = item.status === 'warning';

          // Color for progress meter
          const barColor = isCritical
            ? 'bg-[#D92D20]'
            : isWarning
            ? 'bg-[#F79009]'
            : 'bg-[#12B76A]';

          return (
            <div
              key={item.resource}
              onClick={() => setSelectedResource(item.resource)}
              className={`p-5 rounded-lg border bg-white cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#1B74E4] ring-2 ring-[#1B74E4]/15 shadow-sm'
                  : item.isPrimary
                  ? 'border-[#FECDCA] hover:border-[#FDA29B]'
                  : 'border-[#E8E4DF] hover:border-[#D0D5DD]'
              }`}
            >
              {/* Card Top: Icon, Titles, Badges */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      item.isPrimary
                        ? 'bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA]'
                        : 'bg-[#EAF4FF] text-[#1B74E4] border border-[#D0E6FC]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#1A1A1A]">{meta.name}</h3>
                      {item.isPrimary && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#D92D20] bg-[#FEF3F2] px-1.5 py-0.5 rounded border border-[#FECDCA]">
                          Constrained
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B6B6B] mt-0.5">{meta.ratio}</p>
                  </div>
                </div>

                <div>{getStatusBadge(item.status)}</div>
              </div>

              {/* Utilization Progress Section */}
              <div className="space-y-2 mb-4 bg-[#FAFAF8] p-3 rounded-md border border-[#E8E4DF]/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6B6B6B] flex items-center gap-1 font-medium">
                    <TrendingUp className="w-3.5 h-3.5 text-[#1B74E4]" />
                    Projected Utilization (+2h)
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[11px] text-[#6B6B6B]">
                      (Current: <span className="font-mono">{item.currentUtilization.toFixed(0)}%</span>)
                    </span>
                    <strong
                      className={`font-mono text-sm ${
                        isCritical
                          ? 'text-[#D92D20]'
                          : isWarning
                          ? 'text-[#B54708]'
                          : 'text-[#0E7A4E]'
                      }`}
                    >
                      {item.projectedUtilization.toFixed(0)}%
                    </strong>
                  </div>
                </div>

                {/* Progress Bar with 80% Safe Buffer reference line */}
                <div className="relative w-full h-2 bg-[#E8E4DF] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${barColor}`}
                    style={{ width: `${Math.min(100, Math.max(0, item.projectedUtilization))}%` }}
                  />
                  {/* Safe Target 80% threshold notch */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-[#1A1A1A]/40 z-10"
                    style={{ left: '80%' }}
                    title="80% Target Operating Ceiling"
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-[#6B6B6B]">
                  <span>0%</span>
                  <span className="text-[9px] text-[#6B6B6B]/80 font-mono">80% Target Ceiling</span>
                  <span>100% Max</span>
                </div>
              </div>

              {/* Key Capacity Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#E8E4DF] text-center">
                <div className="px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] block">
                    Available Supply
                  </span>
                  <span className="font-mono text-base font-bold text-[#1A1A1A] block mt-0.5">
                    {item.available}
                  </span>
                  <span className="text-[10px] text-[#6B6B6B] truncate block">{meta.unit}</span>
                </div>

                <div className="px-1 border-x border-[#E8E4DF]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] block">
                    Required Demand
                  </span>
                  <span className="font-mono text-base font-bold text-[#1A1A1A] block mt-0.5">
                    {item.required}
                  </span>
                  <span className="text-[10px] text-[#6B6B6B] truncate block">at +2h peak</span>
                </div>

                <div className="px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] block">
                    Net Gap
                  </span>
                  <span
                    className={`font-mono text-base font-bold block mt-0.5 ${
                      item.gap < 0
                        ? 'text-[#D92D20]'
                        : item.gap === 0
                        ? 'text-[#B54708]'
                        : 'text-[#0E7A4E]'
                    }`}
                  >
                    {item.gap > 0 ? `+${item.gap}` : item.gap}
                  </span>
                  <span className="text-[10px] text-[#6B6B6B] truncate block">
                    {item.gap < 0 ? 'Shortage' : item.gap === 0 ? '0 Reserve' : 'Surplus'}
                  </span>
                </div>
              </div>

              {/* Gap Interpretation & Operational Meaning */}
              <div className="mt-3 pt-1">
                <div className={`p-2 rounded border text-xs ${gapInfo.bg}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${gapInfo.color}`}>{gapInfo.label}</span>
                    <span className="text-[10px] text-[#6B6B6B]">{meta.recommendedBuffer}</span>
                  </div>
                  <p className="text-[11px] text-[#4A4A4A] mt-1 leading-snug">{gapInfo.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Cross-Resource Utilization Comparison */}
      <div className="bg-white border border-[#E8E4DF] rounded-lg p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E8E4DF]">
          <div>
            <h2 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#1B74E4]" />
              Comparative Resource Utilization & Expansion Dynamics
            </h2>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Side-by-side comparison of baseline load versus +2h projected demand against the 80% operational safety ceiling.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#6B6B6B]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#9E77ED]" />
              <span>Current Load</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#1B74E4]" />
              <span>Projected (+2h)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#D92D20]" />
              <span>80% Target</span>
            </div>
          </div>
        </div>

        {/* Grouped Horizontal Bars */}
        <div className="space-y-4 pt-4">
          {bottlenecks.all.map((item) => {
            const meta = resourceMeta[item.resource];
            const currentPct = Math.min(100, item.currentUtilization);
            const projectedPct = Math.min(100, item.projectedUtilization);
            const delta = item.projectedUtilization - item.currentUtilization;

            return (
              <div key={item.resource} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1A1A1A] w-36 sm:w-44 truncate">
                      {meta?.name || item.label}
                    </span>
                    <span className="text-[11px] text-[#6B6B6B] hidden sm:inline">
                      ({item.available} {meta?.unit})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-[#6941C6]">
                      Curr: <strong>{currentPct.toFixed(0)}%</strong>
                    </span>
                    <span className="text-[#1A1A1A] font-bold">
                      Proj: <strong className={projectedPct >= 95 ? 'text-[#D92D20]' : projectedPct >= 85 ? 'text-[#B54708]' : 'text-[#0E7A4E]'}>
                        {projectedPct.toFixed(0)}%
                      </strong>
                    </span>
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded font-sans font-medium ${
                        delta > 0
                          ? 'bg-[#FEF3F2] text-[#B42318]'
                          : delta < 0
                          ? 'bg-[#ECFDF3] text-[#0E7A4E]'
                          : 'bg-[#F8F9FA] text-[#6B6B6B]'
                      }`}
                    >
                      {delta > 0 ? `+${delta.toFixed(0)}%` : `${delta.toFixed(0)}%`}
                    </span>
                  </div>
                </div>

                {/* Paired Bar Display */}
                <div className="relative w-full space-y-1 bg-[#FAFAF8] p-2 rounded border border-[#E8E4DF]/70">
                  {/* Current Load Bar */}
                  <div className="relative w-full h-2 bg-[#E8E4DF] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#9E77ED] rounded-full transition-all"
                      style={{ width: `${currentPct}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-[#D92D20]/70 z-10"
                      style={{ left: '80%' }}
                    />
                  </div>
                  {/* Projected Load Bar */}
                  <div className="relative w-full h-2.5 bg-[#E8E4DF] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        projectedPct >= 95
                          ? 'bg-[#D92D20]'
                          : projectedPct >= 85
                          ? 'bg-[#F79009]'
                          : 'bg-[#1B74E4]'
                      }`}
                      style={{ width: `${projectedPct}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-[#D92D20]/70 z-10"
                      style={{ left: '80%' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Resource Allocation & Capacity Matrix Table */}
      <div className="bg-white border border-[#E8E4DF] rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#E8E4DF] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#1A1A1A]">
              Detailed Resource Allocation & Gap Matrix
            </h2>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Deterministic calculations based on current hospital census and projected +2h arrival rates.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#6B6B6B] bg-[#FAFAF8] border border-[#E8E4DF] px-2.5 py-1 rounded">
            Baseline Census: {currentRecord.currentOccupancy}/{currentRecord.totalBeds} Beds ({Math.round((currentRecord.currentOccupancy / currentRecord.totalBeds) * 100)}%)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#1A1A1A]">
            <thead className="bg-[#FAFAF8] text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] border-b border-[#E8E4DF]">
              <tr>
                <th className="px-4 py-3">Resource Asset</th>
                <th className="px-4 py-3">Operational Ratio</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Current Load</th>
                <th className="px-4 py-3 text-right">Projected (+2h)</th>
                <th className="px-4 py-3 text-right">Supply</th>
                <th className="px-4 py-3 text-right">Demand</th>
                <th className="px-4 py-3 text-right">Net Gap</th>
                <th className="px-4 py-3">Operational Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DF]">
              {bottlenecks.all.map((r) => {
                const meta = resourceMeta[r.resource];
                const gapInfo = getGapMeaning(r.gap, r.available, r.required);
                const isSelected = selectedResource === r.resource;

                return (
                  <tr
                    key={r.resource}
                    onClick={() => setSelectedResource(r.resource)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#F2F7FE]'
                        : 'hover:bg-[#FAFAF8]'
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span>{r.label}</span>
                        {r.isPrimary && (
                          <span className="text-[9px] font-bold uppercase text-[#D92D20] bg-[#FEF3F2] px-1.5 py-0.2 rounded border border-[#FECDCA]">
                            Primary
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#6B6B6B] font-normal block">
                        {meta?.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#6B6B6B]">
                      {meta?.ratio || 'Standard ratio'}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(r.status)}</td>
                    <td className="px-4 py-3 text-right font-mono text-[#6B6B6B]">
                      {r.currentUtilization.toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      <span
                        className={
                          r.projectedUtilization >= 95
                            ? 'text-[#D92D20]'
                            : r.projectedUtilization >= 85
                            ? 'text-[#B54708]'
                            : 'text-[#0E7A4E]'
                        }
                      >
                        {r.projectedUtilization.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{r.available}</td>
                    <td className="px-4 py-3 text-right font-mono">{r.required}</td>
                    <td
                      className={`px-4 py-3 text-right font-mono font-bold ${
                        r.gap < 0
                          ? 'text-[#D92D20]'
                          : r.gap === 0
                          ? 'text-[#B54708]'
                          : 'text-[#0E7A4E]'
                      }`}
                    >
                      {r.gap > 0 ? `+${r.gap}` : r.gap}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${gapInfo.bg} ${gapInfo.color}`}
                      >
                        {gapInfo.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footnote on Clinical Assumptions */}
        <div className="p-3 bg-[#FAFAF8] border-t border-[#E8E4DF] text-[11px] text-[#6B6B6B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#1B74E4] shrink-0" />
            <span>
              <strong>Clinical Staffing Standard:</strong> Bed utilization is physical monitored capacity. Nursing requirements assume mandated 1:4 ratios. Physician coverage assumes 1:6 provider ratios. Diagnostic queues reflect stat orders.
            </span>
          </div>
          <span className="text-[10px] text-[#6B6B6B] shrink-0">
            Validated against ACEP & ENA operational recommendations.
          </span>
        </div>
      </div>

      {/* Actionable Scenario & Navigation Interventions */}
      {onNavigate && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E8E4DF] rounded-lg p-4 flex flex-col justify-between hover:border-[#1B74E4] transition-all group">
            <div>
              <div className="w-8 h-8 rounded bg-[#EAF4FF] text-[#1B74E4] flex items-center justify-center mb-2">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#1B74E4] transition-colors">
                What-If Simulator
              </h3>
              <p className="text-xs text-[#6B6B6B] mt-1">
                Model staff reallocations, rapid-discharge rounds, or surge beds to test relief of the primary constraint.
              </p>
            </div>
            <button
              onClick={() => onNavigate('what-if')}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#1B74E4] hover:underline"
            >
              Launch Simulator
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white border border-[#E8E4DF] rounded-lg p-4 flex flex-col justify-between hover:border-[#1B74E4] transition-all group">
            <div>
              <div className="w-8 h-8 rounded bg-[#FEF6EE] text-[#B54708] flex items-center justify-center mb-2">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#1B74E4] transition-colors">
                Forecast & Inputs
              </h3>
              <p className="text-xs text-[#6B6B6B] mt-1">
                Examine raw Poisson arrival forecasts, shift change schedules, and day-of-week demand distributions.
              </p>
            </div>
            <button
              onClick={() => onNavigate('forecast-inputs')}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#1B74E4] hover:underline"
            >
              Inspect Demand Inputs
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white border border-[#E8E4DF] rounded-lg p-4 flex flex-col justify-between hover:border-[#1B74E4] transition-all group">
            <div>
              <div className="w-8 h-8 rounded bg-[#ECFDF3] text-[#0E7A4E] flex items-center justify-center mb-2">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#1B74E4] transition-colors">
                Patient Flow (7 Stages)
              </h3>
              <p className="text-xs text-[#6B6B6B] mt-1">
                Trace how bed shortages cascade upstream into triage backlogs and ambulance offload delays (AOD).
              </p>
            </div>
            <button
              onClick={() => onNavigate('patient-flow')}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#1B74E4] hover:underline"
            >
              Analyze Cascades
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
