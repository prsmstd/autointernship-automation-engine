import { SimpleAdminDashboard } from '@/components/admin/SimpleAdminDashboard'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <SimpleAdminDashboard />
    </ProtectedRoute>
  )
}