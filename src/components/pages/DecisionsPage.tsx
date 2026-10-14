import React, { useState } from 'react';
import { Recommendation } from '../../engines/recommendationEngine';
import { PressureResult } from '../../engines/pressureEngine';
import { BottleneckResult } from '../../engines/bottleneckEngine';
import { WhatIfResult } from '../../engines/whatIfSimulator';
import {
  FileText,
  CheckCircle2,
  ChevronRight,
  Sliders,
  ShieldCheck,
  Clock,
  MapPin,
  Zap,
  Info,
  Calendar,
  Layers,
  AlertTriangle,
  RotateCcw,
  Check,
  Filter,
  Eye,
  History,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { ROLE_LABELS } from '../../auth/roles';

interface DecisionsPageProps {
  recommendations: Recommendation[];
  pressure: PressureResult;
  bottlenecks: BottleneckResult;
  whatIfResult: WhatIfResult;
  onSimulateAction: () => void;
  onNavigate: (page: string) => void;
}

interface AcknowledgmentRecord {
  id: string;
  acknowledgedAt: string;
  acknowledgedBy: string;
  role: string;
}

export const DecisionsPage: React.FC<DecisionsPageProps> = ({
  recommendations,
  pressure,
  bottlenecks: _bottlenecks,
  whatIfResult: _whatIfResult,
  onSimulateAction,
  onNavigate,
}) => {
  const { user, can } = useAuth();
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged'>('all');
  const [acknowledgments, setAcknowledgments] = useState<Record<string, AcknowledgmentRecord>>({});
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  const handleAcknowledge = (id: string) => {
    if (!can('acknowledge_decisions')) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dateStr = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    setAcknowledgments((prev) => ({
      ...prev,
      [id]: {
        id,
        acknowledgedAt: `${dateStr} at ${timeStr}`,
        acknowledgedBy: user?.name || 'Authorized Supervisor',
        role: user?.role ? ROLE_LABELS[user.role] : 'Operations Director',
      },
    }));
  };

  const handleUnacknowledge = (id: string) => {
    if (!can('acknowledge_decisions')) return;
    setAcknowledgments((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const toggleDetails = (id: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getPriorityBadge = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]';
      case 'HIGH':
        return 'bg-[#FEF6EE] text-[#B54708] border-[#F9DBAF]';
      case 'MEDIUM':
        return 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]';
      default:
        return 'bg-[#FAFAF8] text-[#4A4A4A] border-[#E8E4DF]';
    }
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

  const filteredRecs = recommendations.filter((rec) => {
    const isAck = !!acknowledgments[rec.id];
    if (filter === 'active') return !isAck;
    if (filter === 'acknowledged') return isAck;
    return true;
  });

  const activeCount = recommendations.filter((r) => !acknowledgments[r.id]).length;
  const ackCount = Object.keys(acknowledgments).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DF]">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1B74E4]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Operational Decision Briefs & Escalation Workflows
            </h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Explainable operational advisories detailing observed sensor signals, forward arrival projections, and actionable resource interventions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs text-[#6B6B6B] bg-white border border-[#E8E4DF] px-3 py-1.5 rounded flex items-center gap-1.5 shadow-sm">
            <Activity className="w-3.5 h-3.5 text-[#1B74E4]" />
            <span>Pressure State:</span>
            <strong className={`font-semibold ${
              pressure.level === 'CRITICAL' ? 'text-[#B42318]' :
              pressure.level === 'HIGH' ? 'text-[#B54708]' : 'text-[#0E7A4E]'
            }`}>
              {pressure.level} ({pressure.score}/100)
            </strong>
          </div>

          <div className="text-xs text-[#6B6B6B] bg-white border border-[#E8E4DF] px-3 py-1.5 rounded flex items-center gap-1.5 shadow-sm">
            <History className="w-3.5 h-3.5 text-[#6B6B6B]" />
            <span>Active Briefs:</span>
            <strong className="text-[#1A1A1A] font-medium">{activeCount} pending review</strong>
          </div>
        </div>
      </div>

      {/* Filter and Workflow Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-[#E8E4DF] shadow-sm">
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-[#6B6B6B]" />
          <span className="font-semibold text-[#1A1A1A] mr-1">Filter View:</span>

          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#1B74E4] text-white font-semibold'
                : 'bg-[#FAFAF8] text-[#6B6B6B] hover:text-[#1A1A1A] border border-[#E8E4DF]'
            }`}
          >
            All Briefs ({recommendations.length})
          </button>

          <button
            onClick={() => setFilter('active')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filter === 'active'
                ? 'bg-[#1B74E4] text-white font-semibold'
                : 'bg-[#FAFAF8] text-[#6B6B6B] hover:text-[#1A1A1A] border border-[#E8E4DF]'
            }`}
          >
            Active Escalations ({activeCount})
          </button>

          <button
            onClick={() => setFilter('acknowledged')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filter === 'acknowledged'
                ? 'bg-[#1B74E4] text-white font-semibold'
                : 'bg-[#FAFAF8] text-[#6B6B6B] hover:text-[#1A1A1A] border border-[#E8E4DF]'
            }`}
          >
            Acknowledged ({ackCount})
          </button>
        </div>

        <div className="text-[11px] text-[#6B6B6B] flex items-center gap-2">
          <span>Continuous stream evaluation</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A]" />
        </div>
      </div>

      {/* Briefs List */}
      {filteredRecs.length === 0 ? (
        <div className="p-10 bg-white border border-[#E8E4DF] rounded-lg text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#ECFDF3] text-[#0E7A4E] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#1A1A1A]">No Escalation Briefs in this View</h2>
          <p className="text-xs text-[#6B6B6B] max-w-md mx-auto leading-relaxed">
            {filter === 'acknowledged'
              ? 'No decision briefs have been marked as acknowledged yet.'
              : 'Emergency department operations and provider ratios are currently within acceptable operational boundaries.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredRecs.map((rec, index) => {
            const ackRecord = acknowledgments[rec.id];
            const isAck = !!ackRecord;
            const isExpanded = !!expandedDetails[rec.id];
            const isPrimary = index === 0 && !isAck;

            return (
              <div
                key={rec.id}
                className={`p-6 rounded-lg border bg-white transition-all space-y-5 shadow-sm ${
                  isAck
                    ? 'border-[#E8E4DF] bg-[#FAFAF8]/60 opacity-90'
                    : isPrimary
                    ? 'border-[#B2DDFF] ring-1 ring-[#1B74E4]/15'
                    : 'border-[#E8E4DF]'
                }`}
              >
                {/* 1. Brief Metadata Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8E4DF]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadge(
                        rec.priority
                      )}`}
                    >
                      {rec.priority} Priority
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getUrgencyBadge(
                        rec.urgency
                      )}`}
                    >
                      {rec.urgency} Urgency
                    </span>

                    <span className="text-xs text-[#6B6B6B]">
                      Resource System: <strong className="text-[#1A1A1A] capitalize">{rec.category}</strong>
                    </span>

                    <span className="text-[11px] font-mono text-[#6B6B6B] bg-[#FAFAF8] px-1.5 py-0.5 rounded border border-[#E8E4DF]">
                      {rec.id}
                    </span>
                  </div>

                  {/* Acknowledgment Stamp */}
                  {isAck ? (
                    <div className="inline-flex items-center gap-1.5 text-xs text-[#0E7A4E] bg-[#ECFDF3] px-2.5 py-1 rounded border border-[#A6F4C5] shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        Acknowledged by <strong>{ackRecord.acknowledgedBy}</strong> ({ackRecord.role}) on {ackRecord.acknowledgedAt}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-medium text-[#B54708] bg-[#FFFAEB] px-2 py-0.5 rounded border border-[#FEDF89]">
                      Pending Review
                    </span>
                  )}
                </div>

                {/* 2. Operational Situation Identified */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#B54708]" />
                    <span>Operational Situation Identified</span>
                  </div>
                  <h2 className="text-base font-bold text-[#1A1A1A] mt-1 leading-snug">
                    {rec.what}
                  </h2>
                </div>

                {/* Location and Impact Horizon Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#FAFAF8] rounded-md border border-[#E8E4DF] text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#1B74E4] shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#6B6B6B]">Target Operational Unit</div>
                      <div className="font-semibold text-[#1A1A1A] mt-0.5">{rec.where}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#1B74E4] shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#6B6B6B]">Anticipated Pressure Horizon</div>
                      <div className="font-semibold text-[#1A1A1A] mt-0.5">{rec.when}</div>
                    </div>
                  </div>
                </div>

                {/* 3. Explainable Evidence Grid: Observed Sensor Signals vs Model Projections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Observed Sensor Signals */}
                  <div className="p-3.5 bg-white border border-[#E8E4DF] rounded-md space-y-2">
                    <div className="flex items-center justify-between border-b border-[#E8E4DF] pb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-[#0E7A4E]" />
                        Observed EHR Stream Signals (Now)
                      </span>
                      <span className="text-[9px] text-[#0E7A4E] font-medium bg-[#ECFDF3] px-1.5 py-0.2 rounded border border-[#A6F4C5]">
                        Verified Real-Time
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#4A4A4A]">
                      {rec.observedInputs.map((obs, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#1B74E4] font-bold leading-tight">•</span>
                          <span>{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right: Forward Predictive Projections */}
                  <div className="p-3.5 bg-white border border-[#E8E4DF] rounded-md space-y-2">
                    <div className="flex items-center justify-between border-b border-[#E8E4DF] pb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#1B74E4]" />
                        Forward Model Projections (+2h Peak)
                      </span>
                      <span className="text-[9px] text-[#1B74E4] font-medium bg-[#EAF4FF] px-1.5 py-0.2 rounded border border-[#B2DDFF]">
                        Poisson Analytical Model
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#4A4A4A]">
                      {rec.forecastValues.map((fc, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#1B74E4] font-bold leading-tight">•</span>
                          <span>{fc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 4. Contributing Operational Drivers */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
                    Contributing Operational Drivers (Why this occurs)
                  </span>
                  <div className="p-3 bg-[#FAFAF8] rounded border border-[#E8E4DF]">
                    <ul className="space-y-1 text-xs text-[#4A4A4A]">
                      {rec.rationale.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#B54708] font-bold leading-tight">→</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 5. Recommended Operational Consideration & Impact Heuristic */}
                <div className="p-4 bg-[#EFF8FF] border border-[#B2DDFF] rounded-lg text-xs text-[#175CD3] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#175CD3] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Recommended Operational Consideration</span>
                    </span>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-white text-[#175CD3] border border-[#B2DDFF]">
                      {rec.heuristicType === 'ESTIMATED_HEURISTIC' ? 'Illustrative Sensitivity Estimate' : 'Operational Staffing Standard'}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-[#1558B0] leading-snug">
                    {rec.action}
                  </p>

                  <div className="pt-2 border-t border-[#B2DDFF]/70 text-xs text-[#175CD3] space-y-1">
                    <p className="leading-relaxed">
                      <strong>Expected Consequence:</strong> {rec.impact}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-[#175CD3]/80 pt-1">
                      <span><strong>Key Assumption:</strong> {rec.assumptions}</span>
                      <button
                        type="button"
                        onClick={() => toggleDetails(rec.id)}
                        className="text-[#1558B0] underline text-left sm:text-right font-medium"
                      >
                        {isExpanded ? 'Hide Assumptions & Limitations' : 'View Assumptions & Limitations'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Limitations and Assumptions Drawer */}
                  {isExpanded && (
                    <div className="mt-2 p-3 bg-white/80 rounded border border-[#B2DDFF] text-[11px] text-[#4A4A4A] space-y-1.5 animate-in fade-in duration-150">
                      <div>
                        <strong className="text-[#1A1A1A]">Operational Limitations:</strong> {rec.limitations}
                      </div>
                      <div>
                        <strong className="text-[#1A1A1A]">Data Processing Window:</strong> {rec.sourceWindow || 'Recent 3h sliding average + 2h Poisson forward arrival forecast.'}
                      </div>
                      <div className="text-[10px] text-[#6B6B6B] italic">
                        Notice: Operational impact figures represent deterministic sensitivity modeling. Actual bed turnaround and intake relief require physical verification by clinical nursing leads.
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. Action Workflow & Acknowledgment Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8E4DF]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSimulateAction();
                        onNavigate('what-if');
                      }}
                      className="h-8 px-3.5 rounded bg-[#1B74E4] hover:bg-[#155EC0] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      title="Test this recommended intervention in What-If Simulator without mutating baseline"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Test Intervention in What-If</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onNavigate('resources')}
                      className="h-8 px-3 rounded bg-white hover:bg-[#FAFAF8] text-[#1A1A1A] border border-[#E8E4DF] text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>Inspect Resources</span>
                    </button>
                  </div>

                  {can('acknowledge_decisions') ? (
                    <div className="flex items-center gap-2">
                      {isAck ? (
                        <button
                          onClick={() => handleUnacknowledge(rec.id)}
                          className="h-8 px-3 rounded bg-white border border-[#E8E4DF] hover:bg-[#FAFAF8] text-xs font-medium text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Reopen brief for review"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reopen Brief</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAcknowledge(rec.id)}
                          className="h-8 px-3.5 rounded bg-white border border-[#12B76A] hover:bg-[#ECFDF3] text-xs font-bold text-[#0E7A4E] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 text-[#12B76A]" />
                          <span>Mark as Acknowledged</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#6B6B6B] italic">
                      Read-only role: Acknowledgment requires charge nurse or supervisor permissions.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Advisory & Clinical Safety Notice */}
      <div className="p-4 bg-white border border-[#E8E4DF] rounded-lg text-xs text-[#6B6B6B] flex items-start gap-3 shadow-sm">
        <ShieldCheck className="w-5 h-5 text-[#1B74E4] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-[#1A1A1A] block">
            Advisory Clinical Decision Support Boundary:
          </span>
          <p className="leading-relaxed">
            AgraVeda Operational Decision Briefs provide algorithmic decision support for emergency department charge nurses, patient placement coordinators, and operations directors. They do not formulate clinical diagnoses, execute autonomous triage overrides, or prescribe patient-specific therapeutic interventions. All bed assignments and clinical actions remain under the sole authority of licensed healthcare professionals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DecisionsPage;
