import React, { useState } from 'react';
import { Shield, AlertCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { PressureResult, PressureLevel } from '../engines/pressureEngine';

interface PressureIndicatorProps {
  pressure: PressureResult;
}

const config: Record<
  PressureLevel,
  {
    icon: typeof Shield;
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    label: string;
    description: string;
  }
> = {
  NORMAL: {
    icon: Shield,
    bg: 'bg-white',
    border: 'border-[#A6F4C5]',
    text: 'text-[#0E7A4E]',
    badgeBg: 'bg-[#ECFDF3]',
    label: 'NORMAL',
    description: 'Demand within standard operational reserve limits.',
  },
  WATCH: {
    icon: AlertCircle,
    bg: 'bg-white',
    border: 'border-[#FEDF89]',
    text: 'text-[#B54708]',
    badgeBg: 'bg-[#FFFAEB]',
    label: 'WATCH',
    description: 'Elevated patient inflow or early queue accumulation.',
  },
  HIGH: {
    icon: AlertTriangle,
    bg: 'bg-white',
    border: 'border-[#FEDF89]',
    text: 'text-[#B54708]',
    badgeBg: 'bg-[#FFFAEB]',
    label: 'HIGH',
    description: 'Significant pressure. Bed or staff buffers entering deficit.',
  },
  CRITICAL: {
    icon: XCircle,
    bg: 'bg-white',
    border: 'border-[#FECDCA]',
    text: 'text-[#B42318]',
    badgeBg: 'bg-[#FEF3F2]',
    label: 'CRITICAL',
    description: 'Severe operational saturation. Immediate mitigation recommended.',
  },
};

export default function PressureIndicator({ pressure }: PressureIndicatorProps) {
  const [showSignalBreakdown, setShowSignalBreakdown] = useState(false);
  const c = config[pressure.level];
  const Icon = c.icon;

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${c.text}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
            Operational Pressure
          </h3>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${c.badgeBg} ${c.text}`}>
          {c.label}
        </span>
      </div>

      {/* Main Score & Meter */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${c.text} font-mono`}>
            {pressure.score}
            <span className="text-sm font-normal text-[#6B6B6B] ml-1">/ 100</span>
          </div>
          <span className="text-[11px] font-medium text-[#6B6B6B]">
            Weighted Heuristic Score
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-[#F5F3F0] rounded-full overflow-hidden border border-[#E8E4DF]">
          <div
            className={`h-full transition-all duration-300 ${
              pressure.score >= 70
                ? 'bg-[#B42318]'
                : pressure.score >= 50
                ? 'bg-[#B54708]'
                : pressure.score >= 30
                ? 'bg-[#EAAA08]'
                : 'bg-[#0E7A4E]'
            }`}
            style={{ width: `${Math.min(100, pressure.score)}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-[#6B6B6B] leading-relaxed">
        {pressure.description}
      </p>

      {/* Horizon & Impact Indicators */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 bg-[#FAFAF8] rounded border border-[#E8E4DF]">
          <div className="text-[10px] uppercase font-bold text-[#6B6B6B]">Projected Occ (+2h)</div>
          <div className="text-sm font-bold text-[#1A1A1A] mt-0.5 font-mono">
            {pressure.projectedOccupancy.toFixed(0)}%
          </div>
        </div>
        <div className="p-2.5 bg-[#FAFAF8] rounded border border-[#E8E4DF]">
          <div className="text-[10px] uppercase font-bold text-[#6B6B6B]">Time to Impact</div>
          <div className={`text-sm font-bold mt-0.5 ${c.text}`}>
            {pressure.timeToImpact !== 'N/A' ? pressure.timeToImpact : 'Immediate'}
          </div>
        </div>
      </div>

      {/* Transparent Contributing Signals Breakdown */}
      <div className="pt-2 border-t border-[#E8E4DF]">
        <button
          onClick={() => setShowSignalBreakdown(!showSignalBreakdown)}
          className="w-full flex items-center justify-between text-left text-xs font-semibold text-[#1B74E4] hover:underline cursor-pointer py-1"
          aria-expanded={showSignalBreakdown}
        >
          <span>Contributing Analytical Factors</span>
          {showSignalBreakdown ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#6B6B6B]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6B6B]" />
          )}
        </button>

        {showSignalBreakdown && (
          <div className="mt-2 p-3 bg-[#FAFAF8] rounded border border-[#E8E4DF] space-y-2 text-[11px] text-[#6B6B6B]">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span>Treatment Bed Occupancy:</span>
                <span className="font-mono font-bold text-[#1A1A1A]">Max 30 pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Projected Surge Velocity (+2h):</span>
                <span className="font-mono font-bold text-[#1A1A1A]">Max 25 pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Waiting Queue Backlog:</span>
                <span className="font-mono font-bold text-[#1A1A1A]">Max 20 pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Available Reserve Depletion:</span>
                <span className="font-mono font-bold text-[#1A1A1A]">Max 15 pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Staffing Ratio Ceiling:</span>
                <span className="font-mono font-bold text-[#1A1A1A]">Max 10 pts</span>
              </div>
            </div>
            <div className="pt-2 border-t border-[#E8E4DF] flex items-center gap-1.5 text-[10px] text-[#6B6B6B]">
              <Info className="w-3 h-3 text-[#1B74E4] shrink-0" />
              <span>Calibrated against 14-day emergency department operational demand cycles.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
