import { Target } from 'lucide-react';
import { BottleneckResult } from '../engines/bottleneckEngine';

interface BottleneckPanelProps {
  bottlenecks: BottleneckResult;
}

const statusColors = {
  ok: 'text-[#0E7A4E]',
  warning: 'text-[#B54708]',
  critical: 'text-[#B42318]',
};

const statusBadges = {
  ok: 'bg-[#ECFDF3] text-[#0E7A4E] border-[#A6F4C5]',
  warning: 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]',
  critical: 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]',
};

export default function BottleneckPanel({ bottlenecks }: BottleneckPanelProps) {
  const primary = bottlenecks.primary;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Target className="w-4 h-4 text-[#B54708]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222]">
            Primary Bottleneck
          </h3>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
            statusBadges[primary.status]
          }`}
        >
          {primary.status}
        </span>
      </div>

      <div className="p-3 bg-[#F8F9FA] border border-[#EAEAEA] rounded-md space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#222222]">{primary.label}</span>
          <span className="text-[10px] font-bold uppercase text-[#B42318]">
            Constraint
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-[#EAEAEA]">
          <div>
            <div className="text-[9px] uppercase font-bold text-[#727272]">Current</div>
            <div className="text-xs font-bold text-[#222222] mt-0.5">
              {primary.currentUtilization.toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase font-bold text-[#727272]">Projected (+2h)</div>
            <div className={`text-xs font-bold mt-0.5 ${statusColors[primary.status]}`}>
              {primary.projectedUtilization.toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase font-bold text-[#727272]">Capacity Gap</div>
            <div
              className={`text-xs font-bold mt-0.5 ${
                primary.gap < 0 ? 'text-[#B42318]' : 'text-[#0E7A4E]'
              }`}
            >
              {primary.gap > 0 ? `+${primary.gap}` : primary.gap}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-[#727272] leading-relaxed">
        {primary.impactDetail}
      </p>
    </div>
  );
}
