import { AlertTriangle, CheckCircle, MapPin, Clock, Zap } from 'lucide-react';
import { Recommendation } from '../engines/recommendationEngine';
import { PressureLevel } from '../engines/pressureEngine';

interface RecommendationPanelProps {
  recommendations: Recommendation[];
  onSimulateAction: () => void;
}

const urgencyConfig: Record<PressureLevel, { bg: string; border: string; text: string }> = {
  NORMAL: { bg: 'bg-emerald-500/10', border: 'border-emerald-200', text: 'text-emerald-700' },
  WATCH: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-amber-700' },
  HIGH: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-700' },
  CRITICAL: { bg: 'bg-red-500/10', border: 'border-red-200', text: 'text-red-700' },
};

export default function RecommendationPanel({ recommendations, onSimulateAction }: RecommendationPanelProps) {
  if (recommendations.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-4 h-4 text-emerald-700" />
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Decision Brief</h3>
        </div>
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-emerald-700" />
          <p className="text-sm text-emerald-700">No urgent actions required. Operations within normal parameters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-700" />
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Decision Brief</h3>
          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium">
            {recommendations.length} action{recommendations.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, idx) => {
          const cfg = urgencyConfig[rec.urgency];

          return (
            <div key={rec.id} className={`${cfg.bg} border ${cfg.border} rounded-lg p-3`}>
              {/* Urgency badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cfg.text} ${cfg.bg} border ${cfg.border}`}>
                  {rec.urgency}
                </span>
                <span className="text-[10px] text-slate-500 font-medium uppercase">— {rec.category}</span>
              </div>

              {/* WHAT */}
              <div className="mb-2">
                <p className="text-[10px] text-slate-500 uppercase font-medium mb-0.5">What</p>
                <p className="text-sm text-slate-900 font-medium">{rec.what}</p>
              </div>

              {/* WHEN + WHERE row */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-medium mb-0.5 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> When
                  </p>
                  <p className="text-xs text-slate-700">{rec.when}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-medium mb-0.5 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" /> Where
                  </p>
                  <p className="text-xs text-slate-700">{rec.where}</p>
                </div>
              </div>

              {/* WHY */}
              <div className="mb-2">
                <p className="text-[10px] text-slate-500 uppercase font-medium mb-0.5">Why</p>
                <div className="space-y-0.5">
                  {rec.rationale.map((r, i) => (
                    <p key={i} className="text-[11px] text-slate-500 flex items-start gap-1">
                      <span className="text-slate-500 mt-0.5">•</span> {r}
                    </p>
                  ))}
                </div>
              </div>

              {/* ACTION */}
              <div className="mb-2">
                <p className="text-[10px] text-slate-500 uppercase font-medium mb-0.5 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" /> Recommended Action
                </p>
                <p className="text-xs text-slate-900 font-medium">{rec.action}</p>
              </div>

              {/* IMPACT */}
              <div className="mb-2 bg-white/50 rounded px-2 py-1.5">
                <p className="text-[10px] text-slate-500 uppercase font-medium mb-0.5">Expected Impact</p>
                <p className="text-xs text-slate-700">{rec.impact}</p>
              </div>

              {/* Simulate button on first rec */}
              {idx === 0 && (
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={onSimulateAction}
                    className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-200 text-blue-600 text-xs font-medium rounded transition-colors"
                  >
                    Simulate Action →
                  </button>
                  <span className="text-[9px] text-slate-500 italic">
                    Test impact in What-If Simulator
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Alert fatigue notice */}
      <p className="mt-3 text-[9px] text-slate-500 italic text-center">
        Showing top {recommendations.length} action{recommendations.length !== 1 ? 's' : ''} prioritized by severity, time-to-impact, and resource impact. Low-priority alerts suppressed to prevent alert fatigue.
      </p>
    </div>
  );
}
