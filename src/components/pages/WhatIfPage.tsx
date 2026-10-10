import { WhatIfParams, WhatIfResult } from '../../engines/whatIfSimulator';
import { PressureLevel } from '../../engines/pressureEngine';
import { Sliders, RotateCcw, ArrowRight, Activity, ShieldAlert } from 'lucide-react';

interface WhatIfPageProps {
  params: WhatIfParams;
  onParamsChange: (params: WhatIfParams) => void;
  result: WhatIfResult;
  onReset: () => void;
}

export default function WhatIfPage({
  params,
  onParamsChange,
  result,
  onReset,
}: WhatIfPageProps) {
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

  const renderMetricRow = (
    label: string,
    baseline: string | number,
    simulated: string | number,
    change?: number,
    betterCondition?: boolean
  ) => {
    let diffColor = 'text-[#727272]';
    if (change !== undefined && change !== 0) {
      diffColor = betterCondition ? 'text-[#0E7A4E] font-bold' : 'text-[#B42318] font-bold';
    }

    return (
      <div className="flex items-center justify-between py-3 border-b border-[#EAEAEA] last:border-0 text-xs">
        <span className="font-semibold text-[#222222] w-1/3">{label}</span>
        <div className="w-2/3 flex items-center justify-end sm:justify-start space-x-3">
          <span className="text-[#727272] font-mono">{baseline}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#B6B6B6]" />
          <span className="font-bold font-mono text-[#222222]">{simulated}</span>
          {change !== undefined && change !== 0 && (
            <span className={`text-[11px] font-mono ${diffColor}`}>
              ({change > 0 ? '+' : ''}
              {change.toFixed(1)})
            </span>
          )}
        </div>
      </div>
    );
  };

  const hasInterventions =
    params.additionalBeds > 0 ||
    params.additionalNurses > 0 ||
    params.additionalDoctors > 0 ||
    params.patientSurgePercent !== 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#1B74E4]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#222222]">
              What-If Resource Intervention Simulator
            </h1>
          </div>
          <p className="text-xs text-[#727272] mt-1">
            Simulate operational adjustments in bed count, nursing staff, or arrival surges without mutating live baseline data.
          </p>
        </div>

        {hasInterventions && (
          <button
            onClick={onReset}
            className="h-8 px-3 rounded bg-white border border-[#EAEAEA] hover:bg-[#F8F9FA] text-xs font-semibold text-[#222222] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Interventions</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sliders (5 cols) */}
        <div className="lg:col-span-5 p-5 bg-white border border-[#EAEAEA] rounded-md space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#222222]">
              Resource Interventions
            </h2>
            <span className="text-[10px] text-[#727272]">Incremental to current shift</span>
          </div>

          <div className="space-y-5">
            {/* Additional Beds */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label htmlFor="bed-slider" className="font-semibold text-[#222222]">Additional Treatment Beds</label>
                <span className="font-mono font-bold text-[#1B74E4]">+{params.additionalBeds} beds</span>
              </div>
              <input
                id="bed-slider"
                type="range"
                min="0"
                max="15"
                value={params.additionalBeds}
                onChange={(e) =>
                  onParamsChange({ ...params, additionalBeds: parseInt(e.target.value) || 0 })
                }
                className="w-full accent-[#1B74E4] h-1.5 bg-[#F8F9FA] rounded cursor-pointer"
              />
              <p className="text-[10px] text-[#727272]">
                Expands immediate physical observation and treatment capacity.
              </p>
            </div>

            {/* Additional Nurses */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label htmlFor="nurse-slider" className="font-semibold text-[#222222]">On-Call Nursing Additions</label>
                <span className="font-mono font-bold text-[#1B74E4]">+{params.additionalNurses} nurses</span>
              </div>
              <input
                id="nurse-slider"
                type="range"
                min="0"
                max="10"
                value={params.additionalNurses}
                onChange={(e) =>
                  onParamsChange({ ...params, additionalNurses: parseInt(e.target.value) || 0 })
                }
                className="w-full accent-[#1B74E4] h-1.5 bg-[#F8F9FA] rounded cursor-pointer"
              />
              <p className="text-[10px] text-[#727272]">
                Increases active care capacity by 4 patients per nurse (1:4 safe ratio).
              </p>
            </div>

            {/* Additional Doctors */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label htmlFor="doctor-slider" className="font-semibold text-[#222222]">Attending Physicians</label>
                <span className="font-mono font-bold text-[#1B74E4]">+{params.additionalDoctors} doctors</span>
              </div>
              <input
                id="doctor-slider"
                type="range"
                min="0"
                max="8"
                value={params.additionalDoctors}
                onChange={(e) =>
                  onParamsChange({ ...params, additionalDoctors: parseInt(e.target.value) || 0 })
                }
                className="w-full accent-[#1B74E4] h-1.5 bg-[#F8F9FA] rounded cursor-pointer"
              />
              <p className="text-[10px] text-[#727272]">
                Accelerates provider assessment throughput by 6 patients per physician.
              </p>
            </div>

            {/* Patient Surge */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label htmlFor="surge-slider" className="font-semibold text-[#222222]">Hypothetical Demand Shock</label>
                <span className={`font-mono font-bold ${params.patientSurgePercent > 0 ? 'text-[#B42318]' : 'text-[#1B74E4]'}`}>
                  {params.patientSurgePercent > 0 ? `+${params.patientSurgePercent}%` : `${params.patientSurgePercent}%`}
                </span>
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
                className="w-full accent-[#1B74E4] h-1.5 bg-[#F8F9FA] rounded cursor-pointer"
              />
              <p className="text-[10px] text-[#727272]">
                Tests resilience against external surge spikes or diversions.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Results (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 bg-white border border-[#EAEAEA] rounded-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#1B74E4]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#222222]">
                  Deterministic Simulation Impact
                </h2>
              </div>
              <span className="text-[10px] text-[#727272] uppercase font-bold">
                Baseline vs. Simulated
              </span>
            </div>

            {/* Comparison Rows */}
            <div className="divide-y divide-[#EAEAEA] border-y border-[#EAEAEA]">
              {renderMetricRow(
                'Occupancy Rate',
                `${result.baseline.occupancyPercent.toFixed(1)}%`,
                `${result.simulated.occupancyPercent.toFixed(1)}%`,
                result.impact.occupancyChange,
                result.impact.occupancyChange < 0
              )}
              {renderMetricRow(
                'Average Wait Time',
                `${result.baseline.waitingTime} min`,
                `${result.simulated.waitingTime} min`,
                result.impact.waitTimeChange,
                result.impact.waitTimeChange < 0
              )}
              {renderMetricRow(
                'Available Bed Buffer',
                result.baseline.availableBeds,
                result.simulated.availableBeds,
                result.simulated.availableBeds - result.baseline.availableBeds,
                result.simulated.availableBeds > result.baseline.availableBeds
              )}

              {/* Pressure Level transition */}
              <div className="flex items-center justify-between py-3 text-xs">
                <span className="font-semibold text-[#222222] w-1/3">Pressure Level</span>
                <div className="w-2/3 flex items-center space-x-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPressureBadge(
                      result.baseline.pressureLevel
                    )}`}
                  >
                    {result.baseline.pressureLevel}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#B6B6B6]" />
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPressureBadge(
                      result.simulated.pressureLevel
                    )}`}
                  >
                    {result.simulated.pressureLevel}
                  </span>
                </div>
              </div>

              {/* Bottleneck Shift */}
              <div className="flex items-center justify-between py-3 text-xs">
                <span className="font-semibold text-[#222222] w-1/3">Primary Constraint</span>
                <div className="w-2/3 flex items-center space-x-3">
                  <span className="text-[#727272]">{result.baseline.bottleneck}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#B6B6B6]" />
                  <span className="font-bold text-[#222222]">{result.simulated.bottleneck}</span>
                </div>
              </div>
            </div>

            {/* Impact Narrative */}
            <div className="p-4 bg-[#EAF4FF] border border-[#B2DDFF] rounded-md text-xs text-[#175CD3] space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">
                Analytical Impact Summary:
              </span>
              <p className="text-[#1558B0] leading-relaxed">
                {result.impact.summary}
              </p>
            </div>
          </div>

          <div className="p-4 bg-white border border-[#EAEAEA] rounded-md text-xs text-[#727272] flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#727272] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Simulation Estimate Notice:</strong> Interventions reflect deterministic sensitivity modeling over synthetic demand curves. Actual bed turn times and clinical staffing responses require operational validation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
