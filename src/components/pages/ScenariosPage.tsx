import React from 'react';
import { SimulationInputs } from '../../types';
import { PressureResult } from '../../engines/pressureEngine';
import { BottleneckResult } from '../../engines/bottleneckEngine';
import { ForecastResult } from '../../engines/forecastEngine';
import {
  Activity,
  AlertTriangle,
  Biohazard,
  Calendar,
  Settings,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

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
    name: 'Normal Day',
    icon: Activity,
    description: 'Baseline ED operations with typical demand patterns.',
    color: 'text-emerald-700',
  },
  {
    id: 'weekend_peak' as const,
    name: 'Weekend Peak',
    icon: Calendar,
    description: 'Elevated patient volume typical of weekend afternoons. +10% arrivals.',
    color: 'text-blue-600',
  },
  {
    id: 'accident_surge' as const,
    name: 'Accident Surge',
    icon: AlertTriangle,
    description: 'Mass casualty or multi-vehicle accident. +80% arrival surge with high acuity.',
    color: 'text-red-700',
  },
  {
    id: 'outbreak' as const,
    name: 'Outbreak',
    icon: Biohazard,
    description: 'Community health event causing sustained elevated demand. +50% arrivals.',
    color: 'text-orange-700',
  },
  {
    id: 'custom' as const,
    name: 'Custom',
    icon: Settings,
    description: 'Manually configure demand parameters in Forecast & Inputs.',
    color: 'text-slate-500',
  },
];

export default function ScenariosPage({
  currentScenario,
  onSelectScenario,
  pressure,
  bottlenecks,
  forecast,
}: ScenariosPageProps) {
  const f2 = forecast.forecasts.find((f) => f.hoursAhead === 2);
  const projOcc = f2?.predictedOccupancy || 0;

  return (
    <div className="space-y-6 text-slate-900 p-6">
      <header>
        <h1 className="text-2xl font-bold">Scenarios</h1>
        <p className="text-slate-500">What happens under a different demand condition?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((s) => {
          const isSelected = currentScenario === s.id;
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              onClick={() => onSelectScenario(s.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-slate-100 border-green-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-slate-100 ${s.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg">{s.name}</h3>
                </div>
                {isSelected ? (
                  <span className="px-2 py-1 text-xs rounded bg-emerald-50 text-emerald-700 border border-green-500/30">
                    Active
                  </span>
                ) : (
                  <button className="text-sm px-3 py-1 bg-slate-100 rounded hover:bg-slate-200">
                    Select
                  </button>
                )}
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">{s.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Scenario Impact Preview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-slate-500 text-sm mb-1">Current Pressure</div>
            <div className={`text-2xl font-bold ${
              pressure.level === 'CRITICAL' ? 'text-red-500' : 
              pressure.level === 'HIGH' ? 'text-orange-500' :
              pressure.level === 'WATCH' ? 'text-yellow-500' : 'text-green-500'
            }`}>
              {pressure.level}
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-slate-500 text-sm mb-1">Projected Occupancy (+2h)</div>
            <div className="text-2xl font-bold text-slate-900">{projOcc.toFixed(0)}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-slate-500 text-sm mb-1">Primary Bottleneck</div>
            <div className="text-2xl font-bold text-red-700">
              {bottlenecks.primary.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
