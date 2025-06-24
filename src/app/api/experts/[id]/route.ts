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

// GET /api/experts/[id] - 获取单个专家详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的专家ID' },
        { status: 400 }
      )
    }

    const expert = await prisma.expert.findUnique({
      where: { id },
      include: {
        certificates: true
      }
    })

    if (!expert) {
      return NextResponse.json(
        { error: '专家不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: expert
    })
  } catch (error) {
    console.error('Get expert error:', error)
    return NextResponse.json(
      { error: '获取专家详情失败' },
      { status: 500 }
    )
  }
}

// PUT /api/experts/[id] - 更新专家信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session as any).user?.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的专家ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const data = expertSchema.parse(body)

    const expert = await prisma.expert.update({
      where: { id },
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

    console.error('Update expert error:', error)
    return NextResponse.json(
      { error: '更新专家信息失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/experts/[id] - 删除专家
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session as any).user?.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的专家ID' },
        { status: 400 }
      )
    }

    await prisma.expert.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '专家删除成功'
    })
  } catch (error) {
    console.error('Delete expert error:', error)
    return NextResponse.json(
      { error: '删除专家失败' },
      { status: 500 }
    )
  }
}
