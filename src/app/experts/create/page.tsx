'use client'

import { useRequireAdmin } from '@/hooks/useAuth'
import ExpertForm from '@/components/ExpertForm'
import Navbar from '@/components/Navbar'

export default function CreateExpertPage() {
  const { isLoading } = useRequireAdmin()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <ExpertForm />
      </div>
    </div>
  )
}
