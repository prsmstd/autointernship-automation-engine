// Mock Authentication System for Testing
// This replaces Supabase auth during development/testing

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'A' | 'S'; // Admin or Student
  student_id?: string;
  domain_id?: number;
}

export interface MockAuthResponse {
  success: boolean;
  user?: MockUser;
  error?: string;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

// Mock user database
const MOCK_USERS: MockUser[] = [
  {
    id: 'admin-uuid-1',
    email: 'admin@prismstudio.co.in',
    name: 'System Administrator',
    role: 'A'
  },
  {
    id: 'student-uuid-1', 
    email: 'student@example.com',
    name: 'Test Student',
    role: 'S',
    student_id: 'PS2501DS001',
    domain_id: 1
  }
];

// Mock passwords (in real app, these would be hashed)
const MOCK_PASSWORDS: Record<string, string> = {
  'admin@prismstudio.co.in': 'Admin@123',
  'student@example.com': 'student123'
};

export class MockAuthService {
  private static instance: MockAuthService;
  private currentUser: MockUser | null = null;
  private sessionToken: string | null = null;

  static getInstance(): MockAuthService {
    if (!MockAuthService.instance) {
      MockAuthService.instance = new MockAuthService();
    }
    return MockAuthService.instance;
  }

  // Mock login
  async signIn(email: string, password: string): Promise<MockAuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = MOCK_USERS.find(u => u.email === email);
    const expectedPassword = MOCK_PASSWORDS[email];

    if (!user || password !== expectedPassword) {
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }

    // Generate mock session
    const sessionToken = `mock-token-${Date.now()}`;
    const session = {
      access_token: sessionToken,
      refresh_token: `refresh-${sessionToken}`,
      expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };

    this.currentUser = user;
    this.sessionToken = sessionToken;

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('mock-auth-user', JSON.stringify(user));
      localStorage.setItem('mock-auth-session', JSON.stringify(session));
    }

    return {
      success: true,
      user,
      session
    };
  }

  // Mock logout
  async signOut(): Promise<void> {
    this.currentUser = null;
    this.sessionToken = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock-auth-user');
      localStorage.removeItem('mock-auth-session');
    }
  }

  // Get current user
  getCurrentUser(): MockUser | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to restore from localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('mock-auth-user');
      const storedSession = localStorage.getItem('mock-auth-session');
      
      if (storedUser && storedSession) {
        const user = JSON.parse(storedUser);
        const session = JSON.parse(storedSession);
        
        // Check if session is still valid
        if (session.expires_at > Date.now()) {
          this.currentUser = user;
          this.sessionToken = session.access_token;
          return user;
        }
      }
    }

    return null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'A';
  }

  // Mock session check
  async getSession(): Promise<{ user: MockUser | null; session: any | null }> {
    const user = this.getCurrentUser();
    
    if (user && typeof window !== 'undefined') {
      const storedSession = localStorage.getItem('mock-auth-session');
      const session = storedSession ? JSON.parse(storedSession) : null;
      
      return { user, session };
    }

    return { user: null, session: null };
  }

  // Mock user registration
  async signUp(email: string, password: string, name: string): Promise<MockAuthResponse> {
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === email);
    if (existingUser) {
      return {
        success: false,
        error: 'User already exists'
      };
    }

    // Create new user
    const newUser: MockUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      role: 'S', // Default to student
      student_id: `PS${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}DS${String(MOCK_USERS.length + 1).padStart(3, '0')}`
    };

    // Add to mock database
    MOCK_USERS.push(newUser);
    MOCK_PASSWORDS[email] = password;

    return {
      success: true,
      user: newUser
    };
  }
}

// Export singleton instance
export const mockAuth = MockAuthService.getInstance();

// Helper function to determine if we should use mock auth
export function shouldUseMockAuth(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !supabaseUrl || supabaseUrl.includes('mock') || supabaseUrl.includes('localhost');
}