import React, { useState, useMemo } from 'react';
import { SimulationInputs, inputsFromRecord, applyInputsToRecord, applyScenario } from '../../types';
import { PressureResult, calculatePressure } from '../../engines/pressureEngine';
import { BottleneckResult, analyzeBottlenecks } from '../../engines/bottleneckEngine';
import { ForecastResult, generateForecast } from '../../engines/forecastEngine';
import { EDRecord, syntheticData, getLatestRecord } from '../../data/syntheticData';
import {
  Activity,
  AlertTriangle,
  Biohazard,
  Calendar,
  Settings,
  Zap,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sliders,
  TrendingUp,
  Clock,
  ShieldAlert,
  Info,
  ChevronRight,
  Layers,
  BarChart3,
  Check,
} from 'lucide-react';

export interface ScenariosPageProps {
  currentScenario: SimulationInputs['scenario'];
  onSelectScenario: (scenario: SimulationInputs['scenario']) => void;
  onReset?: () => void;
  onNavigate?: (page: string) => void;
  baselineRecord?: EDRecord;
  currentRecord?: EDRecord;
  currentInputs?: SimulationInputs;
  pressure: PressureResult;
  bottlenecks: BottleneckResult;
  forecast: ForecastResult;
}

interface ScenarioDefinition {
  id: SimulationInputs['scenario'];
  name: string;
  icon: React.ElementType;
  description: string;
  multiplierText: string;
  multiplierValue: number;
  acuity: string;
  badgeColor: string;
  iconColor: string;
  iconBg: string;
  clinicalContext: string;
}

const SCENARIO_DEFINITIONS: ScenarioDefinition[] = [
  {
    id: 'normal',
    name: 'Normal Demand Baseline',
    icon: Activity,
    description: 'Typical emergency department operations and expected weekday arrival distribution.',
    multiplierText: '1.0x baseline',
    multiplierValue: 1.0,
    acuity: 'Standard acuity mix (20% High, 45% Med, 35% Low)',
    badgeColor: 'bg-[#EAF4FF] text-[#1B74E4] border-[#B2DDFF]',
    iconColor: 'text-[#1B74E4]',
    iconBg: 'bg-[#EAF4FF]',
    clinicalContext: 'Standard operating baseline. Regular scheduled physician and nursing shifts.',
  },
  {
    id: 'weekend_peak',
    name: 'Weekend Volume Peak',
    icon: Calendar,
    description: 'Elevated patient volume typical of weekend afternoons with community and recreational trauma.',
    multiplierText: '1.1x (+10% arrivals)',
    multiplierValue: 1.1,
    acuity: 'Increased fast-track queue & minor trauma (ESI 4 & 5)',
    badgeColor: 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]',
    iconColor: 'text-[#175CD3]',
    iconBg: 'bg-[#EFF8FF]',
    clinicalContext: 'Predictable weekend surge. Inpatient discharge bottlenecks delay bed turnover.',
  },
  {
    id: 'accident_surge',
    name: 'Mass Casualty / Highway Collision',
    icon: AlertTriangle,
    description: 'Acute sudden surge from a multi-vehicle accident or external disaster with concentrated high acuity.',
    multiplierText: '1.8x (+80% arrivals)',
    multiplierValue: 1.8,
    acuity: 'Critical resuscitation spike (ESI 1 & 2 trauma surge)',
    badgeColor: 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]',
    iconColor: 'text-[#B42318]',
    iconBg: 'bg-[#FEF3F2]',
    clinicalContext: 'Severe trauma arrival cluster requiring simultaneous resuscitation bays and trauma surgeon call-in.',
  },
  {
    id: 'outbreak',
    name: 'Community Respiratory Outbreak',
    icon: Biohazard,
    description: 'Sustained elevated volume across several shifts resulting in bed boarding and wait queue buildup.',
    multiplierText: '1.5x (+50% arrivals)',
    multiplierValue: 1.5,
    acuity: 'Sustained moderate & respiratory acuity (ESI 2 & 3)',
    badgeColor: 'bg-[#FDF2FA] text-[#C11574] border-[#FCCEEE]',
    iconColor: 'text-[#C11574]',
    iconBg: 'bg-[#FDF2FA]',
    clinicalContext: 'Prolonged high inpatient bed utilization with isolation requirements and stat laboratory backlogs.',
  },
  {
    id: 'custom',
    name: 'Custom Parameter Model',
    icon: Settings,
    description: 'Manually configure individual parameters in the Forecast & Inputs module.',
    multiplierText: 'Custom configuration',
    multiplierValue: 1.0,
    acuity: 'User-specified analytical parameters',
    badgeColor: 'bg-[#F8F9FA] text-[#344054] border-[#D0D5DD]',
    iconColor: 'text-[#344054]',
    iconBg: 'bg-[#F8F9FA]',
    clinicalContext: 'Flexible stress-test environment calibrated through Forecast & Inputs controls.',
  },
];

export const ScenariosPage: React.FC<ScenariosPageProps> = ({
  currentScenario,
  onSelectScenario,
  onReset,
  onNavigate,
  baselineRecord: propBaselineRecord,
  currentInputs: propCurrentInputs,
  pressure: activePressure,
  bottlenecks: activeBottlenecks,
  forecast: activeForecast,
}) => {
  // 1. Establish deterministic baseline record
  const baselineRec = useMemo(() => {
    return propBaselineRecord || getLatestRecord(syntheticData);
  }, [propBaselineRecord]);

  const defaultInputs = useMemo(() => inputsFromRecord(baselineRec), [baselineRec]);

  // 2. Local state for PREVIEWING scenario before applying
  const [previewScenario, setPreviewScenario] = useState<SimulationInputs['scenario']>(currentScenario);
  const [justApplied, setJustApplied] = useState(false);

  // 3. Compute Baseline Models (Normal 1.0x baseline)
  const baselineModel = useMemo(() => {
    const baseInputs = applyScenario(defaultInputs, 'normal');
    const rec = applyInputsToRecord(baselineRec, baseInputs);
    const fc = generateForecast(syntheticData, rec, 'normal');
    const pr = calculatePressure(rec, fc.forecasts);
    const bn = analyzeBottlenecks(rec, fc.forecasts);
    return { inputs: baseInputs, record: rec, forecast: fc, pressure: pr, bottlenecks: bn };
  }, [defaultInputs, baselineRec]);

  // 4. Compute Preview Scenario Models (without mutating application state)
  const previewModel = useMemo(() => {
    let prevInputs: SimulationInputs;
    if (previewScenario === 'custom' && propCurrentInputs) {
      prevInputs = { ...propCurrentInputs, scenario: 'custom' };
    } else {
      prevInputs = applyScenario(defaultInputs, previewScenario);
    }
    const rec = applyInputsToRecord(baselineRec, prevInputs);
    const scenarioStr = previewScenario === 'outbreak' || previewScenario === 'custom' ? 'normal' : previewScenario;
    const fc = generateForecast(syntheticData, rec, scenarioStr);
    const pr = calculatePressure(rec, fc.forecasts);
    const bn = analyzeBottlenecks(rec, fc.forecasts);
    return { inputs: prevInputs, record: rec, forecast: fc, pressure: pr, bottlenecks: bn };
  }, [previewScenario, defaultInputs, baselineRec, propCurrentInputs]);

  // Forecast points at +2h
  const base2h = baselineModel.forecast.forecasts.find((f) => f.hoursAhead === 2);
  const prev2h = previewModel.forecast.forecasts.find((f) => f.hoursAhead === 2);

  const baseOcc2h = base2h?.predictedOccupancy ?? baselineModel.record.currentOccupancy;
  const prevOcc2h = prev2h?.predictedOccupancy ?? previewModel.record.currentOccupancy;

  const baseArrivals2h = base2h?.predictedArrivals ?? baselineModel.record.arrivals;
  const prevArrivals2h = prev2h?.predictedArrivals ?? previewModel.record.arrivals;

  // Selected definition
  const selectedDef = SCENARIO_DEFINITIONS.find((s) => s.id === previewScenario) || SCENARIO_DEFINITIONS[0];
  const activeDef = SCENARIO_DEFINITIONS.find((s) => s.id === currentScenario) || SCENARIO_DEFINITIONS[0];
  const isCurrentlyApplied = currentScenario === previewScenario;

  // Handlers
  const handleApply = () => {
    onSelectScenario(previewScenario);
    setJustApplied(true);
    setTimeout(() => setJustApplied(false), 2500);
  };

  const handleResetBaseline = () => {
    setPreviewScenario('normal');
    if (onReset) {
      onReset();
    } else {
      onSelectScenario('normal');
    }
  };

  // Deltas between preview and baseline
  const deltaArrivals = previewModel.record.arrivals - baselineModel.record.arrivals;
  const pctArrivals = baselineModel.record.arrivals > 0
    ? Math.round((deltaArrivals / baselineModel.record.arrivals) * 100)
    : 0;

  const deltaPressure = previewModel.pressure.score - baselineModel.pressure.score;
  const deltaOcc2h = prevOcc2h - baseOcc2h;
  const pctOcc2h = baseOcc2h > 0 ? Math.round((deltaOcc2h / baseOcc2h) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DF]">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#1B74E4]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Operational Demand Scenarios & Stress Testing
            </h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Compare predefined hospital surge situations against standard baseline operations without mutating active clinical parameters until applied.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Active Status Badge */}
          <div className="text-xs text-[#6B6B6B] bg-white border border-[#E8E4DF] px-3 py-1.5 rounded flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse" />
            <span>Active in ED:</span>
            <strong className="text-[#1B74E4] font-semibold uppercase">{activeDef.name}</strong>
          </div>

          {/* Reset Baseline Action */}
          <button
            onClick={handleResetBaseline}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded bg-white text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#FAFAF8] border border-[#E8E4DF] transition-colors shadow-sm"
            title="Reset operational parameters to normal baseline"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#6B6B6B]" />
            Reset to Baseline
          </button>
        </div>
      </div>

      {/* Scenario Selection Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1B74E4]" />
            <h2 className="text-sm font-bold text-[#1A1A1A]">
              Select Scenario to Inspect or Apply
            </h2>
          </div>
          <span className="text-xs text-[#6B6B6B]">
            Click any card to preview impact calculations below
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCENARIO_DEFINITIONS.map((s) => {
            const isPreviewing = previewScenario === s.id;
            const isLive = currentScenario === s.id;
            const Icon = s.icon;

            return (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                onClick={() => setPreviewScenario(s.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPreviewScenario(s.id);
                  }
                }}
                className={`p-5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between text-left focus:outline-none focus:ring-2 focus:ring-[#1B74E4] ${
                  isPreviewing
                    ? 'bg-white border-[#1B74E4] ring-2 ring-[#1B74E4]/20 shadow-md'
                    : isLive
                    ? 'bg-[#F2F7FE]/40 border-[#B2DDFF]'
                    : 'bg-white border-[#E8E4DF] hover:border-[#B6B6B6] hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg ${s.iconBg} ${s.iconColor} flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isLive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-[#ECFDF3] text-[#0E7A4E] border border-[#A6F4C5]">
                          <Check className="w-3 h-3 text-[#12B76A]" />
                          Active in ED
                        </span>
                      )}
                      {isPreviewing && !isLive && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-[#EAF4FF] text-[#1B74E4] border border-[#B2DDFF]">
                          Previewing
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#1A1A1A]">{s.name}</h3>
                  <p className="text-xs text-[#6B6B6B] mt-1.5 leading-relaxed line-clamp-2">
                    {s.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8E4DF] space-y-1.5 text-[11px] text-[#6B6B6B]">
                  <div className="flex justify-between items-center">
                    <span>Demand Multiplier:</span>
                    <strong className="text-[#1A1A1A] font-mono">{s.multiplierText}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Acuity Profile:</span>
                    <span className="text-[#1A1A1A] font-medium truncate max-w-[170px]" title={s.acuity}>
                      {s.acuity}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Scenario Preview & Application Banner */}
      <div className="bg-white border border-[#E8E4DF] rounded-lg p-5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DF]">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg ${selectedDef.iconBg} ${selectedDef.iconColor} flex items-center justify-center shrink-0 mt-0.5`}>
              <selectedDef.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">
                  Inspecting Scenario:
                </span>
                <span className="text-base font-bold text-[#1A1A1A]">
                  {selectedDef.name}
                </span>
                {isCurrentlyApplied ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-[#ECFDF3] text-[#0E7A4E] border border-[#A6F4C5]">
                    <CheckCircle2 className="w-3 h-3 text-[#12B76A]" />
                    Currently Applied to Operational ED
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]">
                    Simulated Preview (Not yet applied)
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B6B6B] mt-1 font-medium">
                {selectedDef.clinicalContext}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            {previewScenario === 'custom' && onNavigate && (
              <button
                onClick={() => onNavigate('forecast-inputs')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded bg-[#FAFAF8] text-[#344054] hover:bg-[#F2F4F7] border border-[#D0D5DD] transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                Edit Parameters in Inputs
              </button>
            )}

            <button
              onClick={handleApply}
              disabled={isCurrentlyApplied}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded shadow-sm transition-all ${
                isCurrentlyApplied
                  ? 'bg-[#F2F4F7] text-[#98A2B3] border border-[#EAECF0] cursor-not-allowed'
                  : 'bg-[#1B74E4] hover:bg-[#155EC0] text-white'
              }`}
            >
              {justApplied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  Applied to ED Engines!
                </>
              ) : isCurrentlyApplied ? (
                <>
                  <Check className="w-4 h-4 text-[#98A2B3]" />
                  Scenario Currently Active
                </>
              ) : (
                <>
                  Apply Scenario to Operations
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3-Card Summary Preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">
              Calculated Response Preview (+2h Planning Horizon)
            </h3>
            <span className="text-[11px] text-[#6B6B6B]">
              Deterministic outputs evaluated by AgraVeda analytical engine
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Operational Pressure Card */}
            <div className="p-4 bg-[#FAFAF8] rounded-lg border border-[#E8E4DF] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                    Operational Pressure
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                      previewModel.pressure.level === 'CRITICAL'
                        ? 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'
                        : previewModel.pressure.level === 'HIGH'
                        ? 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]'
                        : previewModel.pressure.level === 'WATCH'
                        ? 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]'
                        : 'bg-[#ECFDF3] text-[#0E7A4E] border-[#A6F4C5]'
                    }`}
                  >
                    {previewModel.pressure.level}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-2">
                  <div
                    className={`text-2xl font-bold font-mono ${
                      previewModel.pressure.level === 'CRITICAL'
                        ? 'text-[#B42318]'
                        : previewModel.pressure.level === 'HIGH'
                        ? 'text-[#B54708]'
                        : previewModel.pressure.level === 'WATCH'
                        ? 'text-[#B54708]'
                        : 'text-[#0E7A4E]'
                    }`}
                  >
                    {previewModel.pressure.score}
                    <span className="text-xs font-normal text-[#6B6B6B]">/100</span>
                  </div>
                  {deltaPressure !== 0 && (
                    <span
                      className={`text-xs font-semibold ${
                        deltaPressure > 0 ? 'text-[#B42318]' : 'text-[#0E7A4E]'
                      }`}
                    >
                      {deltaPressure > 0 ? `+${deltaPressure} pts` : `${deltaPressure} pts`}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-[#6B6B6B] mt-2 pt-2 border-t border-[#E8E4DF] flex items-center justify-between">
                <span>Time to Threshold:</span>
                <strong className="text-[#1A1A1A] font-medium">{previewModel.pressure.timeToImpact}</strong>
              </div>
            </div>

            {/* 2. Projected Occupancy Card */}
            <div className="p-4 bg-[#FAFAF8] rounded-lg border border-[#E8E4DF] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                    Projected Occupancy (+2h)
                  </span>
                  <span className="text-[10px] font-mono text-[#6B6B6B]">
                    Cap: {baselineRec.totalBeds} Beds
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-2">
                  <div className="text-2xl font-bold font-mono text-[#1A1A1A]">
                    {prevOcc2h.toFixed(0)}
                    <span className="text-xs font-normal text-[#6B6B6B]"> beds</span>
                  </div>
                  <span className="text-xs font-semibold text-[#6B6B6B]">
                    ({Math.round((prevOcc2h / baselineRec.totalBeds) * 100)}%)
                  </span>
                  {deltaOcc2h !== 0 && (
                    <span
                      className={`text-xs font-semibold ${
                        deltaOcc2h > 0 ? 'text-[#B42318]' : 'text-[#0E7A4E]'
                      }`}
                    >
                      {deltaOcc2h > 0 ? `+${deltaOcc2h} beds` : `${deltaOcc2h} beds`}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-[#6B6B6B] mt-2 pt-2 border-t border-[#E8E4DF] flex items-center justify-between">
                <span>Inflow Rate:</span>
                <strong className="text-[#1A1A1A] font-medium font-mono">{prevArrivals2h} arrivals/hr</strong>
              </div>
            </div>

            {/* 3. Primary Bottleneck Card */}
            <div className="p-4 bg-[#FAFAF8] rounded-lg border border-[#E8E4DF] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                    Primary Constraint
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                      previewModel.bottlenecks.primary.status === 'critical'
                        ? 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'
                        : 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]'
                    }`}
                  >
                    {previewModel.bottlenecks.primary.status}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-2">
                  <div className="text-xl font-bold text-[#1A1A1A] truncate">
                    {previewModel.bottlenecks.primary.label}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[#6B6B6B] mt-2 pt-2 border-t border-[#E8E4DF] flex items-center justify-between">
                <span>Projected Load:</span>
                <strong className="text-[#B42318] font-bold font-mono">
                  {previewModel.bottlenecks.primary.projectedUtilization.toFixed(0)}%
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Baseline vs. Scenario Comparative Matrix */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#1B74E4]" />
              Baseline vs. Scenario Comparative Matrix
            </h3>
            <span className="text-[11px] text-[#6B6B6B]">
              Evaluating impact relative to 1.0x Normal Demand Baseline
            </span>
          </div>

          <div className="border border-[#E8E4DF] rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left text-[#1A1A1A]">
              <thead className="bg-[#FAFAF8] text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] border-b border-[#E8E4DF]">
                <tr>
                  <th className="px-4 py-2.5">Operational Parameter</th>
                  <th className="px-4 py-2.5 text-right">Normal Baseline</th>
                  <th className="px-4 py-2.5 text-right bg-[#EAF4FF]/40 text-[#1B74E4]">
                    {selectedDef.name}
                  </th>
                  <th className="px-4 py-2.5 text-right">Absolute Change</th>
                  <th className="px-4 py-2.5 text-right">Relative Shift</th>
                  <th className="px-4 py-2.5">Operational Implication</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DF]">
                {/* 1. Expected Arrivals */}
                <tr className="hover:bg-[#FAFAF8]">
                  <td className="px-4 py-2.5 font-semibold">Incoming Arrival Rate</td>
                  <td className="px-4 py-2.5 text-right font-mono">{baselineModel.record.arrivals} / hr</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold bg-[#EAF4FF]/20 text-[#1B74E4]">
                    {previewModel.record.arrivals} / hr
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    <span className={deltaArrivals > 0 ? 'text-[#B42318] font-bold' : deltaArrivals < 0 ? 'text-[#0E7A4E]' : 'text-[#6B6B6B]'}>
                      {deltaArrivals > 0 ? `+${deltaArrivals}` : deltaArrivals} / hr
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    <span className={pctArrivals > 0 ? 'text-[#B42318] font-bold' : pctArrivals < 0 ? 'text-[#0E7A4E]' : 'text-[#6B6B6B]'}>
                      {pctArrivals > 0 ? `+${pctArrivals}%` : `${pctArrivals}%`}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[#6B6B6B]">
                    {deltaArrivals > 0 ? 'Surge triage volume elevates initial waiting queue.' : 'Standard triage inflow rate.'}
                  </td>
                </tr>

                {/* 2. Operational Pressure */}
                <tr className="hover:bg-[#FAFAF8]">
                  <td className="px-4 py-2.5 font-semibold">Operational Pressure Score</td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {baselineModel.pressure.score} ({baselineModel.pressure.level})
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold bg-[#EAF4FF]/20 text-[#1B74E4]">
                    {previewModel.pressure.score} ({previewModel.pressure.level})
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    <span className={deltaPressure > 0 ? 'text-[#B42318] font-bold' : deltaPressure < 0 ? 'text-[#0E7A4E]' : 'text-[#6B6B6B]'}>
                      {deltaPressure > 0 ? `+${deltaPressure} pts` : `${deltaPressure} pts`}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    <span className={deltaPressure > 0 ? 'text-[#B42318] font-bold' : 'text-[#6B6B6B]'}>
                      {baselineModel.pressure.score > 0
                        ? `${Math.round((deltaPressure / baselineModel.pressure.score) * 100)}%`
                        : '0%'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[#6B6B6B]">
                    Composite pressure across beds, wait queue, and provider staffing.
                  </td>
                </tr>

                {/* 3. Projected Occupancy */}
                <tr className="hover:bg-[#FAFAF8]">
                  <td className="px-4 py-2.5 font-semibold">Projected Occupancy (+2h)</td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {baseOcc2h} / {baselineRec.totalBeds} ({Math.round((baseOcc2h / baselineRec.totalBeds) * 100)}%)
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold bg-[#EAF4FF]/20 text-[#1B74E4]">
                    {prevOcc2h} / {baselineRec.totalBeds} ({Math.round((prevOcc2h / baselineRec.totalBeds) * 100)}%)
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    <span className={deltaOcc2h > 0 ? 'text-[#B42318] font-bold' : deltaOcc2h < 0 ? 'text-[#0E7A4E]' : 'text-[#6B6B6B]'}>
                      {deltaOcc2h > 0 ? `+${deltaOcc2h} beds` : `${deltaOcc2h} beds`}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    <span className={pctOcc2h > 0 ? 'text-[#B42318] font-bold' : 'text-[#6B6B6B]'}>
                      {pctOcc2h > 0 ? `+${pctOcc2h}%` : `${pctOcc2h}%`}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[#6B6B6B]">
                    {prevOcc2h >= baselineRec.totalBeds
                      ? 'Reaches 100% capacity ceiling; triggers boarding & EMS diversion alert.'
                      : 'Operates within licensed treatment capacity.'}
                  </td>
                </tr>

                {/* 4. Bed Gap */}
                {(() => {
                  const baseBeds = baselineModel.bottlenecks.all.find((b) => b.resource === 'beds');
                  const prevBeds = previewModel.bottlenecks.all.find((b) => b.resource === 'beds');
                  const baseGap = baseBeds?.gap ?? 0;
                  const prevGap = prevBeds?.gap ?? 0;
                  return (
                    <tr className="hover:bg-[#FAFAF8]">
                      <td className="px-4 py-2.5 font-semibold">Treatment Bed Reserve / Gap</td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        {baseGap > 0 ? `+${baseGap} spare` : `${baseGap} deficit`}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold bg-[#EAF4FF]/20 text-[#1B74E4]">
                        {prevGap > 0 ? `+${prevGap} spare` : `${prevGap} deficit`}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        <span className={prevGap < baseGap ? 'text-[#B42318] font-bold' : 'text-[#6B6B6B]'}>
                          {prevGap - baseGap} beds
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-[#6B6B6B]">
                        Util: {prevBeds?.projectedUtilization.toFixed(0)}%
                      </td>
                      <td className="px-4 py-2.5 text-[#6B6B6B]">
                        {prevGap < 0
                          ? `Immediate shortage of ${Math.abs(prevGap)} beds requiring surge discharge.`
                          : prevGap === 0
                          ? 'Zero reserve buffer. Any further arrival leads to ambulance hold.'
                          : 'Comfortable bed reserve buffer.'}
                      </td>
                    </tr>
                  );
                })()}

                {/* 5. Nursing Coverage */}
                {(() => {
                  const baseNurses = baselineModel.bottlenecks.all.find((b) => b.resource === 'nurses');
                  const prevNurses = previewModel.bottlenecks.all.find((b) => b.resource === 'nurses');
                  const baseGap = baseNurses?.gap ?? 0;
                  const prevGap = prevNurses?.gap ?? 0;
                  return (
                    <tr className="hover:bg-[#FAFAF8]">
                      <td className="px-4 py-2.5 font-semibold">Nursing Coverage (1:4 ratio)</td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        {baseNurses?.available} RNs (Gap: {baseGap >= 0 ? `+${baseGap}` : baseGap})
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold bg-[#EAF4FF]/20 text-[#1B74E4]">
                        {prevNurses?.available} RNs (Gap: {prevGap >= 0 ? `+${prevGap}` : prevGap})
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        <span className={prevGap < baseGap ? 'text-[#B42318] font-bold' : 'text-[#6B6B6B]'}>
                          {prevGap - baseGap} RNs
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-[#6B6B6B]">
                        Util: {prevNurses?.projectedUtilization.toFixed(0)}%
                      </td>
                      <td className="px-4 py-2.5 text-[#6B6B6B]">
                        {prevGap < 0
                          ? `Mandated 1:4 ratio breached by ${Math.abs(prevGap)} nurses.`
                          : 'Ratios maintained within safe clinical guidelines.'}
                      </td>
                    </tr>
                  );
                })()}

                {/* 6. Primary Bottleneck */}
                <tr className="hover:bg-[#FAFAF8]">
                  <td className="px-4 py-2.5 font-semibold">Primary Bottleneck Area</td>
                  <td className="px-4 py-2.5 text-right text-[#6B6B6B]">
                    {baselineModel.bottlenecks.primary.label}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold bg-[#EAF4FF]/20 text-[#1B74E4]">
                    {previewModel.bottlenecks.primary.label}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-[#B42318]">
                    {previewModel.bottlenecks.primary.projectedUtilization.toFixed(0)}% load
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-[#6B6B6B]">
                    Status: {previewModel.bottlenecks.primary.status}
                  </td>
                  <td className="px-4 py-2.5 text-[#6B6B6B]">
                    {previewModel.bottlenecks.primary.impact || previewModel.bottlenecks.primary.impactDetail}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Custom Parameter Model Editor Summary if selected */}
        {previewScenario === 'custom' && (
          <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E8E4DF] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#344054]" />
                <h4 className="text-xs font-bold text-[#1A1A1A]">
                  Custom Parameter Model Assumptions
                </h4>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('forecast-inputs')}
                  className="text-xs font-semibold text-[#1B74E4] hover:underline inline-flex items-center gap-1"
                >
                  Adjust in Forecast & Inputs
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <p className="text-xs text-[#6B6B6B]">
              The Custom Model inherits active operational inputs calibrated in the Forecast & Inputs module. Range validation ensures total licensed beds and staffing ratios remain mathematically consistent.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-2.5 bg-white rounded border border-[#E8E4DF]">
                <span className="text-[10px] text-[#6B6B6B] block">Arrival Demand</span>
                <span className="font-mono font-bold text-sm text-[#1A1A1A]">
                  {previewModel.record.arrivals} arrivals/hr
                </span>
              </div>
              <div className="p-2.5 bg-white rounded border border-[#E8E4DF]">
                <span className="text-[10px] text-[#6B6B6B] block">Current Occupancy</span>
                <span className="font-mono font-bold text-sm text-[#1A1A1A]">
                  {previewModel.record.currentOccupancy} / {previewModel.record.totalBeds} beds
                </span>
              </div>
              <div className="p-2.5 bg-white rounded border border-[#E8E4DF]">
                <span className="text-[10px] text-[#6B6B6B] block">Nurses Available</span>
                <span className="font-mono font-bold text-sm text-[#1A1A1A]">
                  {previewModel.record.nursesAvailable} RNs (1:4 ratio)
                </span>
              </div>
              <div className="p-2.5 bg-white rounded border border-[#E8E4DF]">
                <span className="text-[10px] text-[#6B6B6B] block">Doctors Available</span>
                <span className="font-mono font-bold text-sm text-[#1A1A1A]">
                  {previewModel.record.doctorsAvailable} MDs (1:6 ratio)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Clinical Preparedness & Methodology Notice */}
        <div className="p-3 bg-[#FAFAF8] border border-[#E8E4DF] rounded-md text-[11px] text-[#6B6B6B] flex items-start gap-2">
          <Info className="w-4 h-4 text-[#1B74E4] shrink-0 mt-0.5" />
          <div>
            <strong>Operational Stress-Test Methodology:</strong> Scenario multipliers represent deterministic demand stress-tests evaluated through historical Poisson queuing models and empirical patient flow rates. They are intended for executive staffing preparedness and surge capacity allocation, not as real-world emergency predictions.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenariosPage;
