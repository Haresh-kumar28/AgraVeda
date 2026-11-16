
import { UserProfile, UserRole } from './roles';
import { supabase } from '../lib/supabase';

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

export interface SignupResult {
  user: UserProfile | null;
  note: string;
  requiresEmailConfirmation: boolean;
}

const VALID_ROLES: UserRole[] = [
  'hospital_admin',
  'ed_manager',
  'clinician',
  'nurse_ops',
  'analyst',
];

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

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function getDemoSession(): UserProfile | null {
  if (!isBrowser()) return null;

  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;

    const profile = JSON.parse(stored) as UserProfile;

    return (
      Object.values(DEMO_PROFILES).find(
        (item) => item.id === profile.id && item.role === profile.role
      ) ?? null
    );
  } catch {
    return null;
  }
}

async function getSupabaseProfile(
  userId: string,
  email: string
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, organization, department, role, verified')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new Error(
      'Your account profile could not be loaded. Please contact your administrator.'
    );
  }

  if (!VALID_ROLES.includes(data.role as UserRole)) {
    throw new Error('Your account has an invalid role configuration.');
  }

  return {
    id: data.id,
    name: data.full_name || 'Staff Member',
    email,
    organization: data.organization || '',
    department: data.department || 'Emergency Services',
    role: data.role as UserRole,
    verified: data.verified,
    isDemoAccount: false,
  };
}

export class AuthAdapter {
  static getSession(): UserProfile | null {
    return getDemoSession();
  }

  static async getRealSession(): Promise<UserProfile | null> {
    if (getDemoSession()) return null;

    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session?.user) return null;

    try {
      return await getSupabaseProfile(
        data.session.user.id,
        data.session.user.email ?? ''
      );
    } catch {
      await supabase.auth.signOut();
      return null;
    }
  }

  static async login(
    credentials: LoginCredentials
  ): Promise<UserProfile> {
    const email = credentials.email.trim().toLowerCase();

    if (!email) {
      throw new Error('Please enter your email address.');
    }

    const demoProfile = Object.values(DEMO_PROFILES).find(
      (profile) => profile.email.toLowerCase() === email
    );

    if (demoProfile) {
      if (isBrowser()) {
        await supabase.auth.signOut();
        sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify(demoProfile)
        );
      }
      return demoProfile;
    }

    if (!credentials.password) {
      throw new Error('Please enter your password.');
    }

    if (isBrowser()) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: credentials.password,
    });

    if (error || !data.user) {
      throw new Error(error?.message || 'Invalid email or password.');
    }

    try {
      return await getSupabaseProfile(
        data.user.id,
        data.user.email ?? email
      );
    } catch (profileError) {
      await supabase.auth.signOut();
      throw profileError;
    }
  }

  static async switchDemoRole(role: UserRole): Promise<UserProfile> {
    const profile = DEMO_PROFILES[role];

    if (!profile) {
      throw new Error('Unknown demo profile.');
    }

    await supabase.auth.signOut();

    if (isBrowser()) {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(profile)
      );
    }

    return profile;
  }

  static async signup(data: SignupData): Promise<SignupResult> {
    const email = data.email.trim().toLowerCase();
    const password = data.password;

    if (!data.name.trim()) {
      throw new Error('Please enter your name.');
    }

    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    if (password.length < 8) {
      throw new Error('Your password must be at least 8 characters.');
    }

    if (
      Object.values(DEMO_PROFILES).some(
        (profile) => profile.email.toLowerCase() === email
      )
    ) {
      throw new Error('This email is reserved for a demo profile.');
    }

    const { data: result, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: data.name.trim(),
          organization: data.organization.trim(),
          department: data.department?.trim() || 'Emergency Services',
          requested_role: data.requestedRole,
        },
      },
    });

    if (error) throw new Error(error.message);

    if (!result.user) {
      throw new Error('Signup did not return a user. Please try again.');
    }

    if (!result.session) {
      return {
        user: null,
        requiresEmailConfirmation: true,
        note:
          'Your registration was submitted. Check your email for a confirmation link. After confirming your email, return here and sign in. Your initial role is Analyst pending authorization.',
      };
    }

    const profile = await getSupabaseProfile(
      result.user.id,
      result.user.email ?? email
    );

    return {
      user: profile,
      requiresEmailConfirmation: false,
      note:
        'Account created. Your initial role is Analyst pending authorization.',
    };
  }

  static async logout(): Promise<void> {
    if (isBrowser()) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error('Could not sign out of your Supabase account.');
    }
  }

  static async requestPasswordReset(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error('Please enter your email address.');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) throw new Error(error.message);

    return {
      success: true,
      message:
        'If an account exists for this email, password reset instructions will be sent. Check your inbox.',
    };
  }
}
