import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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

// 更新用户信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: '未授权' }, { status: 401 });
    }

    const { id: userId } = await params;
    const body = await request.json();
    const { email, name, role, password } = body;

    if (!email || !name) {
      return NextResponse.json(
        { message: '邮箱和姓名都是必填项' },
        { status: 400 }
      );
    }

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }

    // 检查邮箱是否被其他用户使用
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { message: '该邮箱已被其他用户使用' },
          { status: 400 }
        );
      }
    }

    // 准备更新数据
    const updateData: any = {
      email,
      name,
      role,
    };

    // 如果提供了新密码，则加密并更新
    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // 更新用户
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('更新用户失败:', error);
    return NextResponse.json(
      { message: '更新用户失败' },
      { status: 500 }
    );
  }
}
