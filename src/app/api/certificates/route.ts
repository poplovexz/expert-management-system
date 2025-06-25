import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const certificateSchema = z.object({
  expertId: z.number(),
  name: z.string().min(1, '证书名称不能为空'),
  issuer: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  fileUrl: z.string().optional(),
  description: z.string().optional()
})

// POST /api/certificates - 创建证书
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = certificateSchema.parse(body)

    // 检查专家是否存在
    const expert = await prisma.expert.findUnique({
      where: { id: data.expertId }
    })

    if (!expert) {
      return NextResponse.json(
        { error: '专家不存在' },
        { status: 404 }
      )
    }

    const certificate = await prisma.certificate.create({
      data
    })

    return NextResponse.json({
      success: true,
      data: certificate
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Create certificate error:', error)
    return NextResponse.json(
      { error: '创建证书失败' },
      { status: 500 }
    )
  }
}

// GET /api/certificates - 获取证书列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const expertId = searchParams.get('expertId')

    if (!expertId) {
      return NextResponse.json(
        { error: '缺少专家ID' },
        { status: 400 }
      )
    }

    const certificates = await prisma.certificate.findMany({
      where: { expertId: parseInt(expertId) },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: certificates
    })
  } catch (error) {
    console.error('Get certificates error:', error)
    return NextResponse.json(
      { error: '获取证书列表失败' },
      { status: 500 }
    )
  }
}
