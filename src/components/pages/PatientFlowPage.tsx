import React from 'react';
import { EDRecord } from '../../data/syntheticData';
import { BottleneckResult } from '../../engines/bottleneckEngine';
import { ForecastResult } from '../../engines/forecastEngine';
import { ArrowDown, GitMerge, AlertTriangle } from 'lucide-react';

interface PatientFlowPageProps {
  currentRecord: EDRecord;
  bottlenecks: BottleneckResult;
  forecast: ForecastResult;
}

const PatientFlowPage: React.FC<PatientFlowPageProps> = ({
  currentRecord,
  bottlenecks,
  forecast
}) => {
  const primaryBneck = bottlenecks.primaryBottleneck;
  
  const stages = [
    { id: 'arrival', name: 'ARRIVAL', metric: `${currentRecord.arrivals}/hr`, resource: null },
    { id: 'triage', name: 'TRIAGE', metric: '100%', resource: null },
    { id: 'waiting', name: 'WAITING', metric: `${currentRecord.waitingPatients} pts`, resource: 'space' },
    { id: 'doctor', name: 'DOCTOR ASSESSMENT', metric: `${currentRecord.doctorsAvailable} docs`, resource: 'doctors' },
    { id: 'diagnostics', name: 'DIAGNOSTICS', metric: `${currentRecord.diagnosticQueue} pts queue`, resource: 'diagnostics' },
    { id: 'treatment', name: 'TREATMENT (BEDS)', metric: `${currentRecord.currentOccupancy}/${currentRecord.totalBeds}`, resource: 'beds' },
    { id: 'disposition', name: 'DISPOSITION', metric: `${currentRecord.departures}/hr`, resource: 'nurses' }
  ];

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <GitMerge className="w-6 h-6 mr-2 text-emerald-700" />
          Patient Flow
        </h1>
        <p className="text-slate-500 text-sm">Where is the flow becoming constrained?</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Patient Flow Diagram */}
        <div className="lg:col-span-2 flex flex-col items-center">
          {stages.map((stage, idx) => {
            const isBottleneck = primaryBneck?.resource === stage.resource;
            return (
              <React.Fragment key={stage.id}>
                <div 
                  className={`w-full max-w-lg p-4 rounded-xl border-2 flex justify-between items-center transition-all ${
                    isBottleneck 
                      ? 'bg-red-50 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                      : 'bg-white border-slate-300'
                  }`}
                >
                  <div className="flex items-center">
                    {isBottleneck && (
                      <span className="relative flex h-3 w-3 mr-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                    <span className={`font-bold tracking-wide ${isBottleneck ? 'text-red-700' : 'text-slate-700'}`}>
                      {stage.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      {stage.metric}
                    </span>
                    {isBottleneck && (
                      <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded">
                        BOTTLENECK
                      </span>
                    )}
                  </div>
                </div>
                
                {idx < stages.length - 1 && (
                  <div className="py-2 text-slate-500">
                    <ArrowDown className="w-6 h-6" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Side: Flow Analysis */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-lg font-medium text-slate-900 flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-700" />
              Flow Analysis
            </h3>
            
            {primaryBneck ? (
              <>
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <div className="text-sm text-slate-500 mb-1 uppercase tracking-wider font-semibold">Primary Constriction</div>
                  <div className="text-xl font-bold text-red-700 capitalize mb-2">{primaryBneck.resource}</div>
                  <p className="text-sm text-slate-700 mb-4">{primaryBneck.impactDetail}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Current Utilization:</span>
                      <span className="text-slate-900 font-mono">{primaryBneck.currentUtilization}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Projected (2h):</span>
                      <span className="text-red-700 font-mono">{primaryBneck.projectedUtilization}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Cascading Effects</h4>
                  <p className="text-sm text-slate-500">
                    When {primaryBneck.resource} hit {primaryBneck.projectedUtilization}% capacity, 
                    upstream stages (WAITING) experience geometric queuing. This directly impacts the 
                    Wait Time metric and limits the ability to process new arrivals safely.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-slate-500 text-sm">
                Flow is optimal. No significant bottlenecks detected at current volumes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientFlowPage;
