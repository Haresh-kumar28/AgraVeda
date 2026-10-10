import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, Info } from 'lucide-react';
import { AuthAdapter } from '../../auth/AuthAdapter';
import { BrandLogo } from '../../components/BrandLogo';

interface ForgotPasswordPageProps {
  onNavigate: (route: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const res = await AuthAdapter.requestPasswordReset(email);
    setStatusMessage(res.message);
    setIsSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
      <header className="px-6 py-4 border-b border-[#EAEAEA] bg-white flex items-center justify-between">
        <button onClick={() => onNavigate('landing')} className="text-left cursor-pointer">
          <BrandLogo size="md" />
        </button>
        <button
          onClick={() => onNavigate('login')}
          className="text-xs text-[#727272] hover:text-[#222222] font-medium"
        >
          ← Return to Login
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white border border-[#EAEAEA] rounded-md p-8 sm:p-10 shadow-sm">
          {!isSubmitted ? (
            <>
              <div className="mb-6">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1B74E4] bg-[#EAF4FF] px-2 py-0.5 rounded-sm">
                  Access Recovery
                </span>
                <h1 className="text-2xl font-bold text-[#222222] mt-2">Reset Password</h1>
                <p className="text-xs text-[#727272] mt-1">
                  Enter your hospital email address to receive password reset instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-xs font-semibold text-[#222222] mb-1">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <input
                      id="reset-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@hospital.org"
                      className="w-full h-10 px-3 pl-9 rounded-md border border-[#E5E7EB] bg-white text-sm text-[#222222] placeholder:text-[#B6B6B6] focus:border-[#1B74E4] focus:outline-none"
                    />
                    <Mail className="w-4 h-4 text-[#B6B6B6] absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-[#1B74E4] hover:bg-[#1558B0] text-white text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Send Recovery Instructions'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-[#ECFDF3] border border-[#A6F4C5] text-[#0E7A4E] mx-auto flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-[#222222]">Request Dispatched</h2>
              <p className="text-xs text-[#727272] mt-2 leading-relaxed">
                {statusMessage}
              </p>
              <div className="mt-6 p-3 bg-[#F8F9FA] border border-[#EAEAEA] rounded text-[11px] text-[#727272] text-left flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-[#1B74E4] mt-0.5" />
                <span>
                  <strong>Production Architecture Requirement:</strong> Requires an authenticated SMTP gateway or transactional identity service (e.g. SendGrid, AWS SES) with signed short-lived JWT reset tokens.
                </span>
              </div>
              <button
                onClick={() => onNavigate('login')}
                className="mt-6 w-full h-9 bg-white border border-[#EAEAEA] hover:bg-[#F8F9FA] text-xs font-semibold text-[#222222] rounded-md transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-[11px] text-[#727272] border-t border-[#EAEAEA] bg-white">
        AgraVeda Operations Platform · Synthetic Demo Environment
      </footer>
    </div>
  );
};
