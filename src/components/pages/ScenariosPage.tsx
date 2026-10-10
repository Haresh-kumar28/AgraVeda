import React from 'react';
import { SimulationInputs } from '../../types';
import { PressureResult } from '../../engines/pressureEngine';
import { BottleneckResult } from '../../engines/bottleneckEngine';
import { ForecastResult } from '../../engines/forecastEngine';
import { Activity, AlertTriangle, Biohazard, Calendar, Settings, Zap } from 'lucide-react';

interface ScenariosPageProps {
  currentScenario: SimulationInputs['scenario'];
  onSelectScenario: (scenario: SimulationInputs['scenario']) => void;
  pressure: PressureResult;
  bottlenecks: BottleneckResult;
  forecast: ForecastResult;
}

const scenarios = [
  {
    id: 'normal' as const,
    name: 'Normal Demand Baseline',
    icon: Activity,
    description: 'Typical emergency department operations and expected weekday arrival distribution.',
    multiplier: '1.0x baseline',
    acuity: 'Standard acuity mix',
  },
  {
    id: 'weekend_peak' as const,
    name: 'Weekend Volume Peak',
    icon: Calendar,
    description: 'Elevated patient volume typical of Saturday and Sunday afternoons with recreational trauma.',
    multiplier: '1.1x (+10% arrivals)',
    acuity: 'Increased fast-track queue',
  },
  {
    id: 'accident_surge' as const,
    name: 'Mass Casualty / Highway Collision',
    icon: AlertTriangle,
    description: 'Acute sudden surge from a multi-vehicle accident or disaster with concentrated high acuity.',
    multiplier: '1.8x (+80% arrivals)',
    acuity: 'Elevated High-Acuity ESI 1 & 2',
  },
  {
    id: 'outbreak' as const,
    name: 'Community Respiratory Outbreak',
    icon: Biohazard,
    description: 'Sustained elevated volume across several shifts resulting in bed boarding and wait queue buildup.',
    multiplier: '1.5x (+50% arrivals)',
    acuity: 'Sustained moderate acuity',
  },
  {
    id: 'custom' as const,
    name: 'Custom Parameter Model',
    icon: Settings,
    description: 'Manually configure individual parameters in the Forecast & Inputs module.',
    multiplier: 'Configurable',
    acuity: 'User-specified',
  },
];

export const ScenariosPage: React.FC<ScenariosPageProps> = ({
  currentScenario,
  onSelectScenario,
  pressure,
  bottlenecks,
  forecast,
}) => {
  const f2 = forecast.forecasts.find((f) => f.hoursAhead === 2);
  const projOcc = f2?.predictedOccupancy || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#1B74E4]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#222222]">
              Operational Demand Scenarios
            </h1>
          </div>
          <p className="text-xs text-[#727272] mt-1">
            Compare predefined surge situations without mutating live baseline parameters until explicitly selected.
          </p>
        </div>

        <div className="text-xs text-[#727272] bg-[#F8F9FA] border border-[#EAEAEA] px-3 py-1.5 rounded">
          Active Scenario: <strong className="text-[#1B74E4] uppercase">{currentScenario}</strong>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {scenarios.map((s) => {
          const isSelected = currentScenario === s.id;
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              onClick={() => onSelectScenario(s.id)}
              className={`p-5 rounded-md border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-[#1B74E4] shadow-sm ring-1 ring-[#1B74E4]'
                  : 'bg-white border-[#EAEAEA] hover:border-[#B6B6B6]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded bg-[#EAF4FF] text-[#1B74E4] flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-[#EAF4FF] text-[#1B74E4] border border-[#B2DDFF]">
                      Active Baseline
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="text-xs text-[#727272] hover:text-[#222222] font-semibold"
                    >
                      Apply Scenario →
                    </button>
                  )}
                </div>

                <h3 className="text-sm font-bold text-[#222222]">{s.name}</h3>
                <p className="text-xs text-[#727272] mt-1.5 leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAEAEA] space-y-1 text-[11px] text-[#727272]">
                <div className="flex justify-between">
                  <span>Demand Multiplier:</span>
                  <strong className="text-[#222222]">{s.multiplier}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Acuity Profile:</span>
                  <span className="text-[#222222]">{s.acuity}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Impact Preview */}
      <div className="p-6 bg-white border border-[#EAEAEA] rounded-md space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#222222]">
          Calculated Scenario Response Preview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#F8F9FA] rounded border border-[#EAEAEA]">
            <div className="text-[10px] font-bold uppercase text-[#727272]">Operational Pressure</div>
            <div className={`text-2xl font-bold mt-1 ${
              pressure.level === 'CRITICAL' ? 'text-[#B42318]' :
              pressure.level === 'HIGH' ? 'text-[#B54708]' :
              pressure.level === 'WATCH' ? 'text-[#B54708]' : 'text-[#0E7A4E]'
            }`}>
              {pressure.level} ({pressure.score}/100)
            </div>
            <div className="text-[11px] text-[#727272] mt-0.5">
              Time to impact: {pressure.timeToImpact}
            </div>
          </div>

          <div className="p-4 bg-[#F8F9FA] rounded border border-[#EAEAEA]">
            <div className="text-[10px] font-bold uppercase text-[#727272]">Projected Occupancy (+2h)</div>
            <div className="text-2xl font-bold text-[#222222] mt-1">
              {projOcc.toFixed(0)} beds
            </div>
            <div className="text-[11px] text-[#727272] mt-0.5">
              Based on {forecast.forecasts.find(f => f.hoursAhead === 2)?.predictedArrivals} arrivals
            </div>
          </div>

          <div className="p-4 bg-[#F8F9FA] rounded border border-[#EAEAEA]">
            <div className="text-[10px] font-bold uppercase text-[#727272]">Primary Constraint</div>
            <div className="text-2xl font-bold text-[#B42318] mt-1">
              {bottlenecks.primary.label}
            </div>
            <div className="text-[11px] text-[#727272] mt-0.5">
              Utilization: {bottlenecks.primary.projectedUtilization.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenariosPage;
