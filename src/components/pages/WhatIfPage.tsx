import React, { useState } from 'react';
import { WhatIfParams, WhatIfResult } from '../../engines/whatIfSimulator';
import { PressureLevel } from '../../engines/pressureEngine';
import {
  Sliders,
  RotateCcw,
  ArrowRight,
  Activity,
  ShieldAlert,
  Bed,
  Users,
  Stethoscope,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Check,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react';

export interface WhatIfPageProps {
  params: WhatIfParams;
  onParamsChange: (params: WhatIfParams) => void;
  result: WhatIfResult;
  onReset: () => void;
  onNavigate?: (page: string) => void;
  onApplyToOperations?: (params: WhatIfParams) => void;
}

export const WhatIfPage: React.FC<WhatIfPageProps> = ({
  params,
  onParamsChange,
  result,
  onReset,
  onNavigate,
  onApplyToOperations,
}) => {
  const [committedFeedback, setCommittedFeedback] = useState(false);

  const getPressureBadge = (level: PressureLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]';
      case 'HIGH':
        return 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]';
      case 'WATCH':
        return 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]';
      default:
        return 'bg-[#ECFDF3] text-[#0E7A4E] border-[#A6F4C5]';
    }
  };

  const hasInterventions =
    params.additionalBeds > 0 ||
    params.additionalNurses > 0 ||
    params.additionalDoctors > 0 ||
    params.patientSurgePercent !== 0;

  const handleApply = () => {
    if (onApplyToOperations && hasInterventions) {
      onApplyToOperations(params);
      setCommittedFeedback(true);
      setTimeout(() => setCommittedFeedback(false), 2500);
    }
  };

  const renderMetricRow = (
    label: string,
    baselineStr: string | number,
    simulatedStr: string | number,
    change?: number,
    betterCondition?: boolean,
    unit = ''
  ) => {
    const isNeutral = change === undefined || Math.abs(change) < 0.01;
    let diffColor = 'text-[#6B6B6B] bg-[#FAFAF8] border-[#E8E4DF]';

    if (!isNeutral) {
      diffColor = betterCondition
        ? 'text-[#0E7A4E] bg-[#ECFDF3] border-[#A6F4C5] font-semibold'
        : 'text-[#B42318] bg-[#FEF3F2] border-[#FECDCA] font-semibold';
    }

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 border-b border-[#E8E4DF] last:border-0 text-xs gap-2">
        <span className="font-semibold text-[#1A1A1A] sm:w-1/3">{label}</span>
        <div className="sm:w-2/3 flex items-center justify-between sm:justify-start sm:space-x-4">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-[#6B6B6B] min-w-[70px] text-right">
              {baselineStr}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#B6B6B6] shrink-0" />
            <span className="font-bold text-[#1A1A1A] min-w-[70px]">
              {simulatedStr}
            </span>
          </div>

          <div className="shrink-0">
            {isNeutral ? (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-[#E8E4DF] text-[#6B6B6B] bg-[#FAFAF8]">
                0.0 {unit}
              </span>
            ) : (
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${diffColor}`}>
                {change !== undefined && change > 0 ? `+${change.toFixed(1)}` : change?.toFixed(1)} {unit}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DF]">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#1B74E4]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">
              What-If Resource Intervention Simulator
            </h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Deterministic sensitivity testing of bed capacity, nursing ratios, physician staffing, and demand shocks in isolated preview.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs text-[#6B6B6B] bg-white border border-[#E8E4DF] px-3 py-1.5 rounded flex items-center gap-1.5 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-[#1B74E4]" />
            <span>Horizon:</span>
            <strong className="text-[#1A1A1A] font-medium">+2h Peak Demand</strong>
          </div>

          {hasInterventions && (
            <button
              onClick={onReset}
              className="h-8 px-3 rounded bg-white border border-[#E8E4DF] hover:bg-[#FAFAF8] text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Reset all intervention parameters to zero"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#6B6B6B]" />
              <span>Reset Interventions</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Controls (5 cols) */}
        <div className="lg:col-span-5 p-5 bg-white border border-[#E8E4DF] rounded-lg shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#1B74E4]" />
                Resource Interventions
              </h2>
              <span className="text-[11px] text-[#6B6B6B]">Adjust isolated hypothetical shifts</span>
            </div>
            {hasInterventions ? (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]">
                Active Interventions
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#FAFAF8] text-[#6B6B6B] border border-[#E8E4DF]">
                Zero Delta (Equilibrium)
              </span>
            )}
          </div>

          <div className="space-y-6">
            {/* 1. Additional Beds */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-[#1A1A1A]">
                  <Bed className="w-4 h-4 text-[#1B74E4]" />
                  <label htmlFor="bed-slider">Additional Treatment Beds</label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onParamsChange({ ...params, additionalBeds: Math.max(0, params.additionalBeds - 1) })}
                    className="w-6 h-6 rounded border border-[#E8E4DF] bg-[#FAFAF8] hover:bg-[#F2F4F7] flex items-center justify-center text-xs font-bold text-[#1A1A1A] transition-colors"
                    aria-label="Decrease beds"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono font-bold text-sm text-[#1B74E4] w-12 text-center">
                    +{params.additionalBeds}
                  </span>
                  <button
                    type="button"
                    onClick={() => onParamsChange({ ...params, additionalBeds: Math.min(15, params.additionalBeds + 1) })}
                    className="w-6 h-6 rounded border border-[#E8E4DF] bg-[#FAFAF8] hover:bg-[#F2F4F7] flex items-center justify-center text-xs font-bold text-[#1A1A1A] transition-colors"
                    aria-label="Increase beds"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <input
                id="bed-slider"
                type="range"
                min="0"
                max="15"
                step="1"
                value={params.additionalBeds}
                onChange={(e) =>
                  onParamsChange({ ...params, additionalBeds: parseInt(e.target.value) || 0 })
                }
                className="w-full accent-[#1B74E4] h-2 bg-[#FAFAF8] border border-[#E8E4DF] rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#6B6B6B]">
                <span>0 beds</span>
                <span>Range: 0 – 15 beds</span>
                <span>+15 beds</span>
              </div>
            </div>

            {/* 2. Additional Nurses */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-[#1A1A1A]">
                  <Users className="w-4 h-4 text-[#1B74E4]" />
                  <label htmlFor="nurse-slider">On-Call Nursing Additions</label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onParamsChange({ ...params, additionalNurses: Math.max(0, params.additionalNurses - 1) })}
                    className="w-6 h-6 rounded border border-[#E8E4DF] bg-[#FAFAF8] hover:bg-[#F2F4F7] flex items-center justify-center text-xs font-bold text-[#1A1A1A] transition-colors"
                    aria-label="Decrease nurses"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono font-bold text-sm text-[#1B74E4] w-12 text-center">
                    +{params.additionalNurses}
                  </span>
                  <button
                    type="button"
                    onClick={() => onParamsChange({ ...params, additionalNurses: Math.min(10, params.additionalNurses + 1) })}
                    className="w-6 h-6 rounded border border-[#E8E4DF] bg-[#FAFAF8] hover:bg-[#F2F4F7] flex items-center justify-center text-xs font-bold text-[#1A1A1A] transition-colors"
                    aria-label="Increase nurses"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <input
                id="nurse-slider"
                type="range"
                min="0"
                max="10"
                step="1"
                value={params.additionalNurses}
                onChange={(e) =>
                  onParamsChange({ ...params, additionalNurses: parseInt(e.target.value) || 0 })
                }
                className="w-full accent-[#1B74E4] h-2 bg-[#FAFAF8] border border-[#E8E4DF] rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#6B6B6B]">
                <span>0 nurses</span>
                <span>1:4 ratio (+4 pts/nurse)</span>
                <span>+10 nurses</span>
              </div>
            </div>

            {/* 3. Additional Doctors */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-[#1A1A1A]">
                  <Stethoscope className="w-4 h-4 text-[#1B74E4]" />
                  <label htmlFor="doctor-slider">Attending Physicians</label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onParamsChange({ ...params, additionalDoctors: Math.max(0, params.additionalDoctors - 1) })}
                    className="w-6 h-6 rounded border border-[#E8E4DF] bg-[#FAFAF8] hover:bg-[#F2F4F7] flex items-center justify-center text-xs font-bold text-[#1A1A1A] transition-colors"
                    aria-label="Decrease doctors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono font-bold text-sm text-[#1B74E4] w-12 text-center">
                    +{params.additionalDoctors}
                  </span>
                  <button
                    type="button"
                    onClick={() => onParamsChange({ ...params, additionalDoctors: Math.min(8, params.additionalDoctors + 1) })}
                    className="w-6 h-6 rounded border border-[#E8E4DF] bg-[#FAFAF8] hover:bg-[#F2F4F7] flex items-center justify-center text-xs font-bold text-[#1A1A1A] transition-colors"
                    aria-label="Increase doctors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <input
                id="doctor-slider"
                type="range"
                min="0"
                max="8"
                step="1"
                value={params.additionalDoctors}
                onChange={(e) =>
                  onParamsChange({ ...params, additionalDoctors: parseInt(e.target.value) || 0 })
                }
                className="w-full accent-[#1B74E4] h-2 bg-[#FAFAF8] border border-[#E8E4DF] rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#6B6B6B]">
                <span>0 MDs</span>
                <span>1:6 ratio (+6 pts/MD)</span>
                <span>+8 MDs</span>
              </div>
            </div>

            {/* 4. Hypothetical Demand Shock */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-[#1A1A1A]">
                  <TrendingUp className="w-4 h-4 text-[#1B74E4]" />
                  <label htmlFor="surge-slider">Hypothetical Demand Shock</label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onParamsChange({ ...params, patientSurgePercent: Math.max(-30, params.patientSurgePercent - 5) })}
                    className="w-6 h-6 rounded border border-[#E8E4DF] bg-[#FAFAF8] hover:bg-[#F2F4F7] flex items-center justify-center text-xs font-bold text-[#1A1A1A] transition-colors"
                    aria-label="Decrease surge percent"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span
                    className={`font-mono font-bold text-sm w-14 text-center ${
                      params.patientSurgePercent > 0
                        ? 'text-[#B42318]'
                        : params.patientSurgePercent < 0
                        ? 'text-[#0E7A4E]'
                        : 'text-[#1A1A1A]'
                    }`}
                  >
                    {params.patientSurgePercent > 0 ? `+${params.patientSurgePercent}%` : `${params.patientSurgePercent}%`}
                  </span>
                  <button
                    type="button"
                    onClick={() => onParamsChange({ ...params, patientSurgePercent: Math.min(50, params.patientSurgePercent + 5) })}
                    className="w-6 h-6 rounded border border-[#E8E4DF] bg-[#FAFAF8] hover:bg-[#F2F4F7] flex items-center justify-center text-xs font-bold text-[#1A1A1A] transition-colors"
                    aria-label="Increase surge percent"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <input
                id="surge-slider"
                type="range"
                min="-30"
                max="50"
                step="5"
                value={params.patientSurgePercent}
                onChange={(e) =>
                  onParamsChange({ ...params, patientSurgePercent: parseInt(e.target.value) || 0 })
                }
                className="w-full accent-[#1B74E4] h-2 bg-[#FAFAF8] border border-[#E8E4DF] rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#6B6B6B]">
                <span>-30% relief</span>
                <span>0% baseline</span>
                <span>+50% surge shock</span>
              </div>
            </div>
          </div>

          {/* Optional Action to Commit Interventions to Live Operations */}
          {onApplyToOperations && (
            <div className="pt-3 border-t border-[#E8E4DF]">
              <button
                type="button"
                onClick={handleApply}
                disabled={!hasInterventions}
                className={`w-full py-2 px-3 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                  !hasInterventions
                    ? 'bg-[#F2F4F7] text-[#98A2B3] border border-[#EAECF0] cursor-not-allowed'
                    : committedFeedback
                    ? 'bg-[#0E7A4E] text-white'
                    : 'bg-[#1B74E4] hover:bg-[#155EC0] text-white'
                }`}
              >
                {committedFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Applied to Operational Parameters!</span>
                  </>
                ) : (
                  <>
                    <span>Apply Interventions to Live ED Parameters</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
              <p className="text-[10px] text-[#6B6B6B] mt-1.5 text-center">
                Propagates adjustments as a Custom Scenario to Command Center & Forecast.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Comparative Results (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 bg-white border border-[#E8E4DF] rounded-lg shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#1B74E4]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Deterministic Simulation Impact
                </h2>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#6B6B6B]">
                <span>Baseline</span>
                <ArrowRight className="w-3 h-3 text-[#B6B6B6]" />
                <strong className="text-[#1A1A1A]">Simulated Output</strong>
              </div>
            </div>

            {/* Metric Comparison Rows */}
            <div className="divide-y divide-[#E8E4DF]">
              {renderMetricRow(
                'Occupancy Rate',
                `${result.baseline.occupancyPercent.toFixed(1)}%`,
                `${result.simulated.occupancyPercent.toFixed(1)}%`,
                result.impact.occupancyChange,
                result.impact.occupancyChange < 0,
                '%'
              )}

              {renderMetricRow(
                'Average Wait Time',
                `${result.baseline.waitingTime} min`,
                `${result.simulated.waitingTime} min`,
                result.impact.waitTimeChange,
                result.impact.waitTimeChange < 0,
                'min'
              )}

              {renderMetricRow(
                'Available Bed Buffer',
                `${result.baseline.availableBeds} beds`,
                `${result.simulated.availableBeds} beds`,
                result.simulated.availableBeds - result.baseline.availableBeds,
                result.simulated.availableBeds > result.baseline.availableBeds,
                'beds'
              )}

              {/* Operational Pressure Level & Score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 border-b border-[#E8E4DF] text-xs gap-2">
                <span className="font-semibold text-[#1A1A1A] sm:w-1/3">
                  Operational Pressure Score
                </span>
                <div className="sm:w-2/3 flex items-center justify-between sm:justify-start sm:space-x-4">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[#6B6B6B] min-w-[70px] text-right">
                      {result.baseline.pressureScore}/100
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#B6B6B6] shrink-0" />
                    <span className="font-bold text-[#1A1A1A] min-w-[70px]">
                      {result.simulated.pressureScore}/100
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPressureBadge(
                        result.simulated.pressureLevel
                      )}`}
                    >
                      {result.simulated.pressureLevel}
                    </span>
                    {result.simulated.pressureScore !== result.baseline.pressureScore && (
                      <span
                        className={`text-[10px] font-mono font-semibold ${
                          result.simulated.pressureScore < result.baseline.pressureScore
                            ? 'text-[#0E7A4E]'
                            : 'text-[#B42318]'
                        }`}
                      >
                        ({result.simulated.pressureScore < result.baseline.pressureScore ? '' : '+'}
                        {result.simulated.pressureScore - result.baseline.pressureScore} pts)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Primary Bottleneck Shift */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 text-xs gap-2">
                <span className="font-semibold text-[#1A1A1A] sm:w-1/3">
                  Primary Operational Constraint
                </span>
                <div className="sm:w-2/3 flex items-center justify-between sm:justify-start sm:space-x-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[#6B6B6B] truncate max-w-[120px]">
                      {result.baseline.bottleneck}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#B6B6B6] shrink-0" />
                    <span className="font-bold text-[#1A1A1A] truncate max-w-[130px]">
                      {result.simulated.bottleneck}
                    </span>
                  </div>

                  <div>
                    {result.baseline.bottleneck === result.simulated.bottleneck ? (
                      <span className="text-[10px] font-medium text-[#6B6B6B] bg-[#FAFAF8] px-2 py-0.5 rounded border border-[#E8E4DF]">
                        Constraint Constant
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-[#175CD3] bg-[#EFF8FF] px-2 py-0.5 rounded border border-[#B2DDFF]">
                        Bottleneck Shifted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Narrative Banner */}
            <div className="p-4 bg-[#F2F7FE] border border-[#B2DDFF] rounded-lg text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[10px] text-[#175CD3] flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  Analytical Simulation Assessment:
                </span>
                <span className="text-[10px] text-[#6B6B6B]">
                  Evaluated via AgraVeda Queue Engine
                </span>
              </div>
              <p className="text-[#1558B0] leading-relaxed font-medium">
                {result.impact.summary}
              </p>
            </div>
          </div>

          {/* Clinical Methodology and Safety Notice */}
          <div className="p-4 bg-white border border-[#E8E4DF] rounded-lg text-xs text-[#6B6B6B] flex items-start gap-2.5 shadow-sm">
            <ShieldAlert className="w-4 h-4 text-[#B54708] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="leading-relaxed">
                <strong className="text-[#1A1A1A]">Simulation Methodology Notice:</strong> What-If interventions reflect deterministic queuing models based on standard 1:4 nursing and 1:6 physician staffing standards. Zero-intervention scenarios are mathematically tied to baseline EHR sensor streams.
              </p>
              {onNavigate && (
                <div className="pt-1 flex items-center gap-4 text-[11px]">
                  <button
                    onClick={() => onNavigate('scenarios')}
                    className="text-[#1B74E4] hover:underline font-semibold inline-flex items-center gap-0.5"
                  >
                    Compare Demand Scenarios
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onNavigate('resources')}
                    className="text-[#1B74E4] hover:underline font-semibold inline-flex items-center gap-0.5"
                  >
                    Review Resource Capacity Matrix
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIfPage;
