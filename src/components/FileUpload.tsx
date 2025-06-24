'use client'

import { useState, useRef } from 'react'

interface Props {
  type: 'photo' | 'certificate'
  onUpload: (fileUrl: string) => void
  currentFile?: string
  accept?: string
  className?: string
}

export default function FileUpload({ 
  type, 
  onUpload, 
  currentFile, 
  accept = type === 'photo' ? 'image/*' : '.pdf,.doc,.docx,image/*',
  className = ''
}: Props) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        onUpload(result.data.fileUrl)
      } else {
        setError(result.error || '上传失败')
      }
    } catch (error) {
      setError('上传失败，请稍后重试')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    onUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {currentFile ? (
        <div className="space-y-2">
          {type === 'photo' ? (
            <div className="relative inline-block">
              <img
                src={currentFile}
                alt="预览"
                className="w-32 h-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-md bg-gray-50">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-gray-700 flex-1">
                {currentFile.split('/').pop()}
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                删除
              </button>
            </div>
          )}
          
          <button
            type="button"
            onClick={handleClick}
            disabled={isUploading}
            className="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
          >
            {isUploading ? '上传中...' : '重新上传'}
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          {isUploading ? (
            <div className="text-gray-500">
              <svg className="mx-auto h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-sm">上传中...</p>
            </div>
          ) : (
            <div className="text-gray-500">
              <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 text-sm">
                点击上传{type === 'photo' ? '照片' : '证书文件'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {type === 'photo' 
                  ? '支持 JPG、PNG、WebP 格式，最大 5MB'
                  : '支持 PDF、DOC、DOCX、图片格式，最大 5MB'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}
