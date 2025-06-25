'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Expert, ApiResponse, PaginationInfo } from '@/types'

interface Props {
  searchQuery?: string
}

export default function ExpertList({ searchQuery = '' }: Props) {
  const { data: session } = useSession()
  const [experts, setExperts] = useState<Expert[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchExperts(1)
  }, [searchQuery])

  const fetchExperts = async (page: number) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      if (searchQuery) {
        params.append('query', searchQuery)
      }

      const response = await fetch(`/api/experts?${params}`)
      const result: ApiResponse<Expert[]> = await response.json()

      if (response.ok && result.success) {
        setExperts(result.data || [])
        setPagination(result.pagination || null)
        setCurrentPage(page)
      } else {
        setError(result.error || '获取专家列表失败')
      }
    } catch (error) {
      setError('获取专家列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    fetchExperts(page)
  }

  const handleDelete = async (expertId: number) => {
    if (!confirm('确定要删除这位专家吗？此操作不可撤销。')) {
      return
    }

    try {
      const response = await fetch(`/api/experts/${expertId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // 重新获取当前页数据
        fetchExperts(currentPage)
      } else {
        const result = await response.json()
        alert(result.error || '删除失败')
      }
    } catch (error) {
      alert('删除失败')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  if (experts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">
          {searchQuery ? '没有找到匹配的专家' : '暂无专家信息'}
        </div>
        {(session as any)?.user?.role === 'ADMIN' && !searchQuery && (
          <Link
            href="/experts/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            添加第一位专家
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 专家卡片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experts.map((expert) => {
          const fieldTags = expert.field.split(',').map(f => f.trim()).filter(f => f)
          const specialtyTags = expert.specialty.split(',').map(s => s.trim()).filter(s => s)

          return (
            <div key={expert.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-4">
                    {/* 专家照片 */}
                    {expert.photoUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={expert.photoUrl}
                          alt={expert.name}
                          className="w-16 h-16 rounded-full object-cover border border-gray-200"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        <Link
                          href={`/experts/${expert.id}`}
                          className="hover:text-indigo-600 transition-colors"
                        >
                          {expert.name}
                        </Link>
                      </h3>
                      {expert.title && expert.organization && (
                        <p className="text-gray-600 text-sm">
                          {expert.title} · {expert.organization}
                        </p>
                      )}
                      {expert.title && !expert.organization && (
                        <p className="text-gray-600 text-sm">{expert.title}</p>
                      )}
                      {!expert.title && expert.organization && (
                        <p className="text-gray-600 text-sm">{expert.organization}</p>
                      )}
                      {/* 证书数量显示 */}
                      {expert.certificates && expert.certificates.length > 0 && (
                        <p className="text-gray-500 text-xs mt-1">
                          📜 {expert.certificates.length} 个证书
                        </p>
                      )}
                    </div>
                  </div>
                  {(session as any)?.user?.role === 'ADMIN' && (
                    <div className="flex space-x-1">
                      <Link
                        href={`/experts/${expert.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        编辑
                      </Link>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleDelete(expert.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  )}
                </div>

                {/* 专业领域标签 */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {fieldTags.slice(0, 3).map((field, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                      >
                        {field}
                      </span>
                    ))}
                    {fieldTags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{fieldTags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* 专家特长标签 */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {specialtyTags.slice(0, 3).map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                      >
                        {specialty}
                      </span>
                    ))}
                    {specialtyTags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{specialtyTags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* 个人简介预览 */}
                {expert.bio && (
                  <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                    {expert.bio}
                  </p>
                )}

                {/* 查看详情按钮 */}
                <Link
                  href={`/experts/${expert.id}`}
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  查看详情 →
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* 分页 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 border rounded-md text-sm font-medium ${
                  page === currentPage
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      )}

      {/* 分页信息 */}
      {pagination && (
        <div className="text-center text-sm text-gray-600">
          共 {pagination.totalCount} 位专家，第 {pagination.currentPage} / {pagination.totalPages} 页
        </div>
      )}
    </div>
  )
}
