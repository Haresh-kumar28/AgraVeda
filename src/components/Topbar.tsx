import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, LogOut, ExternalLink, AlertCircle, Clock, ShieldAlert, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ROLE_LABELS, UserRole } from '../auth/roles';

interface TopbarProps {
  onSignOut: () => void;
  onNavigateHome: () => void;
  onNavigateAppPage?: (page: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onSignOut, onNavigateHome, onNavigateAppPage }) => {
  const { user, switchDemoRole } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleAlertNavigate = (page: string) => {
    setShowNotifications(false);
    if (onNavigateAppPage) {
      onNavigateAppPage(page);
    }
  };

  return (
    <header className="topbar relative">
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
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            aria-expanded={showNotifications}
            aria-haspopup="dialog"
            className={`w-8 h-8 rounded border transition-colors cursor-pointer relative flex items-center justify-center ${
              showNotifications
                ? 'border-[#1B74E4] bg-[#EAF4FF] text-[#1B74E4]'
                : 'border-[#EAEAEA] bg-white hover:bg-[#F8F9FA] text-[#727272] hover:text-[#222222]'
            }`}
            aria-label="Operational Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#B42318] rounded-full"></span>
          </button>

          {showNotifications && (
            <div
              role="dialog"
              aria-label="Operational Alerts and Notifications"
              className="absolute right-0 top-full mt-2 w-84 sm:w-96 bg-white border border-[#E8E4DF] rounded-lg shadow-xl p-4 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
                <div>
                  <div className="font-bold text-[#1A1A1A] flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[#1B74E4]" />
                    <span>Active Operational Alerts</span>
                  </div>
                  <p className="text-[10px] text-[#6B6B6B] mt-0.5">
                    Verified live EHR stream & predictive forward horizons
                  </p>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#FAFAF8] transition-colors"
                  aria-label="Close alerts"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5 py-3 max-h-[380px] overflow-y-auto">
                {/* Alert 1: Verified Live Bottleneck Alert */}
                <div
                  onClick={() => handleAlertNavigate('resources')}
                  className="p-3 bg-[#FEF3F2] border border-[#FECDCA] rounded-md hover:border-[#FDA29B] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-white text-[#B42318] px-1.5 py-0.2 rounded border border-[#FECDCA]">
                      Verified EHR Alert
                    </span>
                    <span className="text-[10px] text-[#B42318] font-mono font-medium">95% Occupancy</span>
                  </div>
                  <div className="font-bold text-[12px] text-[#1A1A1A] group-hover:text-[#B42318] transition-colors mt-1.5">
                    Primary Constraint: Bed Deficit
                  </div>
                  <p className="text-[11px] text-[#4A4A4A] mt-1 leading-snug">
                    Acute care bed availability reached 2 beds. Zero reserve buffer for EMS triage.
                  </p>
                  <div className="mt-2 text-[10px] font-semibold text-[#B42318] flex items-center gap-1">
                    <span>Inspect Bed Capacity in Resources</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Alert 2: Predictive Arrival Peak */}
                <div
                  onClick={() => handleAlertNavigate('forecast-inputs')}
                  className="p-3 bg-[#EFF8FF] border border-[#B2DDFF] rounded-md hover:border-[#84CAFF] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-white text-[#175CD3] px-1.5 py-0.2 rounded border border-[#B2DDFF]">
                      Predictive Heuristic
                    </span>
                    <span className="text-[10px] text-[#175CD3] font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      +2h Horizon
                    </span>
                  </div>
                  <div className="font-bold text-[12px] text-[#1A1A1A] group-hover:text-[#175CD3] transition-colors mt-1.5">
                    Temporal Cycle Peak Imminent
                  </div>
                  <p className="text-[11px] text-[#4A4A4A] mt-1 leading-snug">
                    Poisson arrival model indicates afternoon volume acceleration to 18 arrivals/hr.
                  </p>
                  <div className="mt-2 text-[10px] font-semibold text-[#175CD3] flex items-center gap-1">
                    <span>Inspect Forecast & Inputs</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Alert 3: Triage Cascading Risk */}
                <div
                  onClick={() => handleAlertNavigate('patient-flow')}
                  className="p-3 bg-[#FAFAF8] border border-[#E8E4DF] rounded-md hover:border-[#D0D5DD] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-white text-[#6B6B6B] px-1.5 py-0.2 rounded border border-[#E8E4DF]">
                      Flow Dependency
                    </span>
                    <span className="text-[10px] text-[#6B6B6B]">Upstream Cascade</span>
                  </div>
                  <div className="font-bold text-[12px] text-[#1A1A1A] group-hover:text-[#1B74E4] transition-colors mt-1.5">
                    Ambulance Offload Delay (AOD) Warning
                  </div>
                  <p className="text-[11px] text-[#4A4A4A] mt-1 leading-snug">
                    Bed boarding delays are beginning to slow triage disposition and EMS transfer.
                  </p>
                  <div className="mt-2 text-[10px] font-semibold text-[#1B74E4] flex items-center gap-1">
                    <span>Trace 7-Stage Flow Backlogs</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#E8E4DF] flex items-center justify-between text-[11px] text-[#6B6B6B]">
                <span>Status: Continuous Monitoring</span>
                <button
                  onClick={() => handleAlertNavigate('command-center')}
                  className="text-[#1B74E4] hover:underline font-semibold"
                >
                  View Command Center →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            aria-expanded={showProfileMenu}
            aria-haspopup="menu"
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
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#E8E4DF] rounded-lg shadow-xl p-3 z-50 text-xs space-y-3 animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <div className="pb-2 border-b border-[#E8E4DF]">
                <div className="font-bold text-[#1A1A1A]">{user?.name}</div>
                <div className="text-[11px] text-[#6B6B6B]">{user?.email}</div>
                <div className="text-[10px] font-medium text-[#1B74E4] mt-1 bg-[#EAF4FF] px-1.5 py-0.5 rounded inline-block">
                  {user ? ROLE_LABELS[user.role] : ''}
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase text-[#6B6B6B] mb-1.5">
                  Switch Active Role Lens:
                </span>
                <div className="space-y-1">
                  {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                    <button
                      key={r}
                      role="menuitem"
                      onClick={() => {
                        switchDemoRole(r);
                        setShowProfileMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition-colors ${
                        user?.role === r
                          ? 'bg-[#EAF4FF] text-[#1B74E4] font-bold'
                          : 'hover:bg-[#FAFAF8] text-[#1A1A1A]'
                      }`}
                    >
                      {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8E4DF] flex items-center justify-between">
                <button
                  onClick={onNavigateHome}
                  className="text-xs text-[#6B6B6B] hover:text-[#1A1A1A] font-medium flex items-center gap-1"
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

export default Topbar;
