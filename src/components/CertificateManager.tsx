'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import FileUpload from './FileUpload'
import { CertificateFormData } from '@/types'

const certificateSchema = z.object({
  name: z.string().min(1, '证书名称不能为空'),
  issuer: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  description: z.string().optional()
})

interface Props {
  certificates: CertificateFormData[]
  onChange: (certificates: CertificateFormData[]) => void
}

export default function CertificateManager({ certificates, onChange }: Props) {
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema)
  })

  const watchedFileUrl = watch('file')

  const handleAdd = (data: CertificateFormData) => {
    const newCertificates = [...certificates, data]
    onChange(newCertificates)
    reset()
    setIsAddingNew(false)
  }

  const handleEdit = (index: number, data: CertificateFormData) => {
    const newCertificates = [...certificates]
    newCertificates[index] = data
    onChange(newCertificates)
    reset()
    setEditingIndex(null)
  }

  const handleDelete = (index: number) => {
    if (confirm('确定要删除这个证书吗？')) {
      const newCertificates = certificates.filter((_, i) => i !== index)
      onChange(newCertificates)
    }
  }

  const handleCancel = () => {
    reset()
    setIsAddingNew(false)
    setEditingIndex(null)
  }

  const startEdit = (index: number) => {
    const cert = certificates[index]
    reset(cert)
    setEditingIndex(index)
  }

  const handleFileUpload = (fileUrl: string) => {
    // 这里我们需要创建一个File对象的模拟，实际上我们存储的是URL
    setValue('file', { name: fileUrl.split('/').pop() || '', url: fileUrl } as File & { url: string })
  }

  const onSubmit = (data: CertificateFormData) => {
    if (editingIndex !== null) {
      handleEdit(editingIndex, data)
    } else {
      handleAdd(data)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">证书管理</h3>
        {!isAddingNew && editingIndex === null && (
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加证书
          </button>
        )}
      </div>

      {/* 证书列表 */}
      {certificates.length > 0 && (
        <div className="space-y-3">
          {certificates.map((cert, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{cert.name}</h4>
                  {cert.issuer && (
                    <p className="text-sm text-gray-600">颁发机构: {cert.issuer}</p>
                  )}
                  {cert.issueDate && (
                    <p className="text-sm text-gray-600">颁发日期: {cert.issueDate}</p>
                  )}
                  {cert.expiryDate && (
                    <p className="text-sm text-gray-600">过期日期: {cert.expiryDate}</p>
                  )}
                  {cert.description && (
                    <p className="text-sm text-gray-600 mt-1">{cert.description}</p>
                  )}
                  {cert.file && (
                    <p className="text-sm text-indigo-600 mt-1">
                      📎 {typeof cert.file === 'object' && 'name' in cert.file ? cert.file.name : '已上传文件'}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    type="button"
                    onClick={() => startEdit(index)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 添加/编辑表单 */}
      {(isAddingNew || editingIndex !== null) && (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <h4 className="font-medium text-gray-900 mb-4">
            {editingIndex !== null ? '编辑证书' : '添加证书'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                证书名称 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="请输入证书名称"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                颁发机构
              </label>
              <input
                {...register('issuer')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="请输入颁发机构"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                颁发日期
              </label>
              <input
                {...register('issueDate')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                过期日期
              </label>
              <input
                {...register('expiryDate')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              证书描述
            </label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="请输入证书描述"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              证书文件
            </label>
            <FileUpload
              type="certificate"
              onUpload={handleFileUpload}
              currentFile={watchedFileUrl && typeof watchedFileUrl === 'object' && 'url' in watchedFileUrl ? (watchedFileUrl as any).url : ''}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {editingIndex !== null ? '更新' : '添加'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
