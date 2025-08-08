// Ultra-simple authentication service
export interface User {
    id: string
    email: string
    name: string
    role: 'student' | 'admin'
}

export interface AuthResult {
    user: User | null
    error: string | null
}

class SimpleAuthService {
    // Demo users - no external dependencies
    private demoUsers: (User & { password: string })[] = [
        {
            id: 'student-1',
            email: 'student@demo.com',
            password: 'demo123',
            name: 'Demo Student',
            role: 'student'
        },
        {
            id: 'admin-1',
            email: 'admin@demo.com',
            password: 'admin123',
            name: 'Demo Admin',
            role: 'admin'
        }
    ]

    // Login method
    async login(email: string, password: string): Promise<AuthResult> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))

        const user = this.demoUsers.find(u => u.email === email && u.password === password)

        if (!user) {
            return {
                user: null,
                error: 'Invalid email or password. Try: student@demo.com / demo123'
            }
        }

        // Store in localStorage for persistence
        const userWithoutPassword = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }

        if (typeof window !== 'undefined') {
            localStorage.setItem('auth-user', JSON.stringify(userWithoutPassword))
            // Also set a simple cookie for middleware
            document.cookie = `auth-token=${user.id}; path=/; max-age=86400`
        }

        return {
            user: userWithoutPassword,
            error: null
        }
    }

    // Logout method
    logout(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-user')
            document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }
    }

    // Get current user
    getCurrentUser(): User | null {
        if (typeof window === 'undefined') return null

        try {
            const stored = localStorage.getItem('auth-user')
            return stored ? JSON.parse(stored) : null
        } catch {
            return null
        }
    }

    // Check if authenticated
    isAuthenticated(): boolean {
        return this.getCurrentUser() !== null
    }

    // Check if admin
    isAdmin(): boolean {
        const user = this.getCurrentUser()
        return user?.role === 'admin'
    }
}

// Export singleton instance
export const authService = new SimpleAuthService()