import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { DEMO_PROFILES } from '../../auth/AuthAdapter';
import { BrandLogo } from '../../components/BrandLogo';
import { UserRole, ROLE_LABELS } from '../../auth/roles';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, switchDemoRole, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please provide an email address.');
      return;
    }
    try {
      await login({ email, password, rememberMe });
      onNavigate('app');
    } catch {
      setError('Authentication failed. Please verify credentials.');
    }
  };

  const handleDemoQuickLogin = async (role: UserRole) => {
    try {
      await switchDemoRole(role);
      onNavigate('app');
    } catch {
      setError('Failed to switch demo persona.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-[#EAEAEA] bg-white flex items-center justify-between">
        <button
          onClick={() => onNavigate('landing')}
          className="text-left cursor-pointer focus-visible:outline-2"
        >
          <BrandLogo size="md" />
        </button>
        <button
          onClick={() => onNavigate('landing')}
          className="text-xs text-[#727272] hover:text-[#222222] font-medium"
        >
          ← Back to Overview
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl bg-white border border-[#EAEAEA] rounded-md overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-sm">
          {/* Left: Login Form (7 cols on desktop) */}
          <div className="p-8 sm:p-10 md:col-span-7 flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1B74E4] bg-[#EAF4FF] px-2 py-0.5 rounded-sm">
                  Hospital Portal Access
                </span>
                <h1 className="text-2xl font-bold text-[#222222] mt-2">Sign in to AgraVeda</h1>
                <p className="text-xs text-[#727272] mt-1">
                  Access emergency operations intelligence and predictive capacity signals.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-5 p-3 rounded-md bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] text-xs flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-[#222222] mb-1">
                    Work Email
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      autoComplete="username"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@hospital.org"
                      className="w-full h-10 px-3 pl-9 rounded-md border border-[#E5E7EB] bg-white text-sm text-[#222222] placeholder:text-[#B6B6B6] focus:border-[#1B74E4] focus:outline-none"
                    />
                    <Mail className="w-4 h-4 text-[#B6B6B6] absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="pass" className="block text-xs font-semibold text-[#222222]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => onNavigate('forgot-password')}
                      className="text-[11px] text-[#1B74E4] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="pass"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-10 px-3 pl-9 pr-9 rounded-md border border-[#E5E7EB] bg-white text-sm text-[#222222] placeholder:text-[#B6B6B6] focus:border-[#1B74E4] focus:outline-none"
                    />
                    <Lock className="w-4 h-4 text-[#B6B6B6] absolute left-3 top-3 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#727272] hover:text-[#222222]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#727272]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#E5E7EB] text-[#1B74E4] focus:ring-0"
                    />
                    <span>Remember this session</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 mt-2 bg-[#1B74E4] hover:bg-[#1558B0] text-white text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Authenticating...' : 'Sign In'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            <div className="mt-8 pt-4 border-t border-[#EAEAEA] flex items-center justify-between text-xs text-[#727272]">
              <span>Need an account for your department?</span>
              <button
                onClick={() => onNavigate('signup')}
                className="font-semibold text-[#1B74E4] hover:underline"
              >
                Request access
              </button>
            </div>
          </div>

          {/* Right: Quick Demo Persona Switcher (5 cols on desktop) */}
          <div className="p-8 bg-[#F8F9FA] border-t md:border-t-0 md:border-l border-[#EAEAEA] md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="w-4 h-4 text-[#1B74E4]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#222222]">
                  Interactive Demo Profiles
                </h2>
              </div>
              <p className="text-[11px] text-[#727272] leading-relaxed mb-4">
                Select an operational persona to inspect role-based access rules and specialized capabilities directly:
              </p>

              <div className="space-y-2">
                {(Object.keys(DEMO_PROFILES) as UserRole[]).map((r) => {
                  const p = DEMO_PROFILES[r];
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleDemoQuickLogin(r)}
                      className="w-full p-2.5 rounded-md border border-[#EAEAEA] bg-white hover:border-[#1B74E4] hover:bg-[#EAF4FF] text-left transition-all flex flex-col gap-0.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#222222] group-hover:text-[#1B74E4]">
                          {ROLE_LABELS[r]}
                        </span>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#F8F9FA] text-[#727272] border border-[#EAEAEA]">
                          Seeded
                        </span>
                      </div>
                      <span className="text-[11px] text-[#727272] truncate">{p.name}</span>
                      <span className="text-[10px] text-[#A0A0A0] truncate">{p.department}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EAEAEA] text-[10px] text-[#727272] leading-tight">
              <span className="font-semibold text-[#222222]">Demo Safety Notice:</span> Demo mode allows reviewers to test operational UI flows with pre-configured synthetic access. Password hashing, HTTPS cookies, and hospital EHR synchronization must be provisioned before live institutional deployment.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-[#727272] border-t border-[#EAEAEA] bg-white">
        AgraVeda Operations Platform · Synthetic Healthcare Data · Operational Decision Support Only
      </footer>
    </div>
  );
};
