'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import SearchBar from '@/components/SearchBar'
import ExpertList from '@/components/ExpertList'

export default function Home() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            专家人员管理系统
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            专业的专家人员信息管理与展示平台
          </p>
        </div>

        {/* Search and Actions */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-96">
              <SearchBar onSearch={handleSearch} />
            </div>
            {(session as any)?.user?.role === 'ADMIN' && (
              <div className="flex space-x-4">
                <Link
                  href="/experts/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  添加专家
                </Link>
                <Link
                  href="/experts/import"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  批量导入
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-6">
            <p className="text-gray-600">
              搜索结果：<span className="font-medium">&quot;{searchQuery}&quot;</span>
              <button
                onClick={() => handleSearch('')}
                className="ml-2 text-indigo-600 hover:text-indigo-800 text-sm"
              >
                清除搜索
              </button>
            </p>
          </div>
        )}

        {/* Expert List */}
        <ExpertList searchQuery={searchQuery} />
      </div>
    </div>
  )
}
