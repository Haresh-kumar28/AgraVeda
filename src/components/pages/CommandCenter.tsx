import React from 'react';
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
  const occPct = Math.round((currentRecord.currentOccupancy / Math.max(1, currentRecord.totalBeds)) * 100);
  const primaryBneck = bottlenecks.primary;
  const topRec = recommendations[0];

  const scenarioLabels: Record<string, string> = {
    normal: 'Normal Baseline Demand',
    accident_surge: 'Accident Surge (+80%)',
    weekend_peak: 'Weekend Peak (+10%)',
    outbreak: 'Community Outbreak (+50%)',
    custom: 'Custom Scenario',
  };

  return (
    <div className="space-y-6">
      {/* 1. Header greeting & operational context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#222222]">
              Emergency Department Overview
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B74E4] bg-[#EAF4FF] px-2 py-0.5 rounded-sm">
              Live Demo
            </span>
          </div>
          <p className="text-xs text-[#727272] mt-1">
            {user?.organization || 'MetroHealth System'} · Logged in as{' '}
            <strong className="text-[#222222]">{user ? ROLE_LABELS[user.role] : 'Staff'}</strong> · Data window: Last 24h & 6h predictive horizon.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium text-[#727272] bg-[#F8F9FA] border border-[#EAEAEA] px-2.5 py-1 rounded">
            Scenario: <strong className="text-[#222222]">{scenarioLabels[scenario] || scenario}</strong>
          </span>
          <button
            onClick={() => onNavigate('scenarios')}
            className="text-xs text-[#1B74E4] hover:underline font-semibold px-2 py-1"
          >
            Switch Scenario
          </button>
        </div>
      </div>

      {/* 2. Three or Four Primary Measures Maximum (No Wall of Cards Clutter) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Current Inflow */}
        <div className="p-4 bg-white border border-[#EAEAEA] rounded-md space-y-2">
          <div className="flex items-center justify-between text-xs text-[#727272]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Arrival Rate</span>
            <Users className="w-4 h-4 text-[#1B74E4]" />
          </div>
          <div className="text-3xl font-bold text-[#222222] tracking-tight">
            {currentRecord.arrivals}
            <span className="text-sm font-normal text-[#727272] ml-1">/hr</span>
          </div>
          <div className="text-[11px] text-[#727272]">
            {currentRecord.waitingPatients} patients currently in waiting queue
          </div>
        </div>

        {/* Metric 2: Occupancy */}
        <div className="p-4 bg-white border border-[#EAEAEA] rounded-md space-y-2">
          <div className="flex items-center justify-between text-xs text-[#727272]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Bed Occupancy</span>
            <Bed className="w-4 h-4 text-[#1B74E4]" />
          </div>
          <div className="text-3xl font-bold text-[#222222] tracking-tight">
            {occPct}%
          </div>
          <div className="text-[11px] text-[#727272]">
            {currentRecord.currentOccupancy} of {currentRecord.totalBeds} treatment beds filled
          </div>
        </div>

        {/* Metric 3: Available Reserve */}
        <div className="p-4 bg-white border border-[#EAEAEA] rounded-md space-y-2">
          <div className="flex items-center justify-between text-xs text-[#727272]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Beds Available</span>
            <Activity className="w-4 h-4 text-[#1B74E4]" />
          </div>
          <div className={`text-3xl font-bold tracking-tight ${
            currentRecord.availableBeds < 5 ? 'text-[#B42318]' : 'text-[#222222]'
          }`}>
            {currentRecord.availableBeds}
          </div>
          <div className="text-[11px] text-[#727272]">
            {currentRecord.availableBeds < 5 ? (
              <span className="text-[#B42318] font-medium">Reserve beds depleted</span>
            ) : (
              'Adequate buffer available'
            )}
          </div>
        </div>

        {/* Metric 4: Average Wait proxy */}
        <div className="p-4 bg-white border border-[#EAEAEA] rounded-md space-y-2">
          <div className="flex items-center justify-between text-xs text-[#727272]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Average Wait</span>
            <Clock className="w-4 h-4 text-[#1B74E4]" />
          </div>
          <div className="text-3xl font-bold text-[#222222] tracking-tight">
            {currentRecord.averageWaitTime}
            <span className="text-sm font-normal text-[#727272] ml-1">min</span>
          </div>
          <div className="text-[11px] text-[#727272]">
            Assessment time from arrival to first clinician
          </div>
        </div>
      </div>

      {/* 3. Seven-Stage Compact Patient Flow Strip */}
      <div className="p-4 bg-white border border-[#EAEAEA] rounded-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#222222]">
              Emergency Patient Flow Journey
            </span>
            <span className="text-[11px] text-[#727272]">· 7 Standard Stages</span>
          </div>
          <button
            onClick={() => onNavigate('patient-flow')}
            className="text-xs text-[#1B74E4] hover:underline font-semibold flex items-center gap-1"
          >
            <span>View Full Flow Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
          {[
            { name: '1. Arrival', val: `${currentRecord.arrivals}/hr`, sub: 'Incoming demand' },
            { name: '2. Triage', val: '100%', sub: 'Triage complete' },
            { name: '3. Waiting', val: `${currentRecord.waitingPatients} pts`, sub: 'Queue depth', warn: currentRecord.waitingPatients > 12 },
            { name: '4. Assessment', val: `${currentRecord.doctorsAvailable} docs`, sub: 'Physicians on duty' },
            { name: '5. Diagnostics', val: `${currentRecord.diagnosticQueue} pts`, sub: 'Imaging / lab queue' },
            { name: '6. Treatment', val: `${currentRecord.currentOccupancy}/${currentRecord.totalBeds}`, sub: 'Active beds', warn: occPct > 85 },
            { name: '7. Disposition', val: `${currentRecord.departures}/hr`, sub: 'Discharges & admits' },
          ].map((stage, _idx) => (
            <div
              key={stage.name}
              className={`p-2.5 rounded border text-left transition-colors ${
                stage.warn
                  ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]'
                  : 'bg-[#F8F9FA] border-[#EAEAEA] text-[#222222]'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#727272] truncate">
                {stage.name}
              </div>
              <div className="text-sm font-bold mt-1 truncate">{stage.val}</div>
              <div className="text-[10px] text-[#727272] truncate mt-0.5">{stage.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Principal Visualization (Forecast) & Operational Summary (Pressure) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 6-Hour Arrival Forecast (8 cols) */}
        <div className="lg:col-span-8 p-5 bg-white border border-[#EAEAEA] rounded-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#222222]">
                6-Hour Patient Arrival Forecast
              </h2>
              <p className="text-xs text-[#727272] mt-0.5">
                Past 8 hours actual volume compared with projected arrivals by hourly horizon.
              </p>
            </div>
            <button
              onClick={() => onNavigate('forecast-inputs')}
              className="h-8 px-3 rounded border border-[#EAEAEA] hover:border-[#1B74E4] text-xs font-semibold text-[#222222] transition-colors self-start sm:self-auto"
            >
              Adjust Inputs
            </button>
          </div>

          <ForecastChart forecast={forecast} recentData={recentData} scenario={scenario} />
        </div>

        {/* Right: Operational Pressure & Next Constraint (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 bg-white border border-[#EAEAEA] rounded-md">
            <PressureIndicator pressure={pressure} />
          </div>

          <div className="p-5 bg-white border border-[#EAEAEA] rounded-md">
            <BottleneckPanel bottlenecks={bottlenecks} />
          </div>
        </div>
      </div>

      {/* 5. Top Attention Items & Proactive Decision Support */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recommended Action (7 cols) */}
        <div className="lg:col-span-7 p-5 bg-white border border-[#EAEAEA] rounded-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#222222]">
                Recommended Operational Action
              </h2>
              <p className="text-xs text-[#727272] mt-0.5">
                Explainable intervention based on current constraint ({primaryBneck.label})
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B74E4] bg-[#EAF4FF] px-2 py-0.5 rounded-sm">
              Advisory
            </span>
          </div>

          <div className="p-4 bg-[#F8F9FA] border border-[#EAEAEA] rounded-md space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white border border-[#EAEAEA] text-[#222222]">
                {topRec?.urgency || pressure.level}
              </span>
              <span className="text-xs font-semibold text-[#727272]">
                Constraint Area: {primaryBneck.label}
              </span>
            </div>

            <h3 className="text-sm font-bold text-[#222222]">
              {topRec?.what || `Review ${primaryBneck.label} Capacity`}
            </h3>

            <p className="text-xs text-[#727272] leading-relaxed">
              {topRec?.action || 'Evaluate bed turnover and on-call nurse staffing before the forecast window peaks.'}
            </p>

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
                className="h-8 px-3 rounded bg-white border border-[#EAEAEA] hover:bg-[#F8F9FA] text-xs font-semibold text-[#222222] transition-colors cursor-pointer"
              >
                View Full Decision Brief
              </button>
            </div>
          </div>
        </div>

        {/* Operational Signals Summary (5 cols) */}
        <div className="lg:col-span-5 p-5 bg-white border border-[#EAEAEA] rounded-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#222222]">Key Operational Signals</h2>
            <button
              onClick={() => onNavigate('decisions')}
              className="text-xs text-[#1B74E4] hover:underline font-semibold"
            >
              See all
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 bg-[#F8F9FA] border border-[#EAEAEA] rounded flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-[#B54708] shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#222222]">
                  {primaryBneck.label} Constriction
                </div>
                <div className="text-[11px] text-[#727272] mt-0.5">
                  Projected utilization reaches {primaryBneck.projectedUtilization.toFixed(0)}% in +2h.
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#F8F9FA] border border-[#EAEAEA] rounded flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#1B74E4] shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#222222]">Time-to-Impact Window</div>
                <div className="text-[11px] text-[#727272] mt-0.5">
                  Intervention recommended within next {pressure.timeToImpact !== 'N/A' ? pressure.timeToImpact : '60-90 minutes'}.
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#F8F9FA] border border-[#EAEAEA] rounded flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-[#0E7A4E] shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#222222]">Data Integrity Status</div>
                <div className="text-[11px] text-[#727272] mt-0.5">
                  100% record completeness on 14-day synthetic temporal baseline.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
