import {
  LayoutDashboard, TrendingUp, GitBranch, Server, Zap, Sliders,
  FileText, Database, ChevronLeft, ChevronRight, Activity, Menu,
} from 'lucide-react';
import { PageId } from '../types';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  pressureLevel: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const groups = [
  { label: 'Overview', items: [{ id:'command-center' as PageId, label:'Command Center', icon:LayoutDashboard }] },
  { label: 'Operations', items: [
    { id:'forecast-inputs' as PageId, label:'Forecast & Inputs', icon:TrendingUp },
    { id:'patient-flow' as PageId, label:'Patient Flow', icon:GitBranch },
    { id:'resources' as PageId, label:'Resources', icon:Server },
  ]},
  { label: 'Planning', items: [
    { id:'scenarios' as PageId, label:'Scenarios', icon:Zap },
    { id:'what-if' as PageId, label:'What-If Simulator', icon:Sliders },
  ]},
  { label: 'Governance', items: [
    { id:'decisions' as PageId, label:'Alerts & Decisions', icon:FileText },
    { id:'data-quality' as PageId, label:'Data Quality', icon:Database },
  ]},
];

const pressureTone: Record<string,string> = { NORMAL:'bg-emerald-500', WATCH:'bg-amber-500', HIGH:'bg-orange-500', CRITICAL:'bg-red-500' };

export default function Sidebar({ currentPage, onNavigate, pressureLevel, collapsed, onToggleCollapse }: SidebarProps) {
  const tone = pressureTone[pressureLevel] || 'bg-blue-500';
  return (
    <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-200 ${collapsed ? 'w-[72px]' : 'w-[244px]'}`}>
      <div className={`h-16 px-4 border-b border-slate-200 flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white grid place-items-center shadow-sm shrink-0"><Activity className="w-5 h-5" /></div>
        {!collapsed && <div className="min-w-0"><div className="text-[17px] font-extrabold tracking-tight text-slate-900 leading-none">EDPulse</div><div className="text-[9px] uppercase tracking-[.13em] text-slate-400 mt-1 whitespace-nowrap">Predictive ED Ops</div></div>}
      </div>

      <div className={`mx-3 mt-4 mb-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
        <span className={`w-2.5 h-2.5 rounded-full ${tone} shrink-0`} />
        {!collapsed && <div className="min-w-0"><div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">System Operational</div><div className="text-[10px] text-slate-400 mt-0.5">Pressure: {pressureLevel}</div></div>}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {groups.map(group => (
          <div key={group.label} className="mb-4">
            {!collapsed && <div className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-slate-400">{group.label}</div>}
            {group.items.map(item => {
              const active = currentPage === item.id;
              const Icon = item.icon;
              return <button key={item.id} onClick={() => onNavigate(item.id)} title={collapsed ? item.label : undefined}
                className={`w-full h-10 flex items-center gap-3 px-3 mb-1 rounded-xl text-[12px] font-semibold transition-all ${active ? 'bg-blue-50 text-blue-700 shadow-[inset_3px_0_0_#2563eb]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${collapsed ? 'justify-center' : ''}`}>
                <Icon className="w-[17px] h-[17px] shrink-0" />{!collapsed && <span className="truncate">{item.label}</span>}
              </button>;
            })}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200">
        {!collapsed && <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 mb-2"><div className="text-[11px] font-semibold text-slate-700">Demo Environment</div><div className="text-[10px] text-slate-400 mt-1">Simulated data · v1.0</div></div>}
        <button onClick={onToggleCollapse} className="w-full h-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-2 text-[11px] font-semibold">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
