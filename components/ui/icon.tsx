import React from 'react'

interface IconProps {
  name: string
  className?: string
  fallback?: string
}

export const Icon: React.FC<IconProps> = ({ name, className = '', fallback }) => {
  return (
    <i 
      className={`fas fa-${name} ${className}`}
      style={{ 
        fontFamily: 'Font Awesome 6 Free',
        fontWeight: 900,
        display: 'inline-block'
      }}
      onError={(e) => {
        // Fallback if icon doesn't load
        if (fallback) {
          e.currentTarget.textContent = fallback
          e.currentTarget.className = className
        }
      }}
    />
  )
}

// Common icon components for better consistency
export const LoadingIcon = ({ className = '' }: { className?: string }) => (
  <Icon name="spinner fa-spin" className={className} fallback="⟳" />
)

export const SignInIcon = ({ className = '' }: { className?: string }) => (
  <Icon name="sign-in-alt" className={className} fallback="→" />
)

export const DashboardIcon = ({ className = '' }: { className?: string }) => (
  <Icon name="tachometer-alt" className={className} fallback="📊" />
)

export const UserIcon = ({ className = '' }: { className?: string }) => (
  <Icon name="user" className={className} fallback="👤" />
)

export const TaskIcon = ({ className = '' }: { className?: string }) => (
  <Icon name="tasks" className={className} fallback="✓" />
)

export const CertificateIcon = ({ className = '' }: { className?: string }) => (
  <Icon name="certificate" className={className} fallback="🏆" />
)

export const SettingsIcon = ({ className = '' }: { className?: string }) => (
  <Icon name="cog" className={className} fallback="⚙️" />
)

export const LogoutIcon = ({ className = '' }: { className?: string }) => (
  <Icon name="sign-out-alt" className={className} fallback="←" />
)