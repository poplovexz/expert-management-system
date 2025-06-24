'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useRequireAdmin } from '@/hooks/useAuth'
import ExpertForm from '@/components/ExpertForm'
import Navbar from '@/components/Navbar'
import { Expert } from '@/types'

export default function EditExpertPage() {
  const params = useParams()
  const router = useRouter()
  const { isLoading: authLoading } = useRequireAdmin()
  const [expert, setExpert] = useState<Expert | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const expertId = Array.isArray(params.id) ? params.id[0] : params.id

  useEffect(() => {
    if (!authLoading) {
      fetchExpert()
    }
  }, [expertId, authLoading])

  const fetchExpert = async () => {
    try {
      const response = await fetch(`/api/experts/${expertId}`)
      const result = await response.json()

      if (response.ok) {
        setExpert(result.data)
      } else {
        setError(result.error || '获取专家信息失败')
      }
    } catch (error) {
      setError('获取专家信息失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccess = () => {
    router.push(`/experts/${expertId}`)
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-lg">加载中...</div>
        </div>
      </div>
    )
  }

  if (error || !expert) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error || '专家不存在'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <ExpertForm expert={expert} onSuccess={handleSuccess} />
      </div>
    </div>
  )
}
