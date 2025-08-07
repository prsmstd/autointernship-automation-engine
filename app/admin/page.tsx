import { ProductionAdminDashboard } from '@/components/admin/ProductionAdminDashboard'
import { AuthDebug } from '@/components/debug/AuthDebug'

export default function AdminPage() {
  // Use ProductionAdminDashboard - it will handle both real and mock auth
  return (
    <>
      <ProductionAdminDashboard />
      <AuthDebug />
    </>
  )
}