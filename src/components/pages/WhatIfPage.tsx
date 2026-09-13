import React from 'react';
import { WhatIfParams, WhatIfResult } from '../../engines/whatIfSimulator';
import { PressureLevel } from '../../engines/pressureEngine';
import { Settings2, RotateCcw, Play, ArrowRight, Activity } from 'lucide-react';

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
  const handleRunSimulation = () => {
    // This could just trigger a re-render if it's already bound, 
    // but in this setup the parent handles it. We can just keep the button for UI purposes.
  };

  const getPressureColor = (level: PressureLevel) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-700 border border-red-200';
      case 'HIGH': return 'bg-orange-50 text-orange-700 border border-orange-500/30';
      case 'WATCH': return 'bg-amber-50 text-amber-700 border border-yellow-500/30';
      case 'NORMAL': return 'bg-emerald-50 text-emerald-700 border border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-500 border border-slate-500/30';
    }
  };

  const renderMetricRow = (label: string, baseline: any, simulated: any, change?: number, betterCondition?: boolean) => {
    let diffColor = 'text-slate-500';
    if (change !== undefined && change !== 0) {
      diffColor = betterCondition ? 'text-emerald-700' : 'text-red-700';
    }

    return (
      <div className="flex items-center justify-between py-3 border-b border-slate-200 last:border-0">
        <span className="text-slate-700 w-1/3">{label}</span>
        <div className="w-2/3 flex items-center space-x-4">
          <span className="text-slate-500">{baseline}</span>
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <span className="font-medium text-slate-900">{simulated}</span>
          {change !== undefined && change !== 0 && (
            <span className={`text-sm ${diffColor}`}>
              ({change > 0 ? '+' : ''}{change.toFixed(1)})
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-slate-900 p-6 h-full overflow-y-auto">
      <header>
        <h1 className="text-2xl font-bold">What-If Simulator</h1>
        <p className="text-slate-500">What happens if I change resources?</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center">
            <Settings2 className="w-5 h-5 mr-2 text-blue-600" />
            Resource Intervention
          </h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Additional Beds</label>
              <div className="flex items-center space-x-4">
                <input 
                  type="range" 
                  min="0" 
                  max="15" 
                  value={params.additionalBeds}
                  onChange={(e) => onParamsChange({...params, additionalBeds: parseInt(e.target.value)})}
                  className="w-full accent-blue-500" 
                />
                <span className="w-12 text-center font-mono bg-slate-50 py-1 rounded">{params.additionalBeds}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Additional Nurses</label>
              <div className="flex items-center space-x-4">
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={params.additionalNurses}
                  onChange={(e) => onParamsChange({...params, additionalNurses: parseInt(e.target.value)})}
                  className="w-full accent-blue-500" 
                />
                <span className="w-12 text-center font-mono bg-slate-50 py-1 rounded">{params.additionalNurses}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Additional Doctors</label>
              <div className="flex items-center space-x-4">
                <input 
                  type="range" 
                  min="0" 
                  max="8" 
                  value={params.additionalDoctors}
                  onChange={(e) => onParamsChange({...params, additionalDoctors: parseInt(e.target.value)})}
                  className="w-full accent-blue-500" 
                />
                <span className="w-12 text-center font-mono bg-slate-50 py-1 rounded">{params.additionalDoctors}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Patient Surge %</label>
              <div className="flex items-center space-x-4">
                <input 
                  type="range" 
                  min="-30" 
                  max="50" 
                  value={params.patientSurgePercent}
                  onChange={(e) => onParamsChange({...params, patientSurgePercent: parseInt(e.target.value)})}
                  className="w-full accent-blue-500" 
                />
                <span className="w-12 text-center font-mono bg-slate-50 py-1 rounded">{params.patientSurgePercent}%</span>
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-slate-200">
              <button 
                onClick={handleRunSimulation}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center transition-colors"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Simulation
              </button>
              <button 
                onClick={onReset}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 flex items-center transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-emerald-700" />
            Simulation Results
          </h2>
          
          <div className="bg-slate-50 rounded-lg p-1 border border-slate-200 mb-6">
            <div className="px-4 py-2 bg-white text-sm font-semibold text-slate-500 border-b border-slate-200 flex">
              <span className="w-1/3">Metric</span>
              <span className="w-2/3">Comparison</span>
            </div>
            <div className="px-4">
              {renderMetricRow(
                'Occupancy', 
                `${result.baseline.occupancyPercent.toFixed(1)}%`, 
                `${result.simulated.occupancyPercent.toFixed(1)}%`,
                result.impact.occupancyChange,
                result.impact.occupancyChange < 0
              )}
              {renderMetricRow(
                'Wait Time', 
                `${result.baseline.waitingTime} min`, 
                `${result.simulated.waitingTime} min`,
                result.impact.waitTimeChange,
                result.impact.waitTimeChange < 0
              )}
              {renderMetricRow(
                'Beds Available', 
                result.baseline.availableBeds, 
                result.simulated.availableBeds,
                result.simulated.availableBeds - result.baseline.availableBeds,
                result.simulated.availableBeds > result.baseline.availableBeds
              )}
              
              <div className="flex items-center justify-between py-3 border-b border-slate-200 last:border-0">
                <span className="text-slate-700 w-1/3">Pressure</span>
                <div className="w-2/3 flex items-center space-x-3">
                  <span className={`px-2 py-0.5 text-xs rounded ${getPressureColor(result.baseline.pressureLevel)}`}>
                    {result.baseline.pressureLevel}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <span className={`px-2 py-0.5 text-xs rounded ${getPressureColor(result.simulated.pressureLevel)}`}>
                    {result.simulated.pressureLevel}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-200 last:border-0">
                <span className="text-slate-700 w-1/3">Bottleneck</span>
                <div className="w-2/3 flex items-center space-x-3">
                  <span className="text-slate-500 text-sm">{result.baseline.bottleneck}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-900 text-sm">{result.simulated.bottleneck}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-600 mb-1">Impact Summary</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              {result.impact.summary}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 border-l-4 border-slate-300 bg-white/50 text-slate-500 text-sm">
        <p><strong>SIMULATION ESTIMATE — NOT A CLINICAL GUARANTEE.</strong> Production deployment would require hospital-specific validation.</p>
      </div>
    </div>
  );
}
