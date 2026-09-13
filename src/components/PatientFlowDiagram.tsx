import { ArrowDown } from 'lucide-react';
import { BottleneckResult } from '../engines/bottleneckEngine';
import { EDRecord } from '../data/syntheticData';

interface PatientFlowDiagramProps {
  bottlenecks: BottleneckResult;
  currentRecord: EDRecord;
}

const stages = [
  { key: 'arrival', label: 'Arrival', resource: null },
  { key: 'triage', label: 'Triage', resource: null },
  { key: 'waiting', label: 'Waiting', resource: null },
  { key: 'doctor', label: 'Doctor Assessment', resource: 'doctors' as const },
  { key: 'diagnostics', label: 'Diagnostics', resource: 'diagnostics' as const },
  { key: 'treatment', label: 'Treatment', resource: 'beds' as const },
  { key: 'disposition', label: 'Disposition', resource: null },
];

export default function PatientFlowDiagram({ bottlenecks, currentRecord }: PatientFlowDiagramProps) {
  const primaryResource = bottlenecks.primary.resource;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <ArrowDown className="w-4 h-4 text-blue-600" />
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Patient Flow</h3>
      </div>

      <div className="space-y-1">
        {stages.map((stage, idx) => {
          const isBottleneck = stage.resource === primaryResource;
          const count = stage.key === 'waiting' ? currentRecord.waitingPatients :
                       stage.key === 'arrival' ? currentRecord.arrivals :
                       stage.key === 'treatment' ? (currentRecord.totalBeds - currentRecord.availableBeds) :
                       stage.key === 'diagnostics' ? currentRecord.diagnosticQueue :
                       null;

          return (
            <div key={stage.key}>
              <div className={`flex items-center justify-between px-3 py-2 rounded ${
                isBottleneck
                  ? 'bg-red-500/15 border border-red-200'
                  : 'bg-slate-100 border border-transparent'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isBottleneck ? 'bg-red-400 animate-pulse' : 'bg-slate-600'
                  }`} />
                  <span className={`text-xs font-medium ${isBottleneck ? 'text-red-700' : 'text-slate-700'}`}>
                    {stage.label}
                  </span>
                  {isBottleneck && (
                    <span className="text-[9px] font-bold text-red-700 uppercase">Bottleneck</span>
                  )}
                </div>
                {count !== null && (
                  <span className={`text-xs font-bold ${isBottleneck ? 'text-red-700' : 'text-slate-500'}`}>
                    {count}
                  </span>
                )}
              </div>
              {idx < stages.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <div className={`w-px h-2 ${isBottleneck ? 'bg-red-500/50' : 'bg-slate-700'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
