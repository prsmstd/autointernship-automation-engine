import { ProductionDashboard } from '@/components/dashboard/ProductionDashboardFixed'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <ProductionDashboard />
    </ProtectedRoute>
  )
}