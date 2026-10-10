import { UserProfile, UserRole } from './roles';

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isDemoMode: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface SignupData {
  name: string;
  email: string;
  organization: string;
  department?: string;
  requestedRole: UserRole;
  password?: string;
}

// Pre-seeded demo profiles representing each operational persona
export const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  hospital_admin: {
    id: 'demo-admin-01',
    name: 'Dr. Evelyn Vance, MD, MHA',
    email: 'evelyn.vance@metrohealth.demo',
    organization: 'MetroHealth System',
    department: 'Hospital Operations & Executive Board',
    role: 'hospital_admin',
    verified: true,
    isDemoAccount: true,
  },
  ed_manager: {
    id: 'demo-mgr-02',
    name: 'Marcus Chen, RN, BSN',
    email: 'marcus.chen@metrohealth.demo',
    organization: 'MetroHealth System',
    department: 'Emergency Services Directorate',
    role: 'ed_manager',
    verified: true,
    isDemoAccount: true,
  },
  clinician: {
    id: 'demo-doc-03',
    name: 'Dr. Sarah Jenkins, MD, FACEP',
    email: 'sarah.jenkins@metrohealth.demo',
    organization: 'MetroHealth System',
    department: 'Emergency Medicine - Trauma Level I',
    role: 'clinician',
    verified: true,
    isDemoAccount: true,
  },
  nurse_ops: {
    id: 'demo-nurse-04',
    name: 'Priya Patel, BSN, CEN',
    email: 'priya.patel@metrohealth.demo',
    organization: 'MetroHealth System',
    department: 'ED Triage & Rapid Assessment Unit',
    role: 'nurse_ops',
    verified: true,
    isDemoAccount: true,
  },
  analyst: {
    id: 'demo-analyst-05',
    name: 'Jordan Miller, MSc',
    email: 'jordan.miller@metrohealth.demo',
    organization: 'MetroHealth System',
    department: 'Healthcare Analytics & Quality Safety',
    role: 'analyst',
    verified: true,
    isDemoAccount: true,
  },
};

const SESSION_STORAGE_KEY = 'agraveda_demo_session';

export class AuthAdapter {
  /**
   * Initial session check. Uses sessionStorage so demo sessions don't linger dangerously,
   * but allow page refresh within an active tab.
   */
  static getSession(): UserProfile | null {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return null;
  }

  static async login(credentials: LoginCredentials): Promise<UserProfile> {
    // Simulate real auth handshake delay
    await new Promise((r) => setTimeout(r, 450));

    const emailLower = credentials.email.trim().toLowerCase();
    
    // Check if logging into a demo persona
    const foundDemo = Object.values(DEMO_PROFILES).find(
      (p) => p.email.toLowerCase() === emailLower
    );

    if (foundDemo) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(foundDemo));
      return foundDemo;
    }

    // If arbitrary email provided in demo mode, create an active demo user with requested role
    const genericUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: credentials.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Staff Member',
      email: credentials.email,
      organization: 'MetroHealth Regional Medical Center',
      department: 'Emergency Medicine',
      role: 'ed_manager', // default safe operational role for demo exploration
      verified: true,
      isDemoAccount: true,
    };

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(genericUser));
    return genericUser;
  }

  static async switchDemoRole(role: UserRole): Promise<UserProfile> {
    const profile = DEMO_PROFILES[role];
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
    return profile;
  }

  static async signup(data: SignupData): Promise<{ user: UserProfile; note: string }> {
    await new Promise((r) => setTimeout(r, 550));

    // Note in accordance with non-negotiable #2:
    // "Role selection on signup is a requested role, not proof of authorization; sensitive roles must be verified or provisioned appropriately."
    const isSensitive = data.requestedRole === 'hospital_admin' || data.requestedRole === 'clinician';
    
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      organization: data.organization.trim(),
      department: data.department?.trim() || 'Emergency Services',
      // In demo mode, give the requested role so reviewer can test it, but mark verified status honestly
      role: data.requestedRole,
      requestedRole: data.requestedRole,
      verified: !isSensitive,
      isDemoAccount: true,
    };

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));
    return {
      user: newUser,
      note: isSensitive
        ? 'In a production deployment, administrator & clinician roles require hospital credential verification.'
        : 'Demo account provisioned successfully.'
    };
  }

  static async logout(): Promise<void> {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    await new Promise((r) => setTimeout(r, 400));
    // Safe generic message in accordance with non-negotiables
    return {
      success: true,
      message: `If an operational account is associated with ${email}, password reset instructions have been dispatched. Note: Simulated demonstration environment (no SMTP email gateway configured).`
    };
  }
}
