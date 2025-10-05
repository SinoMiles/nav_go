import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: '请提供邮箱和密码' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 生成令牌
    const userId = user._id instanceof Types.ObjectId ? user._id.toHexString() : String(user._id);
    const token = generateToken(userId, user.role);

    return NextResponse.json({
      message: '登录成功',
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error: any) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { error: '登录失败,请稍后重试' },
      { status: 500 }
    );
  }
}
