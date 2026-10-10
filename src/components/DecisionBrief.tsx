import React from 'react';
import { AlertTriangle, Info, Play, CheckCircle, Activity, Zap } from 'lucide-react';
import { Recommendation } from '../engines/recommendationEngine';
import { PressureResult } from '../engines/pressureEngine';
import { BottleneckResult } from '../engines/bottleneckEngine';
import { WhatIfResult } from '../engines/whatIfSimulator';

interface DecisionBriefProps {
  recommendations: Recommendation[];
  pressure: PressureResult;
  bottlenecks: BottleneckResult;
  whatIfResult: WhatIfResult;
  onSimulateAction: () => void;
}

export function DecisionBrief({ recommendations, pressure: _pressure, bottlenecks: _bottlenecks, whatIfResult, onSimulateAction }: DecisionBriefProps) {
  if (recommendations.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-3">
        <CheckCircle className="w-6 h-6 text-emerald-700" />
        <div>
          <h3 className="text-sm font-semibold text-slate-900">No Critical Actions Required</h3>
          <p className="text-xs text-slate-500">Current flow and capacity are within manageable thresholds.</p>
        </div>
      </div>
    );
  }

  // Take up to 3 recommendations
  const displayRecs = recommendations.slice(0, 3);

  const getUrgencyBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <span className="px-2 py-1 rounded bg-red-500/20 text-red-700 border border-red-200 text-[10px] font-bold tracking-wider">CRITICAL</span>;
      case 'medium':
        return <span className="px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold tracking-wider">HIGH</span>;
      default:
        return <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-600 border border-blue-200 text-[10px] font-bold tracking-wider">WATCH</span>;
    }
  };

  return (
    <div className="space-y-4">
      {displayRecs.map((rec, idx) => {
        const isPrimary = idx === 0;
        
        return (
          <div key={rec.id} className={`bg-white border rounded-xl shadow-sm overflow-hidden ${isPrimary ? 'border-amber-300 shadow-amber-900/10' : 'border-slate-200'}`}>
            <div className={`p-4 ${isPrimary ? 'bg-amber-50' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isPrimary ? <AlertTriangle className="w-5 h-5 text-amber-700" /> : <Info className="w-5 h-5 text-blue-600" />}
                  <h3 className="text-base font-semibold text-slate-900">{rec.title}</h3>
                </div>
                {getUrgencyBadge(rec.impact)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">WHAT & WHEN</h4>
                    <p className="text-sm text-slate-800">{rec.description}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">WHY</h4>
                    <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                      {rec.rationale.map((rat, i) => (
                        <li key={i}>{rat}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">WHERE</h4>
                    <p className="text-sm text-slate-800">{rec.type === 'staffing' ? 'Nursing / Staffing' : rec.type === 'capacity' ? 'Bed Capacity' : 'Patient Flow'}</p>
                  </div>
                </div>

                <div className="space-y-3 border-l border-slate-200 pl-4">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-700"/> ACTION
                    </h4>
                    <p className="text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-2 rounded">
                      {rec.title}
                    </p>
                  </div>
                  
                  {isPrimary && (
                    <div className="mt-2">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Activity className="w-3 h-3 text-blue-600"/> SIMULATED IMPACT
                      </h4>
                      <div className="text-xs bg-slate-100 p-2 rounded text-slate-700 mb-2">
                        {whatIfResult ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between">
                              <span>Peak Occupancy:</span>
                              <span className="text-emerald-700">{whatIfResult.baselinePeakOccupancy} → {whatIfResult.simulatedPeakOccupancy}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Max Wait Time:</span>
                              <span className="text-emerald-700">{whatIfResult.baselineMaxWait}m → {whatIfResult.simulatedMaxWait}m</span>
                            </div>
                          </div>
                        ) : (
                          <p>Click simulate to estimate impact.</p>
                        )}
                      </div>
                      
                      <button 
                        onClick={onSimulateAction}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        Simulate Action Impact
                      </button>
                      <p className="text-[9px] text-center text-slate-500 mt-2 uppercase tracking-wide">Simulation Estimate — Not A Clinical Guarantee</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
