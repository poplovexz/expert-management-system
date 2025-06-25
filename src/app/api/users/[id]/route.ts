import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: '未授权' }, { status: 401 });
    }

    const { id: userId } = await params;

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }

    // 防止删除自己
    if (user.id === session.user.id) {
      return NextResponse.json(
        { message: '不能删除自己的账户' },
        { status: 400 }
      );
    }

    // 删除用户
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: '用户删除成功' });
  } catch (error: any) {
    console.error('删除用户失败:', error);
    return NextResponse.json(
      { message: '删除用户失败' },
      { status: 500 }
    );
  }
}

// 获取单个用户信息
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: '未授权' }, { status: 401 });
    }

    const { id: userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { message: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
