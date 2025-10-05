import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PreviewToken from '@/models/PreviewToken';
import { generatePreviewToken } from '@/lib/auth';
import { withAdminAuth } from '@/lib/middleware';

export async function POST(req: NextRequest) {
  return withAdminAuth(req, async (req, user) => {
    try {
      await connectDB();

      const body = await req.json();
      const { theme } = body;

      if (!theme) {
        return NextResponse.json(
          { error: '请提供主题名称' },
          { status: 400 }
        );
      }

      const token = generatePreviewToken();

      const previewToken = new PreviewToken({
        token,
        theme,
        createdBy: user.userId,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1小时后过期
      });

      await previewToken.save();

      return NextResponse.json({
        message: '预览令牌生成成功',
        token,
        previewUrl: `/preview?theme=${theme}&token=${token}`,
      });
    } catch (error: any) {
      console.error('生成预览令牌错误:', error);
      return NextResponse.json(
        { error: '生成预览令牌失败' },
        { status: 500 }
      );
    }
  });
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: '请提供令牌' },
        { status: 400 }
      );
    }

    const previewToken = await PreviewToken.findOne({ token });

    if (!previewToken) {
      return NextResponse.json(
        { error: '令牌无效或已过期' },
        { status: 404 }
      );
    }

    if (previewToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: '令牌已过期' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      valid: true,
      theme: previewToken.theme,
    });
  } catch (error: any) {
    console.error('验证预览令牌错误:', error);
    return NextResponse.json(
      { error: '验证令牌失败' },
      { status: 500 }
    );
  }
}
