import { Target } from 'lucide-react';
import { BottleneckResult } from '../engines/bottleneckEngine';

interface BottleneckPanelProps {
  bottlenecks: BottleneckResult;
}

const statusColors = {
  ok: 'text-emerald-700',
  warning: 'text-orange-700',
  critical: 'text-red-700',
};

const statusBg = {
  ok: 'bg-emerald-500/10',
  warning: 'bg-orange-500/10',
  critical: 'bg-red-500/10',
};

export default function BottleneckPanel({ bottlenecks }: BottleneckPanelProps) {
  const primary = bottlenecks.primary;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-orange-700" />
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Primary Bottleneck</h3>
      </div>

      {/* Primary bottleneck highlight */}
      <div className={`${statusBg[primary.status]} border border-slate-300 rounded-lg p-3 mb-3`}>
        <div className={`text-lg font-bold ${statusColors[primary.status]} uppercase`}>{primary.label}</div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Current</div>
            <div className="text-sm font-bold text-slate-900">{primary.currentUtilization.toFixed(0)}%</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Projected</div>
            <div className={`text-sm font-bold ${statusColors[primary.status]}`}>{primary.projectedUtilization.toFixed(0)}%</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Gap</div>
            <div className={`text-sm font-bold ${primary.gap < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
              {primary.gap > 0 ? '+' : ''}{primary.gap}
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 italic">
        {primary.label} is projected to become the primary operational constraint.
      </p>
    </div>
  );
}
