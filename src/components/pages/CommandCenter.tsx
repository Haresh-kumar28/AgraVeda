import React from 'react';
import { EDRecord } from '../../data/syntheticData';
import { ForecastResult } from '../../engines/forecastEngine';
import { PressureResult } from '../../engines/pressureEngine';
import { BottleneckResult } from '../../engines/bottleneckEngine';
import { Recommendation } from '../../engines/recommendationEngine';
import ForecastChart from '../ForecastChart';
import PressureIndicator from '../PressureIndicator';
import BottleneckPanel from '../BottleneckPanel';
import { AlertTriangle, ArrowRight, Bed, Clock3, Users, Activity, Stethoscope, Bell } from 'lucide-react';

interface CommandCenterProps { currentRecord: EDRecord; forecast: ForecastResult; pressure: PressureResult; bottlenecks: BottleneckResult; recommendations: Recommendation[]; recentData: EDRecord[]; scenario: string; onNavigate: (page: string) => void; }

const toneClasses: Record<string,string> = { blue:'bg-blue-50 text-blue-600', red:'bg-red-50 text-red-600', amber:'bg-amber-50 text-amber-600', orange:'bg-orange-50 text-orange-600', emerald:'bg-emerald-50 text-emerald-600' };
const alertToneClasses: Record<string,string> = { blue:'bg-blue-50 text-blue-600', red:'bg-red-50 text-red-600', amber:'bg-amber-50 text-amber-600', orange:'bg-orange-50 text-orange-600', emerald:'bg-emerald-50 text-emerald-600' };

const Stat = ({icon:Icon, label, value, detail, tone='blue'}:{icon:typeof Activity;label:string;value:string;detail:string;tone?:string}) => (
  <div className="dashboard-card p-4 min-w-0">
    <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500"><span className={`w-8 h-8 rounded-lg grid place-items-center ${toneClasses[tone] || toneClasses.blue}`}><Icon className="w-4 h-4"/></span><span className="truncate">{label}</span></div><span className="text-[10px] text-slate-400 whitespace-nowrap">vs last hour</span></div>
    <div className="mt-3 flex items-end justify-between gap-2"><div className="text-[26px] leading-none font-extrabold tracking-tight text-slate-900">{value}</div><div className="text-[10px] text-slate-500 truncate">{detail}</div></div>
  </div>
);

const toneForPressure = (level:string) => level === 'CRITICAL' ? 'red' : level === 'HIGH' ? 'orange' : level === 'WATCH' ? 'amber' : 'emerald';

const CommandCenter: React.FC<CommandCenterProps> = ({ currentRecord, forecast, pressure, bottlenecks, recommendations, recentData, scenario, onNavigate }) => {
  const occ = Math.round((currentRecord.currentOccupancy / Math.max(1,currentRecord.totalBeds))*100);
  const staff = Math.round((currentRecord.currentOccupancy / Math.max(1,currentRecord.nursesAvailable*4))*100);
  const tone = toneForPressure(pressure.level);
  const primary = bottlenecks.primary;
  const topRec = recommendations[0];

  return <div className="page-frame space-y-5">
    <div className="page-header">
      <div><div className="flex items-center gap-2"><h1>Emergency Department Command Center</h1><span className="px-2 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-700">LIVE DEMO</span></div><p>Current state, predicted demand, and the next operational constraint.</p></div>
      <div className="flex items-center gap-2"><span className="topbar-chip">Scenario: {scenario === 'accident_surge' ? 'Accident Surge' : scenario === 'weekend_peak' ? 'Weekend Peak' : 'Normal'}</span><span className="hidden sm:inline text-[11px] text-slate-400">Simulated data</span></div>
    </div>

    <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
      <Stat icon={Activity} label="Current Occupancy" value={`${occ}%`} detail={occ > 85 ? 'Elevated load' : 'Within range'} tone={occ > 90 ? 'red' : 'blue'} />
      <Stat icon={Users} label="Waiting Patients" value={`${currentRecord.waitingPatients}`} detail={currentRecord.waitingPatients > 12 ? 'Queue rising' : 'Stable'} tone={currentRecord.waitingPatients > 15 ? 'red' : 'amber'} />
      <Stat icon={Bed} label="Available Beds" value={`${currentRecord.availableBeds}`} detail={`of ${currentRecord.totalBeds}`} tone={currentRecord.availableBeds < 4 ? 'red' : 'emerald'} />
      <Stat icon={Stethoscope} label="Staff Load" value={`${staff}%`} detail={`${currentRecord.nursesAvailable} nurses`} tone={staff > 90 ? 'orange' : 'blue'} />
      <Stat icon={Clock3} label="Average Wait" value={`${currentRecord.averageWaitTime}m`} detail={currentRecord.averageWaitTime > 60 ? 'Needs attention' : 'Stable'} tone={currentRecord.averageWaitTime > 90 ? 'red' : 'amber'} />
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.75fr)_minmax(320px,.85fr)] gap-4">
      <section className="dashboard-card p-4 min-w-0">
        <div className="flex items-center justify-between mb-3 gap-3"><div><h2 className="text-[16px] font-bold text-slate-900">6-Hour Emergency Department Forecast</h2><p className="text-[10px] text-slate-400 mt-1">Recent arrivals compared with predicted demand</p></div><button onClick={()=>onNavigate('forecast-inputs')} className="px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 whitespace-nowrap">Adjust inputs</button></div>
        <ForecastChart forecast={forecast} recentData={recentData} scenario={scenario}/>
      </section>
      <div className="grid grid-cols-1 gap-4 content-start">
        <section className="dashboard-card p-4"><PressureIndicator pressure={pressure}/></section>
        <section className="dashboard-card p-4"><BottleneckPanel bottlenecks={bottlenecks}/></section>
      </div>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.9fr)] gap-4">
      <section className="dashboard-card p-4">
        <div className="flex items-center justify-between mb-3"><div><h2 className="text-[16px] font-bold text-slate-900">Recommended Operational Action</h2><p className="text-[10px] text-slate-400 mt-1">Decision support based on the current forecast</p></div><Bell className="w-5 h-5 text-blue-600"/></div>
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4"><div className="flex flex-wrap items-center gap-2 mb-2"><span className="px-2 py-1 rounded-md bg-white border border-blue-100 text-[9px] font-bold uppercase tracking-wider text-blue-700">{topRec?.urgency || pressure.level}</span><span className="text-[10px] text-slate-400">Primary constraint: {primary.label}</span></div><h3 className="text-[17px] font-bold text-slate-900 leading-snug">{topRec?.title || `Prepare capacity for ${primary.label}`}</h3><p className="text-[12px] text-slate-600 mt-1 leading-relaxed">{topRec?.action || 'Review the projected operational constraint before the forecast peak.'}</p><div className="flex flex-wrap gap-2 mt-3"><button onClick={()=>onNavigate('what-if')} className="px-3.5 py-2 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700">Open What-If →</button><button onClick={()=>onNavigate('decisions')} className="px-3.5 py-2 rounded-lg bg-white border border-blue-200 text-blue-700 text-[11px] font-bold hover:bg-blue-100">View decision brief</button></div></div>
      </section>

      <section className="dashboard-card p-4"><div className="flex items-center justify-between mb-3"><div><h2 className="text-[16px] font-bold text-slate-900">Top Priority Alerts</h2><p className="text-[10px] text-slate-400 mt-1">Only the signals requiring attention</p></div><button onClick={()=>onNavigate('decisions')} className="text-[10px] font-bold text-blue-600">View all</button></div>
        <div className="space-y-2">{[
          {level:pressure.level, title:`${primary.label} constraint`, text:pressure.timeToImpact !== 'N/A' ? `Potential impact ${pressure.timeToImpact}.` : 'Monitor projected capacity.', tone: tone},
          {level:'WATCH', title:'Arrival trend', text:'Recent demand is influencing the next forecast window.', tone:'amber'},
          {level:'INFO', title:'Data quality', text:'Simulated data is being used for this demo.', tone:'blue'},
        ].slice(0,3).map((a,i)=><div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5"><span className={`w-7 h-7 rounded-full ${alertToneClasses[a.tone] || alertToneClasses.blue} grid place-items-center shrink-0`}><AlertTriangle className="w-3.5 h-3.5"/></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className={`text-[9px] font-bold `}>{a.level}</span><span className="text-[11px] font-bold text-slate-800 truncate">{a.title}</span></div><p className="text-[10px] text-slate-500 truncate">{a.text}</p></div><ArrowRight className="w-3.5 h-3.5 text-slate-300"/></div>)}</div>
      </section>
    </div>

    <div className="text-[10px] text-slate-400 text-right">EDPulse is operational decision support using simulated/demo data · Not a clinical tool.</div>
  </div>;
};

export default CommandCenter;
