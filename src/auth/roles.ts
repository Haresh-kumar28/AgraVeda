export type UserRole =
  | 'hospital_admin'
  | 'ed_manager'
  | 'clinician'
  | 'nurse_ops'
  | 'analyst';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  organization: string;
  department: string;
  role: UserRole;
  requestedRole?: UserRole;
  verified: boolean;
  isDemoAccount?: boolean;
}

export type Capability =
  | 'view_command_center'
  | 'view_forecasts'
  | 'edit_simulation_inputs'
  | 'view_patient_flow'
  | 'view_resources'
  | 'view_scenarios'
  | 'simulate_what_if'
  | 'view_decisions'
  | 'acknowledge_decisions'
  | 'view_data_quality'
  | 'manage_organization'
  | 'manage_users';

export const ROLE_LABELS: Record<UserRole, string> = {
  hospital_admin: 'Hospital Administrator',
  ed_manager: 'Emergency Department Manager',
  clinician: 'Doctor / Clinical Staff',
  nurse_ops: 'Nurse / Operations Staff',
  analyst: 'Analyst (Read-Only)',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  hospital_admin: 'Organization-wide administrative access, user provisioning, security oversight, and operational insights.',
  ed_manager: 'Operational lead for ED flow, staffing capacity, forecasts, what-if planning, and decision support.',
  clinician: 'Attending doctors and clinical staff monitoring acute ED load, patient journey constrictions, and decision briefs.',
  nurse_ops: 'Nurse supervisors and charge nurses managing active area throughput and operational flow.',
  analyst: 'Read-only access to retrospective data, forecasts, data quality diagnostics, and modeling scenarios.',
};

export const ROLE_CAPABILITIES: Record<UserRole, Capability[]> = {
  hospital_admin: [
    'view_command_center',
    'view_forecasts',
    'edit_simulation_inputs',
    'view_patient_flow',
    'view_resources',
    'view_scenarios',
    'simulate_what_if',
    'view_decisions',
    'acknowledge_decisions',
    'view_data_quality',
    'manage_organization',
    'manage_users',
  ],
  ed_manager: [
    'view_command_center',
    'view_forecasts',
    'edit_simulation_inputs',
    'view_patient_flow',
    'view_resources',
    'view_scenarios',
    'simulate_what_if',
    'view_decisions',
    'acknowledge_decisions',
    'view_data_quality',
  ],
  clinician: [
    'view_command_center',
    'view_forecasts',
    'view_patient_flow',
    'view_resources',
    'view_scenarios',
    'simulate_what_if',
    'view_decisions',
  ],
  nurse_ops: [
    'view_command_center',
    'view_forecasts',
    'edit_simulation_inputs',
    'view_patient_flow',
    'view_resources',
    'view_scenarios',
    'view_decisions',
  ],
  analyst: [
    'view_command_center',
    'view_forecasts',
    'view_patient_flow',
    'view_resources',
    'view_scenarios',
    'simulate_what_if',
    'view_decisions',
    'view_data_quality',
  ],
};

/**
 * Centrally check permissions across the application.
 */
export function can(role: UserRole | undefined, capability: Capability): boolean {
  if (!role) return false;
  const capabilities = ROLE_CAPABILITIES[role] || [];
  return capabilities.includes(capability);
}
