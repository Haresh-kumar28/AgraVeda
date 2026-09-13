import { AlertTriangle, Shield, AlertCircle, XCircle } from 'lucide-react';
import { PressureResult, PressureLevel } from '../engines/pressureEngine';

interface PressureIndicatorProps {
  pressure: PressureResult;
}

const config: Record<PressureLevel, {
  icon: typeof Shield;
  bg: string;
  border: string;
  text: string;
  glow: string;
  label: string;
}> = {
  NORMAL: {
    icon: Shield,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    glow: '',
    label: 'NORMAL',
  },
  WATCH: {
    icon: AlertCircle,
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-amber-700',
    glow: '',
    label: 'WATCH',
  },
  HIGH: {
    icon: AlertTriangle,
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-700',
    glow: '',
    label: 'HIGH',
  },
  CRITICAL: {
    icon: XCircle,
    bg: 'bg-red-500/10',
    border: 'border-red-200',
    text: 'text-red-700',
    glow: 'ring-1 ring-red-500/20',
    label: 'CRITICAL',
  },
};

export default function PressureIndicator({ pressure }: PressureIndicatorProps) {
  const c = config[pressure.level];
  const Icon = c.icon;

  return (
    <div className={`${c.bg} border ${c.border} rounded-lg p-4 ${c.glow}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${c.text}`} />
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Operational Pressure</h3>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <span className={`text-3xl font-bold ${c.text}`}>{c.label}</span>
        <span className={`text-xs ${c.text} opacity-70`}>Score: {pressure.score}/100</span>
      </div>

      <p className="text-xs text-slate-500 mb-3">{pressure.description}</p>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/50 rounded px-2 py-1.5">
          <div className="text-[10px] text-slate-500 uppercase">Projected Occupancy</div>
          <div className={`text-sm font-bold ${pressure.projectedOccupancy > 85 ? 'text-red-700' : 'text-slate-900'}`}>
            {pressure.projectedOccupancy.toFixed(0)}%
          </div>
        </div>
        <div className="bg-white/50 rounded px-2 py-1.5">
          <div className="text-[10px] text-slate-500 uppercase">Time to Impact</div>
          <div className={`text-sm font-bold ${pressure.timeToImpact !== 'N/A' ? c.text : 'text-slate-500'}`}>
            {pressure.timeToImpact}
          </div>
        </div>
      </div>
    </div>
  );
}
