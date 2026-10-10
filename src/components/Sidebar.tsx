import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  GitBranch,
  Server,
  Zap,
  Sliders,
  FileText,
  Database,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { PageId } from '../types';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../auth/AuthContext';
import { ROLE_LABELS, UserRole } from '../auth/roles';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  pressureLevel: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSignOut: () => void;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: typeof LayoutDashboard;
  requiredCapability?: string;
}

export default function Sidebar({
  currentPage,
  onNavigate,
  pressureLevel,
  collapsed,
  onToggleCollapse,
  onSignOut,
}: SidebarProps) {
  const { user, switchDemoRole } = useAuth();

  const groups: { label: string; items: NavItem[] }[] = [
    {
      label: 'Operational Overview',
      items: [
        { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Operations & Flow',
      items: [
        { id: 'forecast-inputs', label: 'Forecast & Inputs', icon: TrendingUp },
        { id: 'patient-flow', label: 'Patient Flow (7 Stages)', icon: GitBranch },
        { id: 'resources', label: 'Staff & Capacity', icon: Server },
      ],
    },
    {
      label: 'Planning & Simulation',
      items: [
        { id: 'scenarios', label: 'Demand Scenarios', icon: Zap },
        { id: 'what-if', label: 'What-If Simulator', icon: Sliders },
      ],
    },
    {
      label: 'Decision & Governance',
      items: [
        { id: 'decisions', label: 'Decision Briefs', icon: FileText },
        { id: 'data-quality', label: 'Data Quality & Trust', icon: Database },
        ...(user?.role === 'hospital_admin'
          ? [{ id: 'administration' as PageId, label: 'Staff & Roles', icon: ShieldCheck }]
          : []),
      ],
    },
  ];

  const pressureStatusBadge =
    pressureLevel === 'CRITICAL'
      ? { text: 'text-[#B42318]', bg: 'bg-[#FEF3F2]', dot: 'bg-[#B42318]' }
      : pressureLevel === 'HIGH'
      ? { text: 'text-[#B54708]', bg: 'bg-[#FFFAEB]', dot: 'bg-[#B54708]' }
      : pressureLevel === 'WATCH'
      ? { text: 'text-[#B54708]', bg: 'bg-[#FFFAEB]', dot: 'bg-[#EAAA08]' }
      : { text: 'text-[#0E7A4E]', bg: 'bg-[#ECFDF3]', dot: 'bg-[#0E7A4E]' };

  return (
    <aside
      aria-label="Application sidebar"
      className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-[#EAEAEA] transition-all duration-200 ${
        collapsed ? 'w-[72px]' : 'w-[252px]'
      }`}
    >
      {/* Brand Header */}
      <div className={`h-16 px-4 border-b border-[#EAEAEA] flex items-center ${
        collapsed ? 'justify-center' : 'justify-between'
      }`}>
        <BrandLogo size="sm" showSubtitle={!collapsed} />
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            className="w-7 h-7 rounded border border-[#EAEAEA] bg-white hover:bg-[#F8F9FA] text-[#727272] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Operational Signal Pill */}
      <div className={`mx-3 mt-3 mb-2 rounded border border-[#EAEAEA] bg-[#F8F9FA] p-2 flex items-center ${
        collapsed ? 'justify-center' : 'gap-2.5'
      }`}>
        <span className={`w-2 h-2 rounded-full ${pressureStatusBadge.dot} shrink-0`} />
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#222222]">
              Operational Pressure
            </div>
            <div className={`text-[11px] font-semibold ${pressureStatusBadge.text}`}>
              {pressureLevel} Signal
            </div>
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-2 space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-2.5 mb-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-[#727272]">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = currentPage === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full h-9 flex items-center gap-2.5 px-2.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#EAF4FF] text-[#1B74E4] font-semibold border-l-2 border-[#1B74E4]'
                        : 'text-[#727272] hover:bg-[#F8F9FA] hover:text-[#222222]'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Session & Role Context */}
      <div className="p-3 border-t border-[#EAEAEA] bg-white space-y-2">
        {!collapsed && user && (
          <div className="p-2.5 rounded border border-[#EAEAEA] bg-[#F8F9FA] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#1B74E4] bg-[#EAF4FF] px-1.5 py-0.5 rounded-sm">
                Active Session
              </span>
              <span className="text-[10px] text-[#727272] font-mono">Demo</span>
            </div>
            <div className="text-xs font-bold text-[#222222] truncate">{user.name}</div>
            <div className="text-[10px] text-[#727272] truncate">{ROLE_LABELS[user.role]}</div>

            {/* Quick Role Switcher for reviewers */}
            <div className="pt-1 border-t border-[#EAEAEA]">
              <label htmlFor="role-select" className="block text-[9px] font-bold uppercase text-[#727272] mb-1">
                Switch Role Lens:
              </label>
              <select
                id="role-select"
                value={user.role}
                onChange={(e) => switchDemoRole(e.target.value as UserRole)}
                className="w-full text-[11px] h-7 bg-white border border-[#EAEAEA] rounded px-1.5 text-[#222222] focus:border-[#1B74E4] focus:outline-none"
              >
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {collapsed && (
          <button
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            className="w-full h-8 rounded border border-[#EAEAEA] bg-white hover:bg-[#F8F9FA] text-[#727272] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onSignOut}
          className="w-full h-8 rounded border border-[#EAEAEA] bg-white hover:bg-[#FEF3F2] hover:text-[#B42318] text-[#727272] flex items-center justify-center gap-2 text-xs font-medium transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
