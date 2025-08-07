import { ProductionDashboard } from '@/components/dashboard/ProductionDashboardFixed'
import { AuthDebug } from '@/components/debug/AuthDebug'

export default function DashboardPage() {
  // Use the fixed ProductionDashboard that handles both real and mock auth gracefully
  return (
    <>
      <ProductionDashboard />
      <AuthDebug />
    </>
  )
}