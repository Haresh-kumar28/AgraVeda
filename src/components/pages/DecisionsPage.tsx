import React, { useState } from 'react';
import { Recommendation } from '../../engines/recommendationEngine';
import { PressureResult } from '../../engines/pressureEngine';
import { BottleneckResult } from '../../engines/bottleneckEngine';
import { WhatIfResult } from '../../engines/whatIfSimulator';
import { AlertCircle, CheckCircle, Info, ChevronRight, Play } from 'lucide-react';

interface DecisionsPageProps {
  recommendations: Recommendation[];
  pressure: PressureResult;
  bottlenecks: BottleneckResult;
  whatIfResult: WhatIfResult;
  onSimulateAction: () => void;
  onNavigate: (page: string) => void;
}

export default function DecisionsPage({
  recommendations,
  pressure,
  bottlenecks,
  whatIfResult,
  onSimulateAction,
  onNavigate,
}: DecisionsPageProps) {
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const handleAcknowledge = (id: string) => {
    setAcknowledged(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-100 text-red-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'WATCH': return 'bg-yellow-500 text-black';
      case 'NORMAL': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 text-slate-900 p-6 h-full overflow-y-auto">
      <header>
        <h1 className="text-2xl font-bold">Decisions</h1>
        <p className="text-slate-500">What should the administrator act on?</p>
      </header>

      <div className="flex items-center space-x-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm border border-slate-300">
        <Info className="w-4 h-4 text-blue-600" />
        <span>Showing top {recommendations.length} prioritized actions. Low-priority alerts suppressed to prevent alert fatigue.</span>
      </div>

      <div className="space-y-6">
        {recommendations.length === 0 ? (
          <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center space-x-4">
            <CheckCircle className="w-8 h-8 text-emerald-700" />
            <div>
              <h3 className="text-lg font-semibold text-emerald-700">No urgent actions required</h3>
              <p className="text-emerald-700">Operations are within normal parameters.</p>
            </div>
          </div>
        ) : (
          recommendations.map(rec => {
            const isAck = acknowledged.has(rec.id);
            return (
              <div 
                key={rec.id}
                className={`bg-white border ${isAck ? 'border-slate-200 opacity-60' : 'border-slate-300 shadow-lg'} rounded-xl overflow-hidden transition-all`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${getUrgencyColor(rec.urgency)}`}>
                        {rec.urgency}
                      </span>
                      <span className="text-sm font-semibold text-slate-500">Priority: {rec.priority}</span>
                    </div>
                    {isAck && <span className="text-xs text-slate-500 border border-slate-300 px-2 py-1 rounded">Acknowledged</span>}
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-2">{rec.what}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 text-sm">
                    <div>
                      <div className="text-slate-500 mb-1">WHERE</div>
                      <div className="font-medium text-slate-800">{rec.where}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 mb-1">WHEN</div>
                      <div className="font-medium text-slate-800">{rec.when}</div>
                    </div>
                  </div>

                  <div className="mb-6 p-4 bg-slate-100 rounded-lg border border-slate-300/50">
                    <div className="text-slate-500 text-sm mb-2">ACTION</div>
                    <div className="font-bold text-lg text-blue-600">{rec.action}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="text-slate-500 text-sm mb-2">WHY</div>
                      <ul className="list-disc pl-5 space-y-1 text-slate-700 text-sm">
                        {rec.rationale.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div className="text-slate-500 text-sm mb-2">EXPECTED IMPACT</div>
                      <p className="text-slate-700 text-sm leading-relaxed">{rec.impact}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
                    <button 
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => {
                        onSimulateAction();
                        onNavigate('what-if');
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm font-medium flex items-center"
                    >
                      <Play className="w-4 h-4 mr-1.5" />
                      Simulate 
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                    <div className="flex-1"></div>
                    <button 
                      onClick={() => handleAcknowledge(rec.id)}
                      disabled={isAck}
                      className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                        isAck ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isAck ? 'Acknowledged' : 'Acknowledge'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-8 p-4 bg-white border-l-4 border-blue-500 rounded text-slate-500 text-sm text-center">
        Decision Support Disclaimer: This system provides operational decision support. It does not diagnose patients, prescribe treatment, or replace clinicians.
      </div>
    </div>
  );
}
