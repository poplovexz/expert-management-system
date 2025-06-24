import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png'
]

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session as any).user?.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'photo' | 'certificate'
    
    if (!file) {
      return NextResponse.json(
        { error: '请选择文件' },
        { status: 400 }
      )
    }

    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '文件大小不能超过5MB' },
        { status: 400 }
      )
    }

    // 检查文件类型
    let allowedTypes: string[]
    let uploadDir: string

    if (type === 'photo') {
      allowedTypes = ALLOWED_IMAGE_TYPES
      uploadDir = 'photos'
    } else if (type === 'certificate') {
      allowedTypes = ALLOWED_DOCUMENT_TYPES
      uploadDir = 'certificates'
    } else {
      return NextResponse.json(
        { error: '无效的文件类型' },
        { status: 400 }
      )
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `不支持的文件格式: ${file.type}` },
        { status: 400 }
      )
    }

    // 生成唯一文件名
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}_${randomString}.${fileExtension}`

    // 确保上传目录存在
    const uploadPath = join(process.cwd(), 'public', 'uploads', uploadDir)
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true })
    }

    // 保存文件
    const filePath = join(uploadPath, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(filePath, buffer)

    // 返回文件URL
    const fileUrl = `/uploads/${uploadDir}/${fileName}`

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        fileUrl,
        originalName: file.name,
        size: file.size,
        type: file.type
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 }
    )
  }
}
