import { Suspense } from 'react'
import LockedCardContent from './content'
import { prisma } from '@/lib/prisma'

// Force dynamic to prevent prerendering issues with database access
export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Fetch public fields only: bloodType is NOT encrypted at registration.
  // All other fields (allergies, conditions, meds, notes) are encrypted at rest.
  const patient = await prisma.patient.findUnique({
    where: { id },
    select: {
      id: true,
      phoneHash: true,
      profileHash: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  const criticalData = await prisma.criticalData.findUnique({
    where: { patientId: id },
    select: {
      id: true,
      patientId: true,
      allergiesEncrypted: true,
      conditionsEncrypted: true,
      medsEncrypted: true,
      bloodType: true,
      notesEncrypted: true,
      updatedAt: true,
    },
  })

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat kartu...</p>
      </div>
    }>
      <LockedCardContent params={params} patient={patient} criticalData={criticalData} />
    </Suspense>
  )
}
