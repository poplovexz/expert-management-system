'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ExpertFormData, Expert, CertificateFormData } from '@/types'
import FileUpload from './FileUpload'
import CertificateManager from './CertificateManager'

const expertSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  field: z.string().min(1, '专业领域不能为空'),
  specialty: z.string().min(1, '专家特长不能为空'),
  organization: z.string().optional(),
  contact: z.string().optional(),
  education: z.string().optional(),
  title: z.string().optional(),
  researchDirection: z.string().optional(),
  awards: z.string().optional(),
  achievements: z.string().optional(),
  bio: z.string().max(500, '个人简介不能超过500字').optional()
})

interface Props {
  expert?: Expert
  onSuccess?: () => void
}

export default function ExpertForm({ expert, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoUrl, setPhotoUrl] = useState(expert?.photoUrl || '')
  const [certificates, setCertificates] = useState<CertificateFormData[]>([])
  const router = useRouter()
  const isEditing = !!expert

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ExpertFormData>({
    resolver: zodResolver(expertSchema),
    defaultValues: expert ? {
      name: expert.name,
      field: expert.field,
      specialty: expert.specialty,
      organization: expert.organization || '',
      contact: expert.contact || '',
      education: expert.education || '',
      title: expert.title || '',
      researchDirection: expert.researchDirection || '',
      awards: expert.awards || '',
      achievements: expert.achievements || '',
      bio: expert.bio || ''
    } : {}
  })

  const onSubmit = async (data: ExpertFormData) => {
    setIsLoading(true)
    setError('')

    try {
      // 准备专家数据
      const expertData = {
        ...data,
        photoUrl: photoUrl || undefined
      }

      const url = isEditing ? `/api/experts/${expert.id}` : '/api/experts'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expertData)
      })

      const result = await response.json()

      if (response.ok) {
        const expertId = result.data.id

        // 如果有证书数据，保存证书
        if (certificates.length > 0) {
          for (const cert of certificates) {
            const certData = {
              expertId,
              name: cert.name,
              issuer: cert.issuer,
              issueDate: cert.issueDate,
              expiryDate: cert.expiryDate,
              description: cert.description,
              fileUrl: cert.file && typeof cert.file === 'object' && 'url' in cert.file ? cert.file.url : undefined
            }

            await fetch('/api/certificates', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(certData)
            })
          }
        }

        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/')
        }
      } else {
        setError(result.error || '操作失败，请稍后重试')
      }
    } catch (error) {
      setError('操作失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? '编辑专家信息' : '添加专家'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 姓名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="请输入专家姓名"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* 工作单位 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                工作单位
              </label>
              <input
                {...register('organization')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="请输入工作单位"
              />
            </div>

            {/* 专业领域 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                专业领域 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('field')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="请输入专业领域，多个用逗号分隔"
              />
              {errors.field && (
                <p className="mt-1 text-sm text-red-600">{errors.field.message}</p>
              )}
            </div>

            {/* 专家特长 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                专家特长 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('specialty')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="请输入专家特长，多个用逗号分隔"
              />
              {errors.specialty && (
                <p className="mt-1 text-sm text-red-600">{errors.specialty.message}</p>
              )}
            </div>

            {/* 联系方式 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                联系方式
              </label>
              <input
                {...register('contact')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="请输入联系方式"
              />
            </div>

            {/* 学历 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                学历
              </label>
              <select
                {...register('education')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">请选择学历</option>
                <option value="本科">本科</option>
                <option value="硕士">硕士</option>
                <option value="博士">博士</option>
                <option value="博士后">博士后</option>
              </select>
            </div>

            {/* 职称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                职称
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="请输入职称"
              />
            </div>

            {/* 研究方向 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                研究方向
              </label>
              <input
                {...register('researchDirection')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="请输入研究方向"
              />
            </div>
          </div>

          {/* 获奖经历 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              获奖经历
            </label>
            <textarea
              {...register('awards')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="请输入获奖经历"
            />
          </div>

          {/* 代表性成果 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              代表性成果
            </label>
            <textarea
              {...register('achievements')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="请输入代表性成果"
            />
          </div>

          {/* 个人简介 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              个人简介 <span className="text-gray-500">(限500字)</span>
            </label>
            <textarea
              {...register('bio')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="请输入个人简介"
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
            )}
          </div>

          {/* 照片上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              专家照片
            </label>
            <FileUpload
              type="photo"
              onUpload={setPhotoUrl}
              currentFile={photoUrl}
            />
          </div>

          {/* 证书管理 */}
          <div>
            <CertificateManager
              certificates={certificates}
              onChange={setCertificates}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
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
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '保存中...' : (isEditing ? '更新' : '创建')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
