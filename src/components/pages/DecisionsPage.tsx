import React, { useState } from 'react';
import { Recommendation } from '../../engines/recommendationEngine';
import { PressureResult } from '../../engines/pressureEngine';
import { BottleneckResult } from '../../engines/bottleneckEngine';
import { WhatIfResult } from '../../engines/whatIfSimulator';
import { FileText, CheckCircle2, ChevronRight, Sliders, ShieldCheck, Clock, MapPin, Zap } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

interface DecisionsPageProps {
  recommendations: Recommendation[];
  pressure: PressureResult;
  bottlenecks: BottleneckResult;
  whatIfResult: WhatIfResult;
  onSimulateAction: () => void;
  onNavigate: (page: string) => void;
}

export const DecisionsPage: React.FC<DecisionsPageProps> = ({
  recommendations,
  pressure,
  bottlenecks: _bottlenecks,
  whatIfResult: _whatIfResult,
  onSimulateAction,
  onNavigate,
}) => {
  const { can } = useAuth();
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const handleAcknowledge = (id: string) => {
    if (!can('acknowledge_decisions')) return;
    setAcknowledged((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]';
      case 'HIGH':
        return 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]';
      case 'WATCH':
        return 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]';
      default:
        return 'bg-[#ECFDF3] text-[#0E7A4E] border-[#A6F4C5]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1B74E4]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#222222]">
              Operational Decision Briefs
            </h1>
          </div>
          <p className="text-xs text-[#727272] mt-1">
            Explainable action recommendations structured as: What is happening? Why? What may happen next? What should the team consider?
          </p>
        </div>

        <div className="text-xs text-[#727272] bg-[#F8F9FA] border border-[#EAEAEA] px-3 py-1.5 rounded">
          Active Pressure Signal: <strong className="text-[#B42318]">{pressure.level} ({pressure.score}/100)</strong>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="p-8 bg-white border border-[#EAEAEA] rounded-md text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#ECFDF3] text-[#0E7A4E] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#222222]">No Urgent Escalations Required</h2>
          <p className="text-xs text-[#727272] max-w-md mx-auto">
            Emergency department operations and provider ratios are currently within acceptable operational boundaries.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => {
            const isAck = acknowledged.has(rec.id);
            return (
              <div
                key={rec.id}
                className={`p-6 rounded-md border bg-white transition-all space-y-4 ${
                  isAck
                    ? 'border-[#EAEAEA] opacity-75'
                    : 'border-[#EAEAEA] shadow-sm'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getUrgencyBadge(
                        rec.urgency
                      )}`}
                    >
                      {rec.urgency}
                    </span>
                    <span className="text-xs text-[#727272]">
                      Priority: <strong>{rec.priority}</strong>
                    </span>
                    <span className="text-xs text-[#727272]">
                      Area: <strong>{rec.category}</strong>
                    </span>
                  </div>

                  {isAck && (
                    <span className="text-[11px] font-medium text-[#0E7A4E] bg-[#ECFDF3] px-2 py-0.5 rounded border border-[#A6F4C5]">
                      Acknowledged by User
                    </span>
                  )}
                </div>

                {/* 1. What is happening? */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#727272]">
                    1. What is happening?
                  </div>
                  <h2 className="text-base font-bold text-[#222222] mt-0.5">
                    {rec.what}
                  </h2>
                </div>

                {/* Location & Timeframe */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-[#F8F9FA] rounded border border-[#EAEAEA] text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#1B74E4] shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#727272]">Location / Unit</div>
                      <div className="font-semibold text-[#222222]">{rec.where}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#1B74E4] shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#727272]">Time Horizon</div>
                      <div className="font-semibold text-[#222222]">{rec.when}</div>
                    </div>
                  </div>
                </div>

                {/* 2. Why is this occurring? */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#727272] mb-1">
                    2. Why is this occurring? (Contributing Operational Drivers)
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-[#727272]">
                    {rec.rationale.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                {/* 3. Recommended Operational Consideration */}
                <div className="p-3.5 bg-[#EFF8FF] border border-[#B2DDFF] rounded text-xs text-[#175CD3]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#175CD3] flex items-center gap-1.5 mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>3. What should the operational team consider?</span>
                  </div>
                  <p className="text-xs font-semibold text-[#1558B0] leading-relaxed">
                    {rec.action}
                  </p>
                  <p className="text-[11px] text-[#175CD3] mt-1">
                    <strong>Expected Impact:</strong> {rec.impact}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EAEAEA]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSimulateAction();
                        onNavigate('what-if');
                      }}
                      className="h-8 px-3 rounded bg-[#1B74E4] hover:bg-[#1558B0] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Test Intervention in What-If</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {can('acknowledge_decisions') ? (
                    <button
                      onClick={() => handleAcknowledge(rec.id)}
                      disabled={isAck}
                      className="h-8 px-3 rounded bg-white border border-[#EAEAEA] hover:bg-[#F8F9FA] text-xs font-semibold text-[#222222] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isAck ? 'Acknowledged' : 'Mark as Acknowledged'}
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#727272] italic">
                      Read-only role (acknowledgement restricted to managers & admins)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Safety Notice */}
      <div className="p-4 bg-white border border-[#EAEAEA] rounded-md text-xs text-[#727272] flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#1B74E4] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#222222]">Advisory Decision Support Notice:</span>
          <p className="mt-0.5 leading-relaxed">
            Recommendations are algorithmic heuristics intended to support charge nurse and ED director workflow coordination. They do not represent clinical triage or individual patient care directives.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DecisionsPage;
