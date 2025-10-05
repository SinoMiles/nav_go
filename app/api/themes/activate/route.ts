import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { setActiveTheme } from '@/lib/theme';
import { withAdminAuth } from '@/lib/middleware';

export async function POST(req: NextRequest) {
  return withAdminAuth(req, async (req, user) => {
    try {
      await connectDB();

      const body = await req.json();
      const { themeName } = body;

      if (!themeName) {
        return NextResponse.json(
          { error: '请提供主题名称' },
          { status: 400 }
        );
      }

      await setActiveTheme(themeName);

      return NextResponse.json({
        message: '主题切换成功',
        activeTheme: themeName,
      });
    } catch (error: any) {
      console.error('切换主题错误:', error);
      return NextResponse.json(
        { error: error.message || '切换主题失败' },
        { status: 500 }
      );
    }
  });
}
