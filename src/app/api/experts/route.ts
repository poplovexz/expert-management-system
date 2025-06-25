import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

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
  bio: z.string().max(500, '个人简介不能超过500字').optional(),
  photoUrl: z.string().optional()
})

// GET /api/experts - 获取专家列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // 构建搜索条件
    const where = query
      ? {
          OR: [
            { name: { contains: query } },
            { field: { contains: query } },
            { specialty: { contains: query } },
            { organization: { contains: query } }
          ]
        }
      : {}

    // 获取总数
    const totalCount = await prisma.expert.count({ where })

    // 获取专家列表
    const experts = await prisma.expert.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        certificates: true
      }
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: experts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Get experts error:', error)
    return NextResponse.json(
      { error: '获取专家列表失败' },
      { status: 500 }
    )
  }
}

// POST /api/experts - 创建专家
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
    const data = expertSchema.parse(body)

    const expert = await prisma.expert.create({
      data
    })

    return NextResponse.json({
      success: true,
      data: expert
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Create expert error:', error)
    return NextResponse.json(
      { error: '创建专家失败' },
      { status: 500 }
    )
  }
}
