import { Shield, AlertCircle, AlertTriangle, XCircle } from 'lucide-react';
import { PressureResult, PressureLevel } from '../engines/pressureEngine';

interface PressureIndicatorProps {
  pressure: PressureResult;
}

const config: Record<PressureLevel, {
  icon: typeof Shield;
  bg: string;
  border: string;
  text: string;
  badgeBg: string;
  label: string;
}> = {
  NORMAL: {
    icon: Shield,
    bg: 'bg-white',
    border: 'border-[#A6F4C5]',
    text: 'text-[#0E7A4E]',
    badgeBg: 'bg-[#ECFDF3]',
    label: 'NORMAL',
  },
  WATCH: {
    icon: AlertCircle,
    bg: 'bg-white',
    border: 'border-[#FEDF89]',
    text: 'text-[#B54708]',
    badgeBg: 'bg-[#FFFAEB]',
    label: 'WATCH',
  },
  HIGH: {
    icon: AlertTriangle,
    bg: 'bg-white',
    border: 'border-[#FEDF89]',
    text: 'text-[#B54708]',
    badgeBg: 'bg-[#FFFAEB]',
    label: 'HIGH',
  },
  CRITICAL: {
    icon: XCircle,
    bg: 'bg-white',
    border: 'border-[#FECDCA]',
    text: 'text-[#B42318]',
    badgeBg: 'bg-[#FEF3F2]',
    label: 'CRITICAL',
  },
};

export default function PressureIndicator({ pressure }: PressureIndicatorProps) {
  const c = config[pressure.level];
  const Icon = c.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-4 h-4 ${c.text}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222]">
            Operational Pressure
          </h3>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${c.badgeBg} ${c.text}`}>
          {c.label}
        </span>
      </div>

      <div className="flex items-baseline justify-between pt-1">
        <div className={`text-3xl font-extrabold tracking-tight ${c.text}`}>
          {pressure.score}
          <span className="text-sm font-normal text-[#727272] ml-1">/ 100</span>
        </div>
        <span className="text-[11px] text-[#727272]">Weighted Signal</span>
      </div>

      {/* Progress meter */}
      <div className="w-full h-1.5 bg-[#F8F9FA] rounded-full overflow-hidden border border-[#EAEAEA]">
        <div
          className={`h-full ${
            pressure.score >= 80
              ? 'bg-[#B42318]'
              : pressure.score >= 50
              ? 'bg-[#B54708]'
              : 'bg-[#0E7A4E]'
          }`}
          style={{ width: `${Math.min(100, pressure.score)}%` }}
        />
      </div>

      <p className="text-xs text-[#727272] leading-relaxed">
        {pressure.description}
      </p>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EAEAEA] text-xs">
        <div className="p-2 bg-[#F8F9FA] rounded border border-[#EAEAEA]">
          <div className="text-[10px] uppercase font-bold text-[#727272]">Projected Occ</div>
          <div className="text-sm font-bold text-[#222222] mt-0.5">
            {pressure.projectedOccupancy.toFixed(0)}%
          </div>
        </div>
        <div className="p-2 bg-[#F8F9FA] rounded border border-[#EAEAEA]">
          <div className="text-[10px] uppercase font-bold text-[#727272]">Time to Impact</div>
          <div className={`text-sm font-bold mt-0.5 ${c.text}`}>
            {pressure.timeToImpact}
          </div>
        </div>
      </div>
    </div>
  );
}
