'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Expert } from '@/types'

export default function ExpertDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [expert, setExpert] = useState<Expert | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const expertId = Array.isArray(params.id) ? params.id[0] : params.id

  useEffect(() => {
    fetchExpert()
  }, [expertId])

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

  const handleDelete = async () => {
    if (!confirm('确定要删除这位专家吗？此操作不可撤销。')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/experts/${expertId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/')
      } else {
        const result = await response.json()
        alert(result.error || '删除失败')
      }
    } catch (error) {
      alert('删除失败')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
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

  const fieldTags = expert.field.split(',').map(f => f.trim()).filter(f => f)
  const specialtyTags = expert.specialty.split(',').map(s => s.trim()).filter(s => s)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8 text-white">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-6">
                {/* 专家照片 */}
                {expert.photoUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={expert.photoUrl}
                      alt={expert.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold mb-2">{expert.name}</h1>
                  {expert.title && expert.organization && (
                    <p className="text-indigo-100 text-lg">
                      {expert.title} · {expert.organization}
                    </p>
                  )}
                  {expert.title && !expert.organization && (
                    <p className="text-indigo-100 text-lg">{expert.title}</p>
                  )}
                  {!expert.title && expert.organization && (
                    <p className="text-indigo-100 text-lg">{expert.organization}</p>
                  )}
                </div>
              </div>
              {(session as any)?.user?.role === 'ADMIN' && (
                <div className="flex space-x-2">
                  <Link
                    href={`/experts/${expert.id}/edit`}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    编辑
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? '删除中...' : '删除'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">基本信息</h3>
                <div className="space-y-2">
                  {expert.education && (
                    <div className="flex">
                      <span className="text-gray-600 w-20">学历：</span>
                      <span className="text-gray-900">{expert.education}</span>
                    </div>
                  )}
                  {expert.contact && (
                    <div className="flex">
                      <span className="text-gray-600 w-20">联系方式：</span>
                      <span className="text-gray-900">{expert.contact}</span>
                    </div>
                  )}
                  {expert.researchDirection && (
                    <div className="flex">
                      <span className="text-gray-600 w-20">研究方向：</span>
                      <span className="text-gray-900">{expert.researchDirection}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 专业领域 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">专业领域</h3>
              <div className="flex flex-wrap gap-2">
                {fieldTags.map((field, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>

            {/* 专家特长 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">专家特长</h3>
              <div className="flex flex-wrap gap-2">
                {specialtyTags.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* 个人简介 */}
            {expert.bio && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">个人简介</h3>
                <p className="text-gray-700 leading-relaxed">{expert.bio}</p>
              </div>
            )}

            {/* 获奖经历 */}
            {expert.awards && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">获奖经历</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-gray-700 whitespace-pre-line">{expert.awards}</p>
                </div>
              </div>
            )}

            {/* 代表性成果 */}
            {expert.achievements && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">代表性成果</h3>
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-gray-700 whitespace-pre-line">{expert.achievements}</p>
                </div>
              </div>
            )}

            {/* 证书列表 */}
            {expert.certificates && expert.certificates.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">专业证书</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expert.certificates.map((certificate) => (
                    <div key={certificate.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{certificate.name}</h4>
                          {certificate.issuer && (
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">颁发机构:</span> {certificate.issuer}
                            </p>
                          )}
                          {certificate.issueDate && (
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">颁发日期:</span> {certificate.issueDate}
                            </p>
                          )}
                          {certificate.expiryDate && (
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">过期日期:</span> {certificate.expiryDate}
                            </p>
                          )}
                          {certificate.description && (
                            <p className="text-sm text-gray-700 mt-2">{certificate.description}</p>
                          )}
                        </div>
                        {certificate.fileUrl && (
                          <div className="ml-4">
                            <a
                              href={certificate.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              查看
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>创建时间：{new Date(expert.createdAt).toLocaleString('zh-CN')}</span>
              <span>更新时间：{new Date(expert.updatedAt).toLocaleString('zh-CN')}</span>
            </div>
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ← 返回专家列表
          </Link>
        </div>
      </div>
    </div>
  )
}
