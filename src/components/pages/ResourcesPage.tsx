import React from 'react';
import { BottleneckResult } from '../../engines/bottleneckEngine';
import { EDRecord } from '../../data/syntheticData';
import { ForecastResult } from '../../engines/forecastEngine';
import { Server, Bed, Users, Stethoscope, Activity } from 'lucide-react';

interface ResourcesPageProps {
  bottlenecks: BottleneckResult;
  currentRecord: EDRecord;
  forecast: ForecastResult;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({
  bottlenecks,
  currentRecord,
  forecast: _forecast,
}) => {
  const primaryResource = bottlenecks.primary.resource;

  const resourceCards = [
    {
      id: 'beds',
      name: 'Treatment Beds',
      icon: Bed,
      bneck: bottlenecks.all.find((r) => r.resource === 'beds'),
      available: currentRecord.totalBeds,
      occupied: currentRecord.currentOccupancy,
      unit: 'beds',
      description: 'Acute and subacute monitored treatment spaces.',
    },
    {
      id: 'nurses',
      name: 'Nursing Staff',
      icon: Users,
      bneck: bottlenecks.all.find((r) => r.resource === 'nurses'),
      available: currentRecord.nursesAvailable,
      occupied: Math.ceil(currentRecord.currentOccupancy / 4),
      unit: 'nurses (1:4 ratio)',
      description: 'Active floor and triage nursing personnel.',
    },
    {
      id: 'doctors',
      name: 'Attending Physicians',
      icon: Stethoscope,
      bneck: bottlenecks.all.find((r) => r.resource === 'doctors'),
      available: currentRecord.doctorsAvailable,
      occupied: Math.ceil(currentRecord.currentOccupancy / 6),
      unit: 'doctors (1:6 ratio)',
      description: 'Board-certified emergency medicine physicians.',
    },
    {
      id: 'diagnostics',
      name: 'Diagnostic Slots',
      icon: Activity,
      bneck: bottlenecks.all.find((r) => r.resource === 'diagnostics'),
      available: 10,
      occupied: Math.min(10, currentRecord.diagnosticQueue),
      unit: 'concurrent slots',
      description: 'Rapid turnaround imaging, ultrasound, and stat labs.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#1B74E4]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#222222]">
              Resource Capacity & Gap Analysis
            </h1>
          </div>
          <p className="text-xs text-[#727272] mt-1">
            Current operational supply versus projected demand across beds, nursing staff, doctors, and diagnostics.
          </p>
        </div>

        <div className="text-xs text-[#727272] bg-[#F8F9FA] border border-[#EAEAEA] px-3 py-1.5 rounded">
          Planning Horizon: <strong className="text-[#222222]">+2 Hours Peak</strong>
        </div>
      </div>

      {/* 2x2 Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resourceCards.map((res) => {
          const bneck = res.bneck;
          if (!bneck) return null;
          const isPrimary = primaryResource === res.id;
          const Icon = res.icon;

          const isCritical = bneck.status === 'critical';
          const isWarning = bneck.status === 'warning';

          return (
            <div
              key={res.id}
              className={`p-5 rounded-md border bg-white transition-all ${
                isPrimary
                  ? 'border-[#FECDCA] shadow-sm'
                  : 'border-[#EAEAEA]'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-[#EAF4FF] text-[#1B74E4] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#222222]">{res.name}</h3>
                    <p className="text-[11px] text-[#727272]">{res.description}</p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isCritical
                      ? 'bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]'
                      : isWarning
                      ? 'bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]'
                      : 'bg-[#ECFDF3] text-[#0E7A4E] border border-[#A6F4C5]'
                  }`}
                >
                  {bneck.status}
                </span>
              </div>

              {/* Utilization progress bar */}
              <div className="space-y-1.5 my-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[#727272]">Projected Utilization (+2h)</span>
                  <strong className={isCritical ? 'text-[#B42318]' : 'text-[#222222]'}>
                    {bneck.projectedUtilization.toFixed(0)}%
                  </strong>
                </div>
                <div className="w-full h-1.5 bg-[#F8F9FA] rounded-full overflow-hidden border border-[#EAEAEA]">
                  <div
                    className={`h-full ${
                      isCritical ? 'bg-[#B42318]' : isWarning ? 'bg-[#B54708]' : 'bg-[#0E7A4E]'
                    }`}
                    style={{ width: `${Math.min(100, bneck.projectedUtilization)}%` }}
                  />
                </div>
              </div>

              {/* Three-metric breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#EAEAEA] text-center">
                <div>
                  <div className="text-[10px] font-bold uppercase text-[#727272]">Available</div>
                  <div className="text-sm font-bold text-[#222222] mt-0.5">{bneck.available}</div>
                  <div className="text-[10px] text-[#727272]">{res.unit}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-[#727272]">Required</div>
                  <div className="text-sm font-bold text-[#222222] mt-0.5">{bneck.required}</div>
                  <div className="text-[10px] text-[#727272]">at projected peak</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-[#727272]">Net Gap</div>
                  <div
                    className={`text-sm font-bold mt-0.5 ${
                      bneck.gap < 0 ? 'text-[#B42318]' : 'text-[#0E7A4E]'
                    }`}
                  >
                    {bneck.gap > 0 ? `+${bneck.gap}` : bneck.gap}
                  </div>
                  <div className="text-[10px] text-[#727272]">
                    {bneck.gap < 0 ? 'Deficit' : 'Surplus'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resource Gap Summary Table */}
      <div className="bg-white border border-[#EAEAEA] rounded-md overflow-hidden">
        <div className="p-4 border-b border-[#EAEAEA] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#222222]">
            Detailed Resource Allocation & Status
          </h2>
          <span className="text-xs text-[#727272]">Derived from current analytical baseline</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#222222]">
            <thead className="bg-[#F8F9FA] text-[10px] font-bold uppercase text-[#727272] border-b border-[#EAEAEA]">
              <tr>
                <th className="px-4 py-3">Resource Area</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Current Load</th>
                <th className="px-4 py-3 text-right">Projected (+2h)</th>
                <th className="px-4 py-3 text-right">Available</th>
                <th className="px-4 py-3 text-right">Required</th>
                <th className="px-4 py-3 text-right">Net Gap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {bottlenecks.all.map((r) => (
                <tr key={r.resource} className="hover:bg-[#F8F9FA]">
                  <td className="px-4 py-3 font-semibold">
                    {r.label}
                    {r.isPrimary && (
                      <span className="ml-2 text-[9px] font-bold uppercase text-[#B42318] bg-[#FEF3F2] px-1.5 py-0.2 rounded border border-[#FECDCA]">
                        Primary Constraint
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        r.status === 'critical'
                          ? 'bg-[#FEF3F2] text-[#B42318]'
                          : r.status === 'warning'
                          ? 'bg-[#FFFAEB] text-[#B54708]'
                          : 'bg-[#ECFDF3] text-[#0E7A4E]'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{r.currentUtilization.toFixed(0)}%</td>
                  <td className="px-4 py-3 text-right font-mono font-bold">
                    {r.projectedUtilization.toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{r.available}</td>
                  <td className="px-4 py-3 text-right font-mono">{r.required}</td>
                  <td
                    className={`px-4 py-3 text-right font-mono font-bold ${
                      r.gap < 0 ? 'text-[#B42318]' : 'text-[#0E7A4E]'
                    }`}
                  >
                    {r.gap > 0 ? `+${r.gap}` : r.gap}
                  </td>
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
