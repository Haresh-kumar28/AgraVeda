import React from 'react';
import { BottleneckResult } from '../../engines/bottleneckEngine';
import { EDRecord } from '../../data/syntheticData';
import { ForecastResult } from '../../engines/forecastEngine';
import { Database, Bed, Users, Stethoscope, ActivitySquare } from 'lucide-react';

interface ResourcesPageProps {
  bottlenecks: BottleneckResult;
  currentRecord: EDRecord;
  forecast: ForecastResult;
}

const ResourcesPage: React.FC<ResourcesPageProps> = ({
  bottlenecks,
  currentRecord,
  forecast
}) => {
  const primaryResource = bottlenecks.primaryBottleneck?.resource;

  const resourceData = [
    {
      id: 'beds',
      name: 'Treatment Beds',
      icon: <Bed className="w-5 h-5" />,
      bneck: bottlenecks.resources.find(r => r.resource === 'beds'),
      capacity: currentRecord.totalBeds,
      current: currentRecord.currentOccupancy,
    },
    {
      id: 'nurses',
      name: 'Nursing Staff',
      icon: <Users className="w-5 h-5" />,
      bneck: bottlenecks.resources.find(r => r.resource === 'nurses'),
      capacity: currentRecord.nursesAvailable * 4, // simplistic proxy
      current: Math.round(currentRecord.currentOccupancy * 0.9),
    },
    {
      id: 'doctors',
      name: 'Physicians',
      icon: <Stethoscope className="w-5 h-5" />,
      bneck: bottlenecks.resources.find(r => r.resource === 'doctors'),
      capacity: currentRecord.doctorsAvailable * 6, // proxy
      current: currentRecord.waitingPatients + Math.round(currentRecord.currentOccupancy * 0.2),
    },
    {
      id: 'diagnostics',
      name: 'Diagnostics',
      icon: <ActivitySquare className="w-5 h-5" />,
      bneck: bottlenecks.resources.find(r => r.resource === 'diagnostics'),
      capacity: 100, // static 100%
      current: bottlenecks.resources.find(r => r.resource === 'diagnostics')?.currentUtilization || 0,
    }
  ];

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <Database className="w-6 h-6 mr-2 text-orange-700" />
          Resources
        </h1>
        <p className="text-slate-500 text-sm">What capacity will become insufficient?</p>
      </header>

      {/* 2x2 Grid of Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resourceData.map((res) => {
          const isPrimary = primaryResource === res.id;
          const bneck = res.bneck;
          if (!bneck) return null;
          
          const statusColor = bneck.status === 'critical' ? 'text-red-700' : bneck.status === 'warning' ? 'text-orange-700' : 'text-emerald-700';
          const bgBarColor = bneck.status === 'critical' ? 'bg-red-500' : bneck.status === 'warning' ? 'bg-orange-500' : 'bg-emerald-500';
          const projBarColor = bneck.projectedUtilization > 100 ? 'bg-red-700' : bneck.projectedUtilization > 85 ? 'bg-orange-700' : 'bg-emerald-700';

          return (
            <div key={res.id} className={`bg-white rounded-xl p-5 border-2 transition-all ${isPrimary ? 'border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-slate-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg bg-slate-100 mr-3 ${statusColor}`}>
                    {res.icon}
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">{res.name}</h3>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded uppercase bg-slate-100 ${statusColor}`}>
                  {bneck.status}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Current Utilization</span>
                    <span className="text-slate-800 font-mono">{bneck.currentUtilization}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-2 rounded-full ${bgBarColor}`} style={{ width: `${Math.min(100, bneck.currentUtilization)}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Projected (2h)</span>
                    <span className="text-slate-800 font-mono">{bneck.projectedUtilization}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex relative">
                    <div className={`h-2 absolute left-0 top-0 bg-slate-700`} style={{ width: '100%' }}></div>
                    <div className={`h-2 absolute left-0 top-0 ${projBarColor}`} style={{ width: `${Math.min(100, bneck.projectedUtilization)}%` }}></div>
                    {bneck.projectedUtilization > 100 && (
                       <div className="absolute top-0 right-0 h-full w-full bg-red-500/20 striped-bg"></div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-200">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Available</div>
                    <div className="text-sm font-semibold text-slate-800">{res.capacity}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Required</div>
                    <div className="text-sm font-semibold text-slate-800">{Math.round(res.capacity * (bneck.projectedUtilization/100))}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Gap</div>
                    <div className={`text-sm font-semibold ${bneck.projectedUtilization > 100 ? 'text-red-700' : 'text-emerald-700'}`}>
                      {res.capacity - Math.round(res.capacity * (bneck.projectedUtilization/100))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-6">
        <h3 className="text-md font-medium text-slate-900 p-4 border-b border-slate-200">Resource Gap Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-100 uppercase">
              <tr>
                <th className="px-4 py-3">Resource</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Current %</th>
                <th className="px-4 py-3">Projected %</th>
                <th className="px-4 py-3">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {bottlenecks.resources.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800 capitalize">{r.resource}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${r.status === 'critical' ? 'bg-red-50 text-red-700' : r.status === 'warning' ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{r.currentUtilization}%</td>
                  <td className={`px-4 py-3 font-medium ${r.projectedUtilization > 95 ? 'text-red-700' : 'text-slate-700'}`}>{r.projectedUtilization}%</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{r.impactDetail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
