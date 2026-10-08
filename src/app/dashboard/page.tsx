import { Suspense } from 'react'
import DashboardContent from './content'

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat dashboard...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
