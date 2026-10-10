import React, { useState } from 'react';
import { Users, Shield, UserPlus, Search, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { UserRole, ROLE_LABELS, ROLE_DESCRIPTIONS } from '../auth/roles';

interface ProvisionedStaff {
  id: string;
  name: string;
  email: string;
  organization: string;
  department: string;
  role: UserRole;
  status: 'active' | 'pending_verification' | 'suspended';
  lastActive: string;
}

export const AdminPage: React.FC = () => {
  const { user, can } = useAuth();
  const isAdmin = can('manage_users');

  const [staffList, setStaffList] = useState<ProvisionedStaff[]>([
    {
      id: 'usr-01',
      name: 'Dr. Evelyn Vance, MD, MHA',
      email: 'evelyn.vance@metrohealth.demo',
      organization: 'MetroHealth System',
      department: 'Executive Board',
      role: 'hospital_admin',
      status: 'active',
      lastActive: '5m ago',
    },
    {
      id: 'usr-02',
      name: 'Marcus Chen, RN, BSN',
      email: 'marcus.chen@metrohealth.demo',
      organization: 'MetroHealth System',
      department: 'Emergency Services',
      role: 'ed_manager',
      status: 'active',
      lastActive: '12m ago',
    },
    {
      id: 'usr-03',
      name: 'Dr. Sarah Jenkins, MD, FACEP',
      email: 'sarah.jenkins@metrohealth.demo',
      organization: 'MetroHealth System',
      department: 'Emergency Medicine',
      role: 'clinician',
      status: 'active',
      lastActive: '1h ago',
    },
    {
      id: 'usr-04',
      name: 'Priya Patel, BSN, CEN',
      email: 'priya.patel@metrohealth.demo',
      organization: 'MetroHealth System',
      department: 'Triage / Rapid Assessment',
      role: 'nurse_ops',
      status: 'active',
      lastActive: '22m ago',
    },
    {
      id: 'usr-05',
      name: 'Jordan Miller, MSc',
      email: 'jordan.miller@metrohealth.demo',
      organization: 'MetroHealth System',
      department: 'Quality Safety & Analytics',
      role: 'analyst',
      status: 'active',
      lastActive: '3h ago',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('nurse_ops');
  const [inviteNote, setInviteNote] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <div className="p-8 bg-white border border-[#EAEAEA] rounded-md text-center space-y-3">
        <Shield className="w-8 h-8 text-[#B42318] mx-auto" />
        <h2 className="text-base font-bold text-[#222222]">Restricted to Hospital Administrators</h2>
        <p className="text-xs text-[#727272] max-w-sm mx-auto">
          Staff provisioning and security governance controls require verified administrative authorization.
        </p>
      </div>
    );
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    const newStaff: ProvisionedStaff = {
      id: `usr-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      organization: user?.organization || 'MetroHealth System',
      department: 'Emergency Services',
      role: inviteRole,
      status: 'active',
      lastActive: 'Just now',
    };

    setStaffList([...staffList, newStaff]);
    setInviteNote(`Provisioned invitation dispatched to ${inviteEmail}.`);
    setInviteName('');
    setInviteEmail('');
    setTimeout(() => {
      setShowInviteModal(false);
      setInviteNote(null);
    }, 1800);
  };

  const filtered = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1B74E4]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#222222]">
              Hospital Staff & Role Governance
            </h1>
          </div>
          <p className="text-xs text-[#727272] mt-1">
            Manage provisioned emergency department personnel and role-based operational permissions.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="h-8 px-3 rounded bg-[#1B74E4] hover:bg-[#1558B0] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Provision New Staff</span>
        </button>
      </div>

      {/* Staff Table Card */}
      <div className="bg-white border border-[#EAEAEA] rounded-md overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter staff by name, email, unit..."
              className="w-full h-8 px-3 pl-8 rounded border border-[#EAEAEA] bg-[#F8F9FA] text-xs text-[#222222] focus:border-[#1B74E4] focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-[#727272] absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          <span className="text-xs text-[#727272]">
            Showing <strong>{filtered.length}</strong> active operational accounts
          </span>
        </div>

        <div className="overflow-x-auto border border-[#EAEAEA] rounded">
          <table className="w-full text-xs text-left text-[#222222]">
            <thead className="bg-[#F8F9FA] text-[10px] font-bold uppercase text-[#727272] border-b border-[#EAEAEA]">
              <tr>
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">Assigned Operational Role</th>
                <th className="px-4 py-3">Unit / Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Last Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-[#F8F9FA]">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-[11px] text-[#727272]">{s.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-[#1B74E4]">{ROLE_LABELS[s.role]}</span>
                  </td>
                  <td className="px-4 py-3 text-[#727272]">{s.department}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#ECFDF3] text-[#0E7A4E]">
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[#727272] font-mono">{s.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#EAEAEA] rounded-md max-w-md w-full p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAEAEA]">
              <h2 className="text-sm font-bold text-[#222222]">
                Provision Emergency Staff Account
              </h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-xs text-[#727272] hover:text-[#222222]"
              >
                ✕
              </button>
            </div>

            {inviteNote && (
              <div className="p-3 bg-[#ECFDF3] border border-[#A6F4C5] text-[#0E7A4E] text-xs rounded flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{inviteNote}</span>
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#222222] mb-1">Staff Member Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Rachel Adams, RN"
                  className="w-full h-8 px-2.5 rounded border border-[#EAEAEA] bg-[#F8F9FA] focus:border-[#1B74E4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#222222] mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="rachel.adams@hospital.org"
                  className="w-full h-8 px-2.5 rounded border border-[#EAEAEA] bg-[#F8F9FA] focus:border-[#1B74E4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#222222] mb-1">Operational Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full h-8 px-2 rounded border border-[#EAEAEA] bg-[#F8F9FA] focus:border-[#1B74E4] focus:outline-none"
                >
                  {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#727272] mt-1">
                  {ROLE_DESCRIPTIONS[inviteRole]}
                </p>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="h-8 px-3 rounded border border-[#EAEAEA] bg-white text-[#727272] hover:text-[#222222]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded bg-[#1B74E4] hover:bg-[#1558B0] text-white font-semibold"
                >
                  Authorize & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
