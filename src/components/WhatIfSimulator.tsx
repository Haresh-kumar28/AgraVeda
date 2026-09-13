import { Sliders, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { WhatIfParams, WhatIfResult } from '../engines/whatIfSimulator';
import { PressureLevel } from '../engines/pressureEngine';

interface WhatIfSimulatorProps {
  params: WhatIfParams;
  onParamsChange: (params: WhatIfParams) => void;
  result: WhatIfResult;
}

const pressureColor: Record<PressureLevel, string> = {
  NORMAL: 'text-emerald-700',
  WATCH: 'text-amber-700',
  HIGH: 'text-orange-700',
  CRITICAL: 'text-red-700',
};

function ParamControl({ label, value, onChange, min = 0, max = 10, suffix = '' }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-slate-700 text-xs transition-colors"
        >
          −
        </button>
        <span className="text-sm font-bold text-slate-900 w-10 text-center">{value}{suffix}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-slate-700 text-xs transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

function CompareRow({ label, before, after, unit, inverse = false }: {
  label: string;
  before: number;
  after: number;
  unit: string;
  inverse?: boolean;
}) {
  const diff = after - before;
  const improved = inverse ? diff > 0 : diff < 0;
  const worsened = inverse ? diff < 0 : diff > 0;

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-200 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">{Math.round(before)}{unit}</span>
        <span className="text-slate-500">→</span>
        <span className={`text-xs font-bold ${improved ? 'text-emerald-700' : worsened ? 'text-red-700' : 'text-slate-700'}`}>
          {Math.round(after)}{unit}
        </span>
        {diff !== 0 && (
          <span className={`flex items-center gap-0.5 text-[10px] font-medium ${improved ? 'text-emerald-700' : 'text-red-700'}`}>
            {improved ? <ArrowDown className="w-2.5 h-2.5" /> : <ArrowUp className="w-2.5 h-2.5" />}
            {Math.abs(Math.round(diff))}{unit}
          </span>
        )}
        {diff === 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-slate-500">
            <Minus className="w-2.5 h-2.5" />
          </span>
        )}
      </div>
    </div>
  );
}

export default function WhatIfSimulator({ params, onParamsChange, result }: WhatIfSimulatorProps) {
  const hasChanges = params.additionalBeds > 0 || params.additionalNurses > 0 ||
                     params.additionalDoctors > 0 || params.patientSurgePercent !== 0;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-violet-400" />
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">What-If Simulator</h3>
        </div>
        {hasChanges && (
          <button
            onClick={() => onParamsChange({ additionalBeds: 0, additionalNurses: 0, additionalDoctors: 0, patientSurgePercent: 0 })}
            className="text-[10px] text-slate-500 hover:text-slate-700 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
        <ParamControl
          label="Additional Beds"
          value={params.additionalBeds}
          onChange={(v) => onParamsChange({ ...params, additionalBeds: v })}
          max={15}
        />
        <ParamControl
          label="Additional Nurses"
          value={params.additionalNurses}
          onChange={(v) => onParamsChange({ ...params, additionalNurses: v })}
          max={10}
        />
        <ParamControl
          label="Additional Doctors"
          value={params.additionalDoctors}
          onChange={(v) => onParamsChange({ ...params, additionalDoctors: v })}
          max={8}
        />
        <ParamControl
          label="Patient Surge"
          value={params.patientSurgePercent}
          onChange={(v) => onParamsChange({ ...params, patientSurgePercent: v })}
          min={-30}
          max={50}
          suffix="%"
        />
      </div>

      {/* Results */}
      <div className="space-y-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-500 uppercase font-medium">Projected Impact</span>
          <span className="text-[9px] text-slate-500 italic">Simulation Estimate</span>
        </div>

        <CompareRow label="Occupancy" before={result.baseline.occupancyPercent} after={result.simulated.occupancyPercent} unit="%" />
        <CompareRow label="Wait Time" before={result.baseline.waitingTime} after={result.simulated.waitingTime} unit=" min" />
        <CompareRow label="Beds Available" before={result.baseline.availableBeds} after={result.simulated.availableBeds} unit="" inverse />

        {/* Pressure transition */}
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-300">
          <span className="text-xs text-slate-500">Pressure Level</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${pressureColor[result.impact.pressureBefore]}`}>
              {result.impact.pressureBefore}
            </span>
            <span className="text-slate-500">→</span>
            <span className={`text-xs font-bold ${pressureColor[result.impact.pressureAfter]}`}>
              {result.impact.pressureAfter}
            </span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-3 text-[9px] text-slate-500 italic">
        This is a simulation estimate. Not a clinical guarantee. Production deployment would require hospital-specific validation.
      </p>
    </div>
  );
}
