// Unified Authentication Service
// Automatically switches between mock and real Supabase based on environment

import { mockAuth, shouldUseMockAuth, type MockUser, type MockAuthResponse } from './mock-auth';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'A' | 'S';
  student_id?: string;
  domain_id?: number;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
  session?: any;
}

class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    if (shouldUseMockAuth()) {
      console.log('🔧 Using mock authentication');
      return await mockAuth.signIn(email, password);
    }

    // Real Supabase authentication would go here
    console.log('🔧 Using real Supabase authentication');
    try {
      // TODO: Implement real Supabase auth
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      if (data.user) {
        // Fetch user profile via API to bypass RLS issues
        const profileResponse = await fetch(`/api/auth/profile?email=${encodeURIComponent(email)}`);
        const profileData = await profileResponse.json();
        const profile = profileData.profile;

        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email!,
          name: profile?.name || 'User',
          role: profile?.role || 'S',
          student_id: profile?.student_id,
          domain_id: profile?.domain_id
        };

        // Store user in localStorage for getCurrentUser()
        localStorage.setItem('auth_user', JSON.stringify(user));

        return {
          success: true,
          user,
          session: data.session
        };
      }

      return {
        success: false,
        error: 'Authentication failed'
      };
    } catch (error) {
      console.error('Supabase auth error:', error);
      return {
        success: false,
        error: 'Authentication service unavailable'
      };
    }
  }

  async signOut(): Promise<void> {
    if (shouldUseMockAuth()) {
      await mockAuth.signOut();
      return;
    }

    // Real Supabase signout
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await supabase.auth.signOut();
      
      // Clear stored user
      localStorage.removeItem('auth_user');
    } catch (error) {
      console.error('Signout error:', error);
    }
  }

  getCurrentUser(): AuthUser | null {
    if (shouldUseMockAuth()) {
      return mockAuth.getCurrentUser();
    }

    // For real Supabase, try to get user from localStorage/sessionStorage
    try {
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error getting stored user:', error);
    }

    return null;
  }

  async getSession(): Promise<{ user: AuthUser | null; session: any | null }> {
    if (shouldUseMockAuth()) {
      return await mockAuth.getSession();
    }

    // Real Supabase session check
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single();

        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          name: profile?.name || 'User',
          role: profile?.role || 'S',
          student_id: profile?.student_id,
          domain_id: profile?.domain_id
        };

        return { user, session };
      }

      return { user: null, session: null };
    } catch (error) {
      console.error('Session check error:', error);
      return { user: null, session: null };
    }
  }

  isAuthenticated(): boolean {
    if (shouldUseMockAuth()) {
      return mockAuth.isAuthenticated();
    }

    // For real implementation, this would need to check session
    return false;
  }

  isAdmin(): boolean {
    if (shouldUseMockAuth()) {
      return mockAuth.isAdmin();
    }

    const user = this.getCurrentUser();
    return user?.role === 'A';
  }

  async signUp(email: string, password: string, name: string): Promise<AuthResponse> {
    if (shouldUseMockAuth()) {
      return await mockAuth.signUp(email, password, name);
    }

    // Real Supabase signup would go here
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      // Create user profile
      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          email,
          name,
          role: 'S'
        });

        const user: AuthUser = {
          id: data.user.id,
          email,
          name,
          role: 'S'
        };

        return {
          success: true,
          user,
          session: data.session
        };
      }

      return {
        success: false,
        error: 'Registration failed'
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: 'Registration service unavailable'
      };
    }
  }

  async signInWithOAuth(provider: 'google'): Promise<{ error: string | null }> {
    if (shouldUseMockAuth()) {
      // Mock OAuth - just return error for now
      return {
        error: 'OAuth not available in mock mode. Use email/password login.'
      };
    }

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('OAuth error:', error);
      return { error: 'OAuth service unavailable' };
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Helper hook for React components
export function useAuth() {
  return {
    signIn: authService.signIn.bind(authService),
    signOut: authService.signOut.bind(authService),
    signUp: authService.signUp.bind(authService),
    getCurrentUser: authService.getCurrentUser.bind(authService),
    getSession: authService.getSession.bind(authService),
    isAuthenticated: authService.isAuthenticated.bind(authService),
    isAdmin: authService.isAdmin.bind(authService)
  };
}