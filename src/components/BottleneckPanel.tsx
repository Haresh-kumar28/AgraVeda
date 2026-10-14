import React from 'react';
import { Target, AlertTriangle, ArrowRight } from 'lucide-react';
import { BottleneckResult } from '../engines/bottleneckEngine';

interface BottleneckPanelProps {
  bottlenecks: BottleneckResult;
  onNavigate?: (page: string) => void;
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

export default function BottleneckPanel({ bottlenecks, onNavigate }: BottleneckPanelProps) {
  const primary = bottlenecks.primary;

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#B54708]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
            Primary Operational Constraint
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

      {/* Primary Card */}
      <div className="p-3.5 bg-[#FAFAF8] border border-[#E8E4DF] rounded-md space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-[#1A1A1A] block">{primary.label}</span>
            <span className="text-[11px] text-[#6B6B6B]">{primary.description}</span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]">
            Active Bottleneck
          </span>
        </div>

        {/* 3 Metrics: Current vs Projected vs Capacity Gap */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#E8E4DF]">
          <div>
            <div className="text-[9px] uppercase font-bold text-[#6B6B6B]">Current Load</div>
            <div className="text-sm font-bold text-[#1A1A1A] mt-0.5 font-mono">
              {primary.currentUtilization.toFixed(0)}%
            </div>
            <div className="text-[9px] text-[#6B6B6B] mt-0.5">Floor Census</div>
          </div>
          <div>
            <div className="text-[9px] uppercase font-bold text-[#6B6B6B]">Projected (+2h)</div>
            <div className={`text-sm font-bold mt-0.5 font-mono ${statusColors[primary.status]}`}>
              {primary.projectedUtilization.toFixed(0)}%
            </div>
            <div className="text-[9px] text-[#6B6B6B] mt-0.5">Peak Window</div>
          </div>
          <div>
            <div className="text-[9px] uppercase font-bold text-[#6B6B6B]">Net Capacity Gap</div>
            <div
              className={`text-sm font-bold mt-0.5 font-mono ${
                primary.gap < 0 ? 'text-[#B42318]' : 'text-[#0E7A4E]'
              }`}
            >
              {primary.gap > 0 ? `+${primary.gap}` : primary.gap}
            </div>
            <div className="text-[9px] text-[#6B6B6B] mt-0.5">
              {primary.gap < 0 ? 'Deficit' : 'Reserve'}
            </div>
          </div>
        </div>
      </div>

      {/* Impact Explanation */}
      <div className="space-y-1.5 text-xs text-[#6B6B6B]">
        <div className="flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-[#B54708] shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            {primary.impactDetail}
          </p>
        </div>
      </div>

      {/* Action to view details */}
      {onNavigate && (
        <div className="pt-1 flex items-center justify-between border-t border-[#E8E4DF] text-xs">
          <button
            onClick={() => onNavigate('resources')}
            className="text-[11px] font-semibold text-[#1B74E4] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Resource Capacities</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => onNavigate('what-if')}
            className="text-[11px] font-semibold text-[#1A1A1A] hover:text-[#1B74E4] cursor-pointer"
          >
            Simulate Bed Addition →
          </button>
        </div>
      )}
    </div>
  );
}
