import React from 'react';
import { ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';
import { useAuth } from '../../auth/AuthContext';
import { ROLE_LABELS } from '../../auth/roles';

interface AccessDeniedPageProps {
  onNavigate: (route: string) => void;
  requiredCapability?: string;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  onNavigate,
  requiredCapability,
}) => {
  const { user, switchDemoRole } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
      <header className="px-6 py-4 border-b border-[#EAEAEA] bg-white flex items-center justify-between">
        <button onClick={() => onNavigate('landing')} className="text-left cursor-pointer">
          <BrandLogo size="md" />
        </button>
        <button
          onClick={() => onNavigate('app')}
          className="text-xs text-[#727272] hover:text-[#222222] font-medium"
        >
          Return to Dashboard
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg bg-white border border-[#EAEAEA] rounded-md p-8 sm:p-10 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-[#B42318] bg-[#FEF3F2] px-2 py-0.5 rounded-sm">
            403 · Access Restricted
          </span>

          <h1 className="text-2xl font-bold text-[#222222] mt-3">
            Insufficient Role Permissions
          </h1>

          <p className="text-xs text-[#727272] mt-2 leading-relaxed max-w-sm mx-auto">
            Your current assigned role ({user ? <strong className="text-[#222222]">{ROLE_LABELS[user.role]}</strong> : 'Unauthenticated'}) does not have permission to access {requiredCapability ? `"${requiredCapability}"` : 'this operational module'}.
          </p>

          <div className="my-6 p-3.5 bg-[#F8F9FA] border border-[#EAEAEA] rounded text-left text-xs text-[#727272] space-y-1.5">
            <div className="flex justify-between">
              <span>Active User:</span>
              <strong className="text-[#222222]">{user?.name || 'Guest'}</strong>
            </div>
            <div className="flex justify-between">
              <span>Active Role:</span>
              <strong className="text-[#222222]">{user ? ROLE_LABELS[user.role] : 'None'}</strong>
            </div>
            <div className="flex justify-between">
              <span>Organization:</span>
              <span className="text-[#222222]">{user?.organization || 'N/A'}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={() => onNavigate('app')}
              className="flex-1 h-10 bg-[#1B74E4] hover:bg-[#1558B0] text-white text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Safe Workspace
            </button>
            <button
              onClick={() => switchDemoRole('hospital_admin')}
              className="h-10 px-4 bg-white border border-[#EAEAEA] hover:bg-[#F8F9FA] text-xs font-semibold text-[#222222] rounded-md flex items-center justify-center gap-1.5 transition-colors"
              title="Switch demo session to Hospital Administrator"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#1B74E4]" />
              Switch to Admin Role
            </button>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-[11px] text-[#727272] border-t border-[#EAEAEA] bg-white">
        AgraVeda Security Framework · Least-Privilege Role Matrix Enforced
      </footer>
    </div>
  );
};
