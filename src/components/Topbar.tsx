import React, { useState } from 'react';
import { Search, Bell, ChevronDown, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ROLE_LABELS, UserRole } from '../auth/roles';

interface TopbarProps {
  onSignOut: () => void;
  onNavigateHome: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onSignOut, onNavigateHome }) => {
  const { user, switchDemoRole } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="topbar">
      {/* Search Input (wired to filter state / quick navigation) */}
      <div className="topbar-search">
        <Search className="w-3.5 h-3.5" />
        <input
          aria-label="Search operational modules or patient flow metrics"
          placeholder="Search modules, metrics, or alerts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Right meta actions */}
      <div className="topbar-meta">
        <span className="hidden lg:inline topbar-chip">
          <span className="w-2 h-2 rounded-full bg-[#0E7A4E]"></span>
          <span>EHR Stream: Synthetic Stream Active</span>
        </span>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded border border-[#EAEAEA] bg-white hover:bg-[#F8F9FA] flex items-center justify-center text-[#727272] hover:text-[#222222] transition-colors cursor-pointer relative"
            aria-label="Operational Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#B42318] rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#EAEAEA] rounded-md shadow-lg p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#EAEAEA] font-bold text-[#222222]">
                <span>Operational Alerts</span>
                <span className="text-[10px] text-[#727272] font-normal">Real-time heuristics</span>
              </div>
              <div className="space-y-2 py-2">
                <div className="p-2 bg-[#FEF3F2] border border-[#FECDCA] rounded text-[#B42318]">
                  <div className="font-bold text-[11px]">Primary Constraint: Bed Deficit</div>
                  <div className="text-[10px] text-[#B42318]/90 mt-0.5">
                    Treatment beds projected to reach 90% capacity in +2h.
                  </div>
                </div>
                <div className="p-2 bg-[#F8F9FA] border border-[#EAEAEA] rounded text-[#727272]">
                  <div className="font-bold text-[11px] text-[#222222]">Temporal Cycle Active</div>
                  <div className="text-[10px] mt-0.5">
                    Hourly arrival peak expected between 14:00 - 16:00.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 rounded border border-[#EAEAEA] hover:border-[#B6B6B6] bg-white cursor-pointer transition-colors"
            aria-label="User Profile and Role Options"
          >
            <div className="w-7 h-7 rounded bg-[#EAF4FF] text-[#1B74E4] font-bold text-xs flex items-center justify-center">
              {user ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight pr-1">
              <span className="text-xs font-bold text-[#222222] truncate max-w-[130px]">
                {user?.name || 'Staff User'}
              </span>
              <span className="text-[10px] text-[#727272] truncate max-w-[130px]">
                {user ? ROLE_LABELS[user.role] : 'Operations'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#727272]" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#EAEAEA] rounded-md shadow-lg p-3 z-50 text-xs space-y-3">
              <div className="pb-2 border-b border-[#EAEAEA]">
                <div className="font-bold text-[#222222]">{user?.name}</div>
                <div className="text-[11px] text-[#727272]">{user?.email}</div>
                <div className="text-[10px] font-medium text-[#1B74E4] mt-1 bg-[#EAF4FF] px-1.5 py-0.5 rounded inline-block">
                  {user ? ROLE_LABELS[user.role] : ''}
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase text-[#727272] mb-1.5">
                  Switch Active Role Lens:
                </span>
                <div className="space-y-1">
                  {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchDemoRole(r);
                        setShowProfileMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition-colors ${
                        user?.role === r
                          ? 'bg-[#EAF4FF] text-[#1B74E4] font-bold'
                          : 'hover:bg-[#F8F9FA] text-[#222222]'
                      }`}
                    >
                      {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#EAEAEA] flex items-center justify-between">
                <button
                  onClick={onNavigateHome}
                  className="text-xs text-[#727272] hover:text-[#222222] font-medium flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Public Landing</span>
                </button>

                <button
                  onClick={onSignOut}
                  className="text-xs font-semibold text-[#B42318] hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
