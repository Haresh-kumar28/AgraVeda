import React from 'react';
import { EDRecord } from '../../data/syntheticData';
import { BottleneckResult } from '../../engines/bottleneckEngine';
import { ForecastResult } from '../../engines/forecastEngine';
import { GitBranch, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PatientFlowPageProps {
  currentRecord: EDRecord;
  bottlenecks: BottleneckResult;
  forecast: ForecastResult;
}

export const PatientFlowPage: React.FC<PatientFlowPageProps> = ({
  currentRecord,
  bottlenecks,
  forecast: _forecast,
}) => {
  const primaryBneck = bottlenecks.primary;

  const stages = [
    {
      id: 'arrival',
      num: '01',
      name: 'Arrival & Registration',
      metric: `${currentRecord.arrivals} pts/hr`,
      resource: null,
      description: 'Initial intake demand from walk-in, triage, and EMS ambulance arrivals.',
      capacity: 'Inflow rate',
    },
    {
      id: 'triage',
      num: '02',
      name: 'Triage & Acuity Classification',
      metric: '100% evaluated',
      resource: null,
      description: 'Emergency Severity Index (ESI) assignment: 20% High, 45% Med, 35% Low.',
      capacity: 'Rapid intake',
    },
    {
      id: 'waiting',
      num: '03',
      name: 'Waiting Queue Buffer',
      metric: `${currentRecord.waitingPatients} waiting`,
      resource: 'space',
      description: 'Unassigned patients awaiting exam room or doctor evaluation.',
      capacity: `Avg wait: ${currentRecord.averageWaitTime}m`,
      isWarning: currentRecord.waitingPatients > 12,
    },
    {
      id: 'doctor',
      num: '04',
      name: 'Physician Initial Assessment',
      metric: `${currentRecord.doctorsAvailable} physicians`,
      resource: 'doctors',
      description: 'First clinical contact, medical history, initial orders, and diagnostic booking.',
      capacity: `Ratio 1:6 (Max ~${currentRecord.doctorsAvailable * 6} pts)`,
    },
    {
      id: 'diagnostics',
      num: '05',
      name: 'Diagnostics & Laboratory',
      metric: `${currentRecord.diagnosticQueue} in queue`,
      resource: 'diagnostics',
      description: 'CT, X-ray, point-of-care lab tests, and turnaround holds.',
      capacity: 'Nominal 10 concurrent slots',
    },
    {
      id: 'treatment',
      num: '06',
      name: 'Active Treatment Beds',
      metric: `${currentRecord.currentOccupancy} / ${currentRecord.totalBeds} beds`,
      resource: 'beds',
      description: 'Dedicated treatment beds occupied by monitored acute patients.',
      capacity: `${currentRecord.availableBeds} beds available`,
      isWarning: currentRecord.availableBeds < 5,
    },
    {
      id: 'disposition',
      num: '07',
      name: 'Disposition & Handover',
      metric: `${currentRecord.departures} pts/hr`,
      resource: 'nurses',
      description: 'Discharge processing, inpatient hospital admission boarding, or transfer.',
      capacity: 'Outflow throughput',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#1B74E4]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#222222]">
              Seven-Stage Patient Flow
            </h1>
          </div>
          <p className="text-xs text-[#727272] mt-1">
            End-to-end emergency flow stages from arrival to final disposition, highlighting active bottlenecks.
          </p>
        </div>

        <div className="text-xs text-[#727272] bg-[#F8F9FA] border border-[#EAEAEA] px-3 py-1.5 rounded">
          Current Constraint: <strong className="text-[#B42318]">{primaryBneck.label}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 7 Stages List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {stages.map((st, idx) => {
            const isBottleneck = primaryBneck.resource === st.resource;
            return (
              <React.Fragment key={st.id}>
                <div
                  className={`p-4 rounded-md border transition-all ${
                    isBottleneck
                      ? 'bg-[#FEF3F2] border-[#FECDCA] shadow-sm'
                      : st.isWarning
                      ? 'bg-[#FFFAEB] border-[#FEDF89]'
                      : 'bg-white border-[#EAEAEA]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-[#727272]">
                        {st.num}
                      </span>
                      <h2 className="text-sm font-bold text-[#222222]">
                        {st.name}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      {isBottleneck && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#B42318] text-white">
                          Primary Bottleneck
                        </span>
                      )}
                      <span className="text-xs font-mono font-bold bg-[#F8F9FA] border border-[#EAEAEA] px-2 py-0.5 rounded text-[#222222]">
                        {st.metric}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#727272] leading-relaxed">
                    {st.description}
                  </p>

                  <div className="mt-2 pt-2 border-t border-[#EAEAEA]/80 flex justify-between text-[11px] text-[#727272]">
                    <span>Capacity / Buffer:</span>
                    <strong className="text-[#222222]">{st.capacity}</strong>
                  </div>
                </div>

                {idx < stages.length - 1 && (
                  <div className="flex justify-center py-0.5 text-[#B6B6B6]">
                    <div className="w-0.5 h-3 bg-[#EAEAEA]"></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Column: Flow Analytics & Constriction Impact (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 bg-white border border-[#EAEAEA] rounded-md space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#B54708]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#222222]">
                Active Constriction Analysis
              </h2>
            </div>

            <div className="p-4 bg-[#F8F9FA] border border-[#EAEAEA] rounded space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#727272]">Identified Bottleneck:</span>
                <span className="text-xs font-bold text-[#B42318] uppercase">
                  {primaryBneck.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white rounded border border-[#EAEAEA]">
                  <div className="text-[10px] text-[#727272] uppercase font-bold">Current Load</div>
                  <div className="text-base font-bold text-[#222222] mt-0.5">
                    {primaryBneck.currentUtilization.toFixed(0)}%
                  </div>
                </div>
                <div className="p-2 bg-white rounded border border-[#EAEAEA]">
                  <div className="text-[10px] text-[#727272] uppercase font-bold">Projected (+2h)</div>
                  <div className="text-base font-bold text-[#B42318] mt-0.5">
                    {primaryBneck.projectedUtilization.toFixed(0)}%
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#727272] leading-relaxed pt-1">
                {primaryBneck.impactDetail}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-[#222222] uppercase tracking-wider">
                Upstream & Downstream Cascading Effects
              </h3>
              <p className="text-xs text-[#727272] leading-relaxed">
                When <strong>{primaryBneck.label}</strong> exceeds capacity thresholds, upstream waiting queues experience nonlinear geometric queuing delays. This inflates door-to-provider wait time proxies and increases the rate of patients leaving without being seen.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#EFF8FF] border border-[#B2DDFF] rounded-md text-xs text-[#175CD3] space-y-2">
            <div className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Operational Modeling Caveat</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#1558B0]">
              Patient flow estimates reflect aggregate simulated hourly rates rather than RFID-tracked real-time patient locations. For live production tracking, interface with hospital RTLS and EHR ADT event streams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientFlowPage;
