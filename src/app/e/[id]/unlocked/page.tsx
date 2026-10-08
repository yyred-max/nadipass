import { Suspense } from 'react'
import UnlockedContent from './content'

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat...</p>
      </div>
    }>
      <UnlockedContent />
    </Suspense>
  )
}
