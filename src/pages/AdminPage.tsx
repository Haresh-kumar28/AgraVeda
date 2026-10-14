import React, { useState, useMemo } from 'react';
import {
  Users,
  Shield,
  UserPlus,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Filter,
  RotateCcw,
  Edit2,
  Lock,
  UserCheck,
  UserX,
  Activity,
  FileText,
  Sliders,
  ShieldAlert,
  AlertCircle,
  Check,
  Eye,
  Key,
  Calendar,
  Building,
  Mail,
  MoreVertical,
  History,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { UserRole, Capability, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_CAPABILITIES } from '../auth/roles';

export interface ProvisionedStaff {
  id: string;
  name: string;
  email: string;
  organization: string;
  department: string;
  role: UserRole;
  status: 'active' | 'pending_verification' | 'suspended';
  lastActive: string;
  mfaEnabled: boolean;
  ssoConnected: boolean;
  provisionedDate: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  outcome: 'SUCCESS' | 'DENIED' | 'FAILED';
  details: string;
}

const CAPABILITY_LABELS: Record<Capability, { label: string; category: string }> = {
  view_command_center: { label: 'Command Center Live Overview', category: 'Operational Views' },
  view_forecasts: { label: 'Inflow & Occupancy Forecasting', category: 'Operational Views' },
  edit_simulation_inputs: { label: 'Forecast Parameter Adjustments', category: 'Simulation & Inputs' },
  view_patient_flow: { label: '7-Stage Patient Journey & Queues', category: 'Operational Views' },
  view_resources: { label: 'Resource Capacity & Ratio Matrices', category: 'Operational Views' },
  view_scenarios: { label: 'Demand Surge Scenarios View', category: 'Simulation & Inputs' },
  simulate_what_if: { label: 'What-If Resource Interventions', category: 'Simulation & Inputs' },
  view_decisions: { label: 'Operational Decision Briefs View', category: 'Decision Governance' },
  acknowledge_decisions: { label: 'Acknowledge Escalation Briefs', category: 'Decision Governance' },
  view_data_quality: { label: 'Data Quality & Model Governance', category: 'Auditing & Analytics' },
  manage_organization: { label: 'Facility Configuration Settings', category: 'Administration' },
  manage_users: { label: 'Staff Provisioning & Role Governance', category: 'Administration' },
};

const DEPARTMENTS = [
  'All Departments',
  'Executive Board',
  'Emergency Services',
  'Emergency Medicine',
  'Triage / Rapid Assessment',
  'Quality Safety & Analytics',
  'Trauma Resuscitation',
];

export const AdminPage: React.FC = () => {
  const { user, can } = useAuth();
  const isAdmin = can('manage_users');

  // Active view tab: 'staff' | 'matrix' | 'audit'
  const [activeTab, setActiveTab] = useState<'staff' | 'matrix' | 'audit'>('staff');

  // Staff state
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
      mfaEnabled: true,
      ssoConnected: true,
      provisionedDate: '2026-01-15',
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
      mfaEnabled: true,
      ssoConnected: true,
      provisionedDate: '2026-02-01',
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
      mfaEnabled: true,
      ssoConnected: true,
      provisionedDate: '2026-02-14',
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
      mfaEnabled: true,
      ssoConnected: true,
      provisionedDate: '2026-03-01',
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
      mfaEnabled: false,
      ssoConnected: true,
      provisionedDate: '2026-03-10',
    },
    {
      id: 'usr-06',
      name: 'David Wu, RN',
      email: 'david.wu@metrohealth.demo',
      organization: 'MetroHealth System',
      department: 'Emergency Services',
      role: 'nurse_ops',
      status: 'pending_verification',
      lastActive: 'Never',
      mfaEnabled: false,
      ssoConnected: false,
      provisionedDate: '2026-10-12',
    },
    {
      id: 'usr-07',
      name: 'Dr. Robert Hayes, MD',
      email: 'robert.hayes@metrohealth.demo',
      organization: 'MetroHealth System',
      department: 'Trauma Resuscitation',
      role: 'clinician',
      status: 'suspended',
      lastActive: '14d ago',
      mfaEnabled: true,
      ssoConnected: true,
      provisionedDate: '2025-11-20',
    },
  ]);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('All Departments');

  // Selected staff drawer state
  const [selectedStaff, setSelectedStaff] = useState<ProvisionedStaff | null>(null);
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [editRole, setEditRole] = useState<UserRole>('nurse_ops');
  const [editDept, setEditDept] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'pending_verification' | 'suspended'>('active');
  const [confirmStatusModal, setConfirmStatusModal] = useState<string | null>(null);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDept, setInviteDept] = useState('Emergency Services');
  const [inviteRole, setInviteRole] = useState<UserRole>('nurse_ops');
  const [dispatchSmtp, setDispatchSmtp] = useState(true);
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Administrative Audit Log state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'aud-01',
      timestamp: '2026-10-14 21:10 UTC',
      actor: user?.name || 'Dr. Evelyn Vance',
      action: 'USER_ROLE_VERIFIED',
      target: 'Marcus Chen, RN',
      outcome: 'SUCCESS',
      details: 'Confirmed ED Manager operational permissions for triage escalation.',
    },
    {
      id: 'aud-02',
      timestamp: '2026-10-14 18:30 UTC',
      actor: user?.name || 'Dr. Evelyn Vance',
      action: 'USER_INVITATION_DISPATCHED',
      target: 'David Wu, RN',
      outcome: 'SUCCESS',
      details: 'Provisioned invitation token dispatched to david.wu@metrohealth.demo.',
    },
    {
      id: 'aud-03',
      timestamp: '2026-10-12 14:15 UTC',
      actor: user?.name || 'Dr. Evelyn Vance',
      action: 'SECURITY_ACCOUNT_SUSPENDED',
      target: 'Dr. Robert Hayes, MD',
      outcome: 'SUCCESS',
      details: 'Account access suspended pending institutional credentialing re-validation.',
    },
  ]);

  const addAuditEntry = (action: string, target: string, details: string) => {
    const now = new Date();
    const timeStr = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)} UTC`;
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: timeStr,
      actor: user?.name || 'Hospital Administrator',
      action,
      target,
      outcome: 'SUCCESS',
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // If unauthorized, return access restricted screen
  if (!isAdmin) {
    return (
      <div className="p-10 bg-white border border-[#E8E4DF] rounded-lg text-center space-y-4 max-w-lg mx-auto my-8 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-[#FEF3F2] text-[#B42318] mx-auto flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-[#1A1A1A]">Administrative Access Restricted</h2>
        <p className="text-xs text-[#6B6B6B] leading-relaxed">
          Staff provisioning, operational credential management, and role security governance controls require verified <strong>Hospital Administrator</strong> authorization.
        </p>
        <div className="p-3 bg-[#FAFAF8] rounded border border-[#E8E4DF] text-xs text-[#6B6B6B]">
          Current Role Lens: <strong className="text-[#1A1A1A]">{user ? ROLE_LABELS[user.role] : 'Unauthenticated'}</strong>
        </div>
      </div>
    );
  }

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ROLE_LABELS[s.role].toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || s.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesDept = deptFilter === 'All Departments' || s.department === deptFilter;

      return matchesSearch && matchesRole && matchesStatus && matchesDept;
    });
  }, [staffList, searchTerm, roleFilter, statusFilter, deptFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = staffList.length;
    const active = staffList.filter((s) => s.status === 'active').length;
    const pending = staffList.filter((s) => s.status === 'pending_verification').length;
    const suspended = staffList.filter((s) => s.status === 'suspended').length;
    const mfaCoverage = Math.round((staffList.filter((s) => s.mfaEnabled).length / Math.max(1, total)) * 100);

    return { total, active, pending, suspended, mfaCoverage };
  }, [staffList]);

  // Handlers
  const handleOpenStaffDetails = (staff: ProvisionedStaff) => {
    setSelectedStaff(staff);
    setEditRole(staff.role);
    setEditDept(staff.department);
    setEditStatus(staff.status);
    setIsEditingStaff(false);
  };

  const handleSaveStaffEdits = () => {
    if (!selectedStaff) return;
    const previousRole = selectedStaff.role;
    const previousStatus = selectedStaff.status;

    setStaffList((prev) =>
      prev.map((s) =>
        s.id === selectedStaff.id
          ? { ...s, role: editRole, department: editDept, status: editStatus }
          : s
      )
    );

    setSelectedStaff({
      ...selectedStaff,
      role: editRole,
      department: editDept,
      status: editStatus,
    });

    setIsEditingStaff(false);

    // Audit log
    const changes: string[] = [];
    if (previousRole !== editRole) changes.push(`Role updated from ${ROLE_LABELS[previousRole]} to ${ROLE_LABELS[editRole]}`);
    if (previousStatus !== editStatus) changes.push(`Status changed to ${editStatus}`);
    addAuditEntry('STAFF_ACCOUNT_UPDATED', selectedStaff.name, changes.join('; '));
  };

  const handleToggleStatus = (targetStatus: 'active' | 'suspended') => {
    if (!selectedStaff) return;
    setStaffList((prev) =>
      prev.map((s) => (s.id === selectedStaff.id ? { ...s, status: targetStatus } : s))
    );
    setSelectedStaff({ ...selectedStaff, status: targetStatus });
    setConfirmStatusModal(null);
    addAuditEntry(
      targetStatus === 'suspended' ? 'ACCOUNT_SUSPENDED' : 'ACCOUNT_REACTIVATED',
      selectedStaff.name,
      `Operational status set to ${targetStatus}`
    );
  };

  const handleProvision = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(inviteEmail.trim())) {
      setInviteError('Please provide a valid institutional email address.');
      return;
    }

    if (staffList.some((s) => s.email.toLowerCase() === inviteEmail.trim().toLowerCase())) {
      setInviteError('An account with this institutional email already exists.');
      return;
    }

    const newStaff: ProvisionedStaff = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      organization: user?.organization || 'MetroHealth System',
      department: inviteDept,
      role: inviteRole,
      status: dispatchSmtp ? 'pending_verification' : 'active',
      lastActive: dispatchSmtp ? 'Never (Invite Sent)' : 'Active (Pre-provisioned)',
      mfaEnabled: false,
      ssoConnected: true,
      provisionedDate: new Date().toISOString().slice(0, 10),
    };

    setStaffList((prev) => [newStaff, ...prev]);
    addAuditEntry(
      'STAFF_PROVISIONED',
      newStaff.name,
      `Assigned role ${ROLE_LABELS[newStaff.role]} in ${newStaff.department}. ${dispatchSmtp ? 'Invitation token generated.' : 'Direct local activation.'}`
    );

    setInviteFeedback(
      dispatchSmtp
        ? `Account initialized. Verification invitation token sent to ${newStaff.email}.`
        : `Staff account created and immediately activated.`
    );

    setInviteName('');
    setInviteEmail('');
    setTimeout(() => {
      setShowInviteModal(false);
      setInviteFeedback(null);
    }, 1800);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setDeptFilter('All Departments');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DF]">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#1B74E4]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Hospital Staff & Role Governance
            </h1>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Authoritative clinical operations account provisioning, least-privilege permission matrices, and administrative security audit trails.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowInviteModal(true)}
            className="h-8 px-3.5 rounded bg-[#1B74E4] hover:bg-[#155EC0] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Provision New Staff</span>
          </button>
        </div>
      </div>

      {/* Staff Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg border border-[#E8E4DF] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6B6B] block">
            Total Staff Accounts
          </span>
          <div className="text-2xl font-bold font-mono text-[#1A1A1A] mt-1">
            {metrics.total}
          </div>
          <span className="text-[10px] text-[#6B6B6B] mt-0.5 block">
            {metrics.active} active in service
          </span>
        </div>

        <div className="p-4 bg-white rounded-lg border border-[#E8E4DF] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6B6B] block">
            Active Accounts
          </span>
          <div className="text-2xl font-bold font-mono text-[#0E7A4E] mt-1">
            {metrics.active}
          </div>
          <span className="text-[10px] text-[#0E7A4E] mt-0.5 block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Verified authorized
          </span>
        </div>

        <div className="p-4 bg-white rounded-lg border border-[#E8E4DF] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6B6B] block">
            Pending Invitations
          </span>
          <div className={`text-2xl font-bold font-mono mt-1 ${metrics.pending > 0 ? 'text-[#B54708]' : 'text-[#6B6B6B]'}`}>
            {metrics.pending}
          </div>
          <span className="text-[10px] text-[#6B6B6B] mt-0.5 block">
            Awaiting email claim
          </span>
        </div>

        <div className="p-4 bg-white rounded-lg border border-[#E8E4DF] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6B6B] block">
            Suspended Accounts
          </span>
          <div className={`text-2xl font-bold font-mono mt-1 ${metrics.suspended > 0 ? 'text-[#B42318]' : 'text-[#6B6B6B]'}`}>
            {metrics.suspended}
          </div>
          <span className="text-[10px] text-[#6B6B6B] mt-0.5 block">
            Access revoked
          </span>
        </div>
      </div>

      {/* Navigation View Switcher Tabs */}
      <div className="flex border-b border-[#E8E4DF] text-xs">
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'staff'
              ? 'border-[#1B74E4] text-[#1B74E4]'
              : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Directory ({staffList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'matrix'
              ? 'border-[#1B74E4] text-[#1B74E4]'
              : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Role Permissions Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-[#1B74E4] text-[#1B74E4]'
              : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Administrative Audit Log ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: STAFF DIRECTORY & GOVERNANCE */}
      {activeTab === 'staff' && (
        <div className="bg-white border border-[#E8E4DF] rounded-lg overflow-hidden space-y-4 p-5 shadow-sm">
          {/* Search & Filters Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Text Search */}
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search staff name, email, department, or role..."
                  className="w-full h-8 px-3 pl-8 rounded border border-[#E8E4DF] bg-[#FAFAF8] text-xs text-[#1A1A1A] focus:border-[#1B74E4] focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-[#6B6B6B] absolute left-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-8 px-2.5 rounded border border-[#E8E4DF] bg-[#FAFAF8] text-xs text-[#1A1A1A] focus:border-[#1B74E4] focus:outline-none"
              >
                <option value="all">All Operational Roles</option>
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>

              {/* Department Filter */}
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="h-8 px-2.5 rounded border border-[#E8E4DF] bg-[#FAFAF8] text-xs text-[#1A1A1A] focus:border-[#1B74E4] focus:outline-none"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 px-2.5 rounded border border-[#E8E4DF] bg-[#FAFAF8] text-xs text-[#1A1A1A] focus:border-[#1B74E4] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="suspended">Suspended Only</option>
              </select>

              {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || deptFilter !== 'All Departments') && (
                <button
                  onClick={handleResetFilters}
                  className="h-8 px-2.5 rounded text-xs text-[#6B6B6B] hover:text-[#1A1A1A] bg-[#FAFAF8] border border-[#E8E4DF] flex items-center gap-1 transition-colors"
                  title="Clear all active filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <span className="text-xs text-[#6B6B6B] shrink-0 font-medium">
              Showing <strong>{filteredStaff.length}</strong> of {staffList.length} staff records
            </span>
          </div>

          {/* Table */}
          {filteredStaff.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6B6B6B] space-y-2">
              <Search className="w-8 h-8 text-[#6B6B6B]/40 mx-auto" />
              <p className="font-semibold text-[#1A1A1A]">No staff members matched your filter criteria.</p>
              <button
                onClick={handleResetFilters}
                className="text-[#1B74E4] hover:underline font-semibold"
              >
                Clear all filters and show all accounts
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#E8E4DF] rounded-lg">
              <table className="w-full text-xs text-left text-[#1A1A1A]">
                <thead className="bg-[#FAFAF8] text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] border-b border-[#E8E4DF]">
                  <tr>
                    <th className="px-4 py-3">Staff Personnel</th>
                    <th className="px-4 py-3">Assigned Operational Role</th>
                    <th className="px-4 py-3">Unit / Department</th>
                    <th className="px-4 py-3">Security & Auth</th>
                    <th className="px-4 py-3">Account Status</th>
                    <th className="px-4 py-3 text-right">Last Session</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DF]">
                  {filteredStaff.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => handleOpenStaffDetails(s)}
                      className="hover:bg-[#FAFAF8] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#1A1A1A]">{s.name}</div>
                        <div className="text-[11px] text-[#6B6B6B]">{s.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-[#1B74E4] bg-[#EAF4FF] px-2 py-0.5 rounded border border-[#B2DDFF] text-[11px]">
                          {ROLE_LABELS[s.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#6B6B6B] font-medium">{s.department}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {s.mfaEnabled ? (
                            <span className="text-[#0E7A4E] flex items-center gap-1" title="MFA Enforced">
                              <Lock className="w-3 h-3" /> MFA
                            </span>
                          ) : (
                            <span className="text-[#6B6B6B]" title="MFA Optional">Password</span>
                          )}
                          <span className="text-[#6B6B6B]">·</span>
                          <span className="text-[#1B74E4]" title="SSO Active">SSO</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {s.status === 'active' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#ECFDF3] text-[#0E7A4E] border border-[#A6F4C5]">
                            Active
                          </span>
                        ) : s.status === 'pending_verification' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]">
                            Pending Invite
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]">
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-[#6B6B6B] font-mono">{s.lastActive}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenStaffDetails(s);
                          }}
                          className="px-2.5 py-1 rounded bg-white hover:bg-[#FAFAF8] text-[#1B74E4] border border-[#E8E4DF] text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ROLE PERMISSIONS MATRIX */}
      {activeTab === 'matrix' && (
        <div className="bg-white border border-[#E8E4DF] rounded-lg p-6 shadow-sm space-y-5">
          <div className="pb-3 border-b border-[#E8E4DF]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
              <Key className="w-4 h-4 text-[#1B74E4]" />
              Role-Based Access Control (RBAC) Entitlement Matrix
            </h2>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Enforced centrally through <code className="font-mono text-[#1B74E4]">ROLE_CAPABILITIES</code>. Backend API access tokens and frontend operational lenses mirror these boundaries.
            </p>
          </div>

          <div className="overflow-x-auto border border-[#E8E4DF] rounded-lg">
            <table className="w-full text-xs text-left text-[#1A1A1A]">
              <thead className="bg-[#FAFAF8] text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] border-b border-[#E8E4DF]">
                <tr>
                  <th className="px-4 py-3 min-w-[240px]">Operational Capability</th>
                  <th className="px-3 py-3 text-center">Hospital Admin</th>
                  <th className="px-3 py-3 text-center">ED Manager</th>
                  <th className="px-3 py-3 text-center">Clinician (MD)</th>
                  <th className="px-3 py-3 text-center">Nurse Ops</th>
                  <th className="px-3 py-3 text-center">Analyst</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DF]">
                {(Object.keys(CAPABILITY_LABELS) as Capability[]).map((cap) => {
                  const meta = CAPABILITY_LABELS[cap];
                  return (
                    <tr key={cap} className="hover:bg-[#FAFAF8]">
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-[#1A1A1A]">{meta.label}</div>
                        <div className="text-[10px] font-mono text-[#6B6B6B]">{cap}</div>
                      </td>
                      {(['hospital_admin', 'ed_manager', 'clinician', 'nurse_ops', 'analyst'] as UserRole[]).map((r) => {
                        const isGranted = ROLE_CAPABILITIES[r].includes(cap);
                        return (
                          <td key={r} className="px-3 py-2.5 text-center">
                            {isGranted ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#ECFDF3] text-[#0E7A4E] border border-[#A6F4C5] mx-auto">
                                <Check className="w-3 h-3" />
                              </span>
                            ) : (
                              <span className="text-[#6B6B6B]/40 font-mono">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#FAFAF8] border border-[#E8E4DF] rounded-md text-[11px] text-[#6B6B6B] flex items-center justify-between">
            <span><strong>Least-Privilege Standard:</strong> Capabilities adhere to clinical and operational need-to-know access boundaries.</span>
            <span className="font-mono text-[#1A1A1A]">Source: src/auth/roles.ts</span>
          </div>
        </div>
      )}

      {/* TAB 3: ADMINISTRATIVE AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-[#E8E4DF] rounded-lg p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-[#E8E4DF] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                <History className="w-4 h-4 text-[#1B74E4]" />
                Administrative Session Security Audit Trail
              </h2>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                Immutable in-session audit log capturing staff provisioning, role reassignments, and security status alterations.
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#6B6B6B] bg-[#FAFAF8] border border-[#E8E4DF] px-2 py-1 rounded">
              {auditLogs.length} events logged
            </span>
          </div>

          <div className="overflow-x-auto border border-[#E8E4DF] rounded-lg">
            <table className="w-full text-xs text-left text-[#1A1A1A]">
              <thead className="bg-[#FAFAF8] text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] border-b border-[#E8E4DF]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Administrative Actor</th>
                  <th className="px-4 py-3">Action Type</th>
                  <th className="px-4 py-3">Target Subject</th>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DF]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAFAF8]">
                    <td className="px-4 py-3 font-mono text-[#6B6B6B] whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{log.actor}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[#1B74E4] font-semibold">{log.action}</td>
                    <td className="px-4 py-3 font-medium text-[#1A1A1A]">{log.target}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#ECFDF3] text-[#0E7A4E] border border-[#A6F4C5]">
                        {log.outcome}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#4A4A4A]">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STAFF DETAIL & ACCESS GOVERNANCE DRAWER */}
      {selectedStaff && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end"
        >
          <div className="bg-white border-l border-[#E8E4DF] w-full max-w-lg h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#EAF4FF] text-[#1B74E4] font-bold flex items-center justify-center">
                    {selectedStaff.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1A1A1A]">{selectedStaff.name}</h2>
                    <p className="text-[11px] text-[#6B6B6B]">{selectedStaff.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStaff(null)}
                  className="p-1 rounded text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#FAFAF8]"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status and Summary Tag */}
              <div className="flex items-center justify-between p-3 bg-[#FAFAF8] rounded-lg border border-[#E8E4DF] text-xs">
                <div>
                  <span className="text-[10px] text-[#6B6B6B] uppercase font-bold block">Account Status</span>
                  <span className="font-bold text-[#1A1A1A] capitalize">{selectedStaff.status.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B6B6B] uppercase font-bold block">Staff ID</span>
                  <span className="font-mono text-[#6B6B6B]">{selectedStaff.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B6B6B] uppercase font-bold block">Provisioned</span>
                  <span className="font-mono text-[#6B6B6B]">{selectedStaff.provisionedDate}</span>
                </div>
              </div>

              {/* Account Details / Editing Form */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-[#E8E4DF]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                    Credential & Operational Lens Assignment
                  </span>
                  {!isEditingStaff ? (
                    <button
                      onClick={() => setIsEditingStaff(true)}
                      className="text-xs font-semibold text-[#1B74E4] hover:underline flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Assignment</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditingStaff(false)}
                      className="text-xs text-[#6B6B6B] hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {!isEditingStaff ? (
                  <div className="divide-y divide-[#E8E4DF] text-xs">
                    <div className="py-2.5 flex justify-between">
                      <span className="text-[#6B6B6B]">Assigned Operational Role</span>
                      <strong className="text-[#1B74E4]">{ROLE_LABELS[selectedStaff.role]}</strong>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-[#6B6B6B]">Unit / Department</span>
                      <span className="font-semibold text-[#1A1A1A]">{selectedStaff.department}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-[#6B6B6B]">Institutional Organization</span>
                      <span className="text-[#1A1A1A]">{selectedStaff.organization}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-[#6B6B6B]">Multi-Factor Authentication (MFA)</span>
                      <span className={selectedStaff.mfaEnabled ? 'text-[#0E7A4E] font-semibold' : 'text-[#B54708]'}>
                        {selectedStaff.mfaEnabled ? 'Enforced' : 'Optional / Password'}
                      </span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-[#6B6B6B]">Single Sign-On (SSO) Status</span>
                      <span className="text-[#0E7A4E] font-semibold">Active Federated Token</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 bg-[#FAFAF8] rounded-lg border border-[#E8E4DF] text-xs">
                    <div>
                      <label className="block font-bold text-[#1A1A1A] mb-1">Operational Role</label>
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as UserRole)}
                        className="w-full h-8 px-2 rounded border border-[#E8E4DF] bg-white text-xs text-[#1A1A1A] focus:border-[#1B74E4] focus:outline-none"
                      >
                        {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-[#6B6B6B] mt-1">{ROLE_DESCRIPTIONS[editRole]}</p>
                    </div>

                    <div>
                      <label className="block font-bold text-[#1A1A1A] mb-1">Unit / Department</label>
                      <select
                        value={editDept}
                        onChange={(e) => setEditDept(e.target.value)}
                        className="w-full h-8 px-2 rounded border border-[#E8E4DF] bg-white text-xs text-[#1A1A1A] focus:border-[#1B74E4] focus:outline-none"
                      >
                        {DEPARTMENTS.filter((d) => d !== 'All Departments').map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditingStaff(false)}
                        className="px-3 py-1.5 rounded bg-white border border-[#E8E4DF] text-[#6B6B6B] hover:text-[#1A1A1A]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveStaffEdits}
                        className="px-3.5 py-1.5 rounded bg-[#1B74E4] text-white font-bold hover:bg-[#155EC0]"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Permitted Role Capabilities Preview */}
              <div className="p-3 bg-[#EFF8FF] border border-[#B2DDFF] rounded-lg text-xs text-[#175CD3] space-y-2">
                <span className="font-bold text-[11px] block">
                  Active Capabilities Granted to {ROLE_LABELS[selectedStaff.role]}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_CAPABILITIES[selectedStaff.role].map((cap) => (
                    <span
                      key={cap}
                      className="px-2 py-0.5 rounded bg-white text-[#175CD3] border border-[#B2DDFF] text-[10px] font-medium"
                    >
                      {CAPABILITY_LABELS[cap]?.label || cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sensitive Account Access Actions */}
              <div className="pt-4 border-t border-[#E8E4DF] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] block">
                  Security & Access Control Actions
                </span>

                {selectedStaff.status === 'suspended' ? (
                  <button
                    onClick={() => handleToggleStatus('active')}
                    className="w-full py-2 px-3 rounded bg-[#ECFDF3] hover:bg-[#D1FADF] text-[#0E7A4E] border border-[#A6F4C5] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Reactivate Staff Account</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmStatusModal('suspend')}
                    className="w-full py-2 px-3 rounded bg-white hover:bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Suspend Operational Access</span>
                  </button>
                )}
              </div>
            </div>

            {/* Confirmation Dialog Overlay */}
            {confirmStatusModal && (
              <div className="p-4 bg-[#FEF3F2] border border-[#FECDCA] rounded-lg text-xs text-[#B42318] space-y-2 mt-4">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-[#D92D20]" />
                  <span>Confirm Account Suspension</span>
                </div>
                <p className="text-[11px] text-[#7A3E08]">
                  Are you sure you want to suspend access for <strong>{selectedStaff.name}</strong>? This user will be immediately locked out of all operational modules.
                </p>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setConfirmStatusModal(null)}
                    className="px-2.5 py-1 rounded bg-white border border-[#E8E4DF] text-[#6B6B6B] hover:text-[#1A1A1A]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleToggleStatus('suspended')}
                    className="px-3 py-1 rounded bg-[#D92D20] text-white font-bold hover:bg-[#B42318]"
                  >
                    Confirm Suspension
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROVISION NEW STAFF MODAL */}
      {showInviteModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#E8E4DF] rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#1B74E4]" />
                <h2 className="text-sm font-bold text-[#1A1A1A]">
                  Provision Emergency Staff Account
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteError(null);
                  setInviteFeedback(null);
                }}
                className="text-xs text-[#6B6B6B] hover:text-[#1A1A1A]"
              >
                ✕
              </button>
            </div>

            {inviteFeedback && (
              <div className="p-3 bg-[#ECFDF3] border border-[#A6F4C5] text-[#0E7A4E] text-xs rounded-md flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{inviteFeedback}</span>
              </div>
            )}

            {inviteError && (
              <div className="p-3 bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] text-xs rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleProvision} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">
                  Full Name & Clinical Credentials
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Rachel Adams, RN, BSN"
                  className="w-full h-8 px-3 rounded border border-[#E8E4DF] bg-[#FAFAF8] focus:border-[#1B74E4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">
                  Institutional Hospital Email
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="rachel.adams@metrohealth.demo"
                  className="w-full h-8 px-3 rounded border border-[#E8E4DF] bg-[#FAFAF8] focus:border-[#1B74E4] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">
                    Unit / Department
                  </label>
                  <select
                    value={inviteDept}
                    onChange={(e) => setInviteDept(e.target.value)}
                    className="w-full h-8 px-2 rounded border border-[#E8E4DF] bg-[#FAFAF8] focus:border-[#1B74E4] focus:outline-none"
                  >
                    {DEPARTMENTS.filter((d) => d !== 'All Departments').map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">
                    Operational Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="w-full h-8 px-2 rounded border border-[#E8E4DF] bg-[#FAFAF8] focus:border-[#1B74E4] focus:outline-none"
                  >
                    {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-[#FAFAF8] rounded border border-[#E8E4DF] space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[#6B6B6B] block">Role Capabilities:</span>
                <p className="text-[11px] text-[#4A4A4A] leading-snug">
                  {ROLE_DESCRIPTIONS[inviteRole]}
                </p>
              </div>

              {/* Delivery mode */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="smtp-dispatch"
                  checked={dispatchSmtp}
                  onChange={(e) => setDispatchSmtp(e.target.checked)}
                  className="accent-[#1B74E4]"
                />
                <label htmlFor="smtp-dispatch" className="text-[11px] text-[#4A4A4A]">
                  Dispatch verification token via institutional mock SMTP relay
                </label>
              </div>

              <div className="pt-3 border-t border-[#E8E4DF] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="h-8 px-3 rounded border border-[#E8E4DF] bg-white text-[#6B6B6B] hover:text-[#1A1A1A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded bg-[#1B74E4] hover:bg-[#155EC0] text-white font-bold shadow-sm"
                >
                  Authorize & Provision Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
