import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const certificateSchema = z.object({
  name: z.string().min(1, '证书名称不能为空'),
  issuer: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  fileUrl: z.string().optional(),
  description: z.string().optional()
})

// GET /api/certificates/[id] - 获取单个证书详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的证书ID' },
        { status: 400 }
      )
    }

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: { expert: true }
    })

    if (!certificate) {
      return NextResponse.json(
        { error: '证书不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: certificate
    })
  } catch (error) {
    console.error('Get certificate error:', error)
    return NextResponse.json(
      { error: '获取证书详情失败' },
      { status: 500 }
    )
  }
}

// PUT /api/certificates/[id] - 更新证书信息
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
        { error: '无效的证书ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const data = certificateSchema.parse(body)

    const certificate = await prisma.certificate.update({
      where: { id },
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

    console.error('Update certificate error:', error)
    return NextResponse.json(
      { error: '更新证书信息失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/certificates/[id] - 删除证书
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
        { error: '无效的证书ID' },
        { status: 400 }
      )
    }

    await prisma.certificate.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '证书删除成功'
    })
  } catch (error) {
    console.error('Delete certificate error:', error)
    return NextResponse.json(
      { error: '删除证书失败' },
      { status: 500 }
    )
  }
}
