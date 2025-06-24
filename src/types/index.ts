export interface User {
  id: number
  email: string
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}

export interface Certificate {
  id: number
  expertId: number
  name: string
  issuer?: string
  issueDate?: string
  expiryDate?: string
  fileUrl?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Expert {
  id: number
  name: string
  field: string // 专业领域，逗号分隔
  specialty: string // 专家特长，逗号分隔
  organization?: string // 工作单位
  contact?: string // 联系方式
  education?: string // 学历
  title?: string // 职称
  researchDirection?: string // 研究方向
  awards?: string // 获奖经历
  achievements?: string // 代表性成果
  bio?: string // 个人简介
  photoUrl?: string // 照片URL
  createdAt: Date
  updatedAt: Date
  certificates?: Certificate[] // 关联证书
}

export interface CertificateFormData {
  name: string
  issuer?: string
  issueDate?: string
  expiryDate?: string
  description?: string
  file?: File
}

export interface ExpertFormData {
  name: string
  field: string
  specialty: string
  organization?: string
  contact?: string
  education?: string
  title?: string
  researchDirection?: string
  awards?: string
  achievements?: string
  bio?: string
  photoFile?: File
  certificates?: CertificateFormData[]
}

export interface SearchParams {
  query?: string
  page?: number
  limit?: number
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  pagination?: PaginationInfo
}

export interface CSVImportResult {
  success: boolean
  imported: number
  errors: Array<{
    row: number
    field: string
    message: string
  }>
}
