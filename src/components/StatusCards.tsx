import { Bed, Users, Clock, Activity, Stethoscope } from 'lucide-react';
import { EDRecord } from '../data/syntheticData';
import { PressureResult } from '../engines/pressureEngine';

interface StatusCardsProps {
  currentRecord: EDRecord;
  pressure: PressureResult;
}

export default function StatusCards({ currentRecord, pressure: _pressure }: StatusCardsProps) {
  const occupancyPct = Math.round((currentRecord.currentOccupancy / currentRecord.totalBeds) * 100);
  const staffUtilPct = Math.round(
    (currentRecord.currentOccupancy / (currentRecord.doctorsAvailable * 6 + currentRecord.nursesAvailable * 4)) * 200
  );

  const cards = [
    {
      label: 'Occupancy',
      value: `${occupancyPct}%`,
      sub: `${currentRecord.currentOccupancy} / ${currentRecord.totalBeds} beds`,
      icon: Activity,
      color: occupancyPct > 85 ? 'text-red-700' : occupancyPct > 70 ? 'text-orange-700' : 'text-emerald-700',
      bgColor: occupancyPct > 85 ? 'bg-red-500/10' : occupancyPct > 70 ? 'bg-orange-500/10' : 'bg-emerald-500/10',
    },
    {
      label: 'Waiting Patients',
      value: `${currentRecord.waitingPatients}`,
      sub: 'In queue',
      icon: Users,
      color: currentRecord.waitingPatients > 15 ? 'text-red-700' : currentRecord.waitingPatients > 8 ? 'text-orange-700' : 'text-emerald-700',
      bgColor: currentRecord.waitingPatients > 15 ? 'bg-red-500/10' : currentRecord.waitingPatients > 8 ? 'bg-orange-500/10' : 'bg-emerald-500/10',
    },
    {
      label: 'Beds Available',
      value: `${currentRecord.availableBeds}`,
      sub: `of ${currentRecord.totalBeds} total`,
      icon: Bed,
      color: currentRecord.availableBeds < 5 ? 'text-red-700' : currentRecord.availableBeds < 10 ? 'text-orange-700' : 'text-emerald-700',
      bgColor: currentRecord.availableBeds < 5 ? 'bg-red-500/10' : currentRecord.availableBeds < 10 ? 'bg-orange-500/10' : 'bg-emerald-500/10',
    },
    {
      label: 'Staff Utilization',
      value: `${Math.min(staffUtilPct, 100)}%`,
      sub: `${currentRecord.doctorsAvailable}D / ${currentRecord.nursesAvailable}N`,
      icon: Stethoscope,
      color: staffUtilPct > 85 ? 'text-red-700' : staffUtilPct > 70 ? 'text-orange-700' : 'text-emerald-700',
      bgColor: staffUtilPct > 85 ? 'bg-red-500/10' : staffUtilPct > 70 ? 'bg-orange-500/10' : 'bg-emerald-500/10',
    },
    {
      label: 'Avg Wait Time',
      value: `${currentRecord.averageWaitTime}`,
      sub: 'minutes',
      icon: Clock,
      color: currentRecord.averageWaitTime > 45 ? 'text-red-700' : currentRecord.averageWaitTime > 25 ? 'text-orange-700' : 'text-emerald-700',
      bgColor: currentRecord.averageWaitTime > 45 ? 'bg-red-500/10' : currentRecord.averageWaitTime > 25 ? 'bg-orange-500/10' : 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{card.label}</span>
            <div className={`p-1.5 rounded ${card.bgColor}`}>
              <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
            </div>
          </div>
          <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
          <div className="text-xs text-slate-500 mt-0.5">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}
