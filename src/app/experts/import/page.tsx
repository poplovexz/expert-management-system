'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAdmin } from '@/hooks/useAuth'
import Navbar from '@/components/Navbar'
import { CSVImportResult } from '@/types'

export default function ImportExpertsPage() {
  const { isLoading: authLoading } = useRequireAdmin()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<CSVImportResult | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('请选择CSV文件')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/experts/import', {
        method: 'POST',
        body: formData
      })

      const result: CSVImportResult = await response.json()

      if (response.ok) {
        setResult(result)
        if (result.success && result.imported > 0) {
          setTimeout(() => {
            router.push('/')
          }, 3000)
        }
      } else {
        setError(result.errors?.[0]?.message || '导入失败')
      }
    } catch (error) {
      setError('导入失败，请稍后重试')
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = 'name,field,specialty,organization,contact,education,title,research_direction,awards,achievements,bio,photo_url,certificates\nZhang San,"AI,ML","Deep Learning,NLP",XX University,zhang@example.com,PhD,Professor,Computer Vision,"2023 Award","Papers: AI Review",AI Expert,https://example.com/photo1.jpg,"[{""name"":""Engineer Certificate"",""issuer"":""Ministry"",""issueDate"":""2023-01-01""}]"\nLi Si,"Data Science,Statistics","Data Mining,Analysis",YY Institute,li@example.com,Master,Associate Professor,Big Data,"2022 Award","Book: Data Science",Data Expert,https://example.com/photo2.jpg,"[{""name"":""Analyst Certificate"",""issuer"":""Bureau"",""issueDate"":""2022-06-01""}]"'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'experts_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-lg">加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">批量导入专家</h2>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">使用说明</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• 请使用CSV格式文件，文件大小不超过5MB</li>
              <li>• 必填字段：姓名(name)、专业领域(field)、专家特长(specialty)</li>
              <li>• 可选字段：工作单位(organization)、联系方式(contact)、学历(education)、职称(title)、研究方向(research_direction)、获奖经历(awards)、代表性成果(achievements)、个人简介(bio)</li>
              <li>• 新增字段：照片链接(photo_url)、证书信息(certificates)</li>
              <li>• 多个标签用逗号分隔，如：&quot;人工智能,机器学习&quot;</li>
              <li>• 个人简介限制500字以内</li>
              <li>• 照片链接请使用完整的URL地址</li>
              <li>• 证书信息请使用JSON格式</li>
            </ul>
          </div>

          <div className="mb-6">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              下载CSV模板
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择CSV文件
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>点击选择文件</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">或拖拽文件到此处</p>
                </div>
                <p className="text-xs text-gray-500">CSV文件，最大5MB</p>
              </div>
            </div>
            {file && (
              <div className="mt-2 text-sm text-gray-600">
                已选择文件: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {result && (
            <div className="mb-6">
              {result.success ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-green-900 mb-2">导入成功！</h3>
                  <p className="text-green-800">成功导入 {result.imported} 位专家</p>
                  {result.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-green-800 font-medium">部分数据存在问题：</p>
                      <ul className="mt-1 text-sm text-green-700">
                        {result.errors.map((error, index) => (
                          <li key={index}>
                            第{error.row}行 {error.field}: {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-green-700 text-sm mt-2">3秒后自动跳转到专家列表...</p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-red-900 mb-2">导入失败</h3>
                  <p className="text-red-800 mb-2">发现以下错误，请修正后重新上传：</p>
                  <ul className="text-sm text-red-700">
                    {result.errors.map((error, index) => (
                      <li key={index}>
                        第{error.row}行 {error.field}: {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              取消
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? '导入中...' : '开始导入'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
