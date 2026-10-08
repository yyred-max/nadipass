import { Suspense } from 'react'
import OnboardingContent from './content'

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat onboarding...</p>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
