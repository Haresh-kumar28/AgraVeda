import React, { useState } from 'react';
import { Mail, Lock, User, Building, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';
import { UserRole, ROLE_LABELS, ROLE_DESCRIPTIONS } from '../../auth/roles';

interface SignupPageProps {
  onNavigate: (route: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { signup, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [department, setDepartment] = useState('');
  const [requestedRole, setRequestedRole] = useState<UserRole>('ed_manager');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      await signup({
        name,
        email,
        organization,
        department,
        requestedRole,
        password,
      });
      onNavigate('app');
    } catch {
      setError('Registration request failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
      <header className="px-6 py-4 border-b border-[#EAEAEA] bg-white flex items-center justify-between">
        <button
          onClick={() => onNavigate('landing')}
          className="text-left cursor-pointer focus-visible:outline-2"
        >
          <BrandLogo size="md" />
        </button>
        <button
          onClick={() => onNavigate('login')}
          className="text-xs text-[#727272] hover:text-[#222222] font-medium"
        >
          Already have access? <span className="text-[#1B74E4] font-semibold">Sign in</span>
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl bg-white border border-[#EAEAEA] rounded-md overflow-hidden p-8 sm:p-10 shadow-sm">
          <div className="mb-6">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1B74E4] bg-[#EAF4FF] px-2 py-0.5 rounded-sm">
              Staff Provisioning Request
            </span>
            <h1 className="text-2xl font-bold text-[#222222] mt-2">Request AgraVeda Access</h1>
            <p className="text-xs text-[#727272] mt-1">
              Enroll your hospital team to anticipate emergency operational bottlenecks.
            </p>
          </div>

          {/* Role disclaimer callout */}
          <div className="mb-6 p-3.5 bg-[#EFF8FF] border border-[#B2DDFF] rounded-md text-xs text-[#175CD3] flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Security Governance Principle:</span>
              <p className="mt-0.5 leading-relaxed text-[#1558B0]">
                Selecting a role is a permission request, not proof of authorization. Production deployment requires institutional credential verification before assigning administrator or clinical roles.
              </p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 p-3 rounded-md bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-[#222222] mb-1">
                  Full Name & Title
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Jordan Vance, MD"
                    className="w-full h-10 px-3 pl-9 rounded-md border border-[#E5E7EB] bg-white text-sm text-[#222222] placeholder:text-[#B6B6B6] focus:border-[#1B74E4] focus:outline-none"
                  />
                  <User className="w-4 h-4 text-[#B6B6B6] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-[#222222] mb-1">
                  Institutional Email
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="org" className="block text-xs font-semibold text-[#222222] mb-1">
                  Hospital / Health System
                </label>
                <div className="relative">
                  <input
                    id="org"
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="MetroHealth System"
                    className="w-full h-10 px-3 pl-9 rounded-md border border-[#E5E7EB] bg-white text-sm text-[#222222] placeholder:text-[#B6B6B6] focus:border-[#1B74E4] focus:outline-none"
                  />
                  <Building className="w-4 h-4 text-[#B6B6B6] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="dept" className="block text-xs font-semibold text-[#222222] mb-1">
                  Department / Unit (Optional)
                </label>
                <input
                  id="dept"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Emergency Department / Trauma"
                  className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] bg-white text-sm text-[#222222] placeholder:text-[#B6B6B6] focus:border-[#1B74E4] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-xs font-semibold text-[#222222] mb-1">
                Requested Operational Role
              </label>
              <select
                id="role"
                value={requestedRole}
                onChange={(e) => setRequestedRole(e.target.value as UserRole)}
                className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] bg-white text-sm text-[#222222] focus:border-[#1B74E4] focus:outline-none"
              >
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#727272] mt-1.5">
                {ROLE_DESCRIPTIONS[requestedRole]}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label htmlFor="pass" className="block text-xs font-semibold text-[#222222] mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="pass"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full h-10 px-3 pl-9 rounded-md border border-[#E5E7EB] bg-white text-sm text-[#222222] placeholder:text-[#B6B6B6] focus:border-[#1B74E4] focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-[#B6B6B6] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="cpass" className="block text-xs font-semibold text-[#222222] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="cpass"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full h-10 px-3 pl-9 rounded-md border border-[#E5E7EB] bg-white text-sm text-[#222222] placeholder:text-[#B6B6B6] focus:border-[#1B74E4] focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-[#B6B6B6] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-[#1B74E4] hover:bg-[#1558B0] text-white text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Submitting Request...' : 'Submit Provisioning Request'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-[#EAEAEA] flex items-center justify-between text-xs text-[#727272]">
            <span>Already approved by your hospital?</span>
            <button
              onClick={() => onNavigate('login')}
              className="font-semibold text-[#1B74E4] hover:underline"
            >
              Sign In Here
            </button>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-[11px] text-[#727272] border-t border-[#EAEAEA] bg-white">
        AgraVeda Operations Platform · Operational Decision Support Only · Synthetic Healthcare Demo
      </footer>
    </div>
  );
};
