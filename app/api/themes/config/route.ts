import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { updateThemeConfig } from '@/lib/theme';
import { withAdminAuth } from '@/lib/middleware';

export async function PUT(req: NextRequest) {
  return withAdminAuth(req, async innerReq => {
    try {
      await connectDB();

      const body = await innerReq.json();
      const { themeName, config } = body;

      if (!themeName || config === undefined) {
        return NextResponse.json(
          { error: '请提供主题名称和配置内容' },
          { status: 400 }
        );
      }

      await updateThemeConfig(themeName, config);

      return NextResponse.json({
        message: '主题配置更新成功',
        themeName,
        config,
      });
    } catch (error: any) {
      console.error('更新主题配置错误:', error);
      return NextResponse.json(
        { error: '更新主题配置失败' },
        { status: 500 }
      );
    }
  });
}
