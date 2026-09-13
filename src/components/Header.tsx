import { Activity, AlertTriangle, Zap, Radio } from 'lucide-react';
import { PressureLevel } from '../engines/pressureEngine';

type Scenario = 'normal' | 'accident_surge' | 'weekend_peak';

interface HeaderProps {
  scenario: Scenario;
  onScenarioChange: (s: Scenario) => void;
  pressureLevel: PressureLevel;
}

const pressureColors: Record<PressureLevel, string> = {
  NORMAL: 'bg-emerald-500/20 text-emerald-700 border-emerald-200',
  WATCH: 'bg-amber-50 text-amber-700 border-yellow-500/30',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-500/30',
  CRITICAL: 'bg-red-500/20 text-red-700 border-red-200',
};

const pressureDots: Record<PressureLevel, string> = {
  NORMAL: 'bg-emerald-400',
  WATCH: 'bg-yellow-400',
  HIGH: 'bg-orange-400',
  CRITICAL: 'bg-red-400',
};

export default function Header({ scenario, onScenarioChange, pressureLevel }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">EDPulse</h1>
                <p className="text-[10px] text-slate-500 -mt-0.5 tracking-wider uppercase">Predictive ED Operations Intelligence</p>
              </div>
            </div>
          </div>

          {/* Center: Status */}
          <div className="hidden md:flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${pressureColors[pressureLevel]}`}>
              <span className={`w-2 h-2 rounded-full ${pressureDots[pressureLevel]} animate-pulse`}></span>
              {pressureLevel}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-xs font-medium">
              <Radio className="w-3 h-3" />
              SIMULATION ACTIVE
            </div>
          </div>

          {/* Right: Scenarios */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onScenarioChange('normal')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                scenario === 'normal'
                  ? 'bg-slate-700 text-slate-900'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Normal Day
            </button>
            <button
              onClick={() => onScenarioChange('weekend_peak')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                scenario === 'weekend_peak'
                  ? 'bg-slate-700 text-slate-900'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Weekend Peak
            </button>
            <button
              onClick={() => onScenarioChange('accident_surge')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                scenario === 'accident_surge'
                  ? 'bg-red-500/20 text-red-700 border border-red-200'
                  : 'text-red-700 hover:bg-red-500/10 border border-transparent hover:border-red-500/20'
              }`}
            >
              <Zap className="w-3 h-3" />
              Run Accident Surge
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
