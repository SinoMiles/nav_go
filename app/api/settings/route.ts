import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { withAdminAuth } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const settings = await Settings.findOne({});

    if (!settings) {
      // 创建默认设置
      const newSettings = new Settings({
        activeTheme: 'fullscreen-section',
        siteName: 'NavCraft',
        themeConfigs: {},
      });
      await newSettings.save();
      return NextResponse.json({ settings: newSettings });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('获取设置错误:', error);
    return NextResponse.json(
      { error: '获取设置失败' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return withAdminAuth(req, async (req, user) => {
    try {
      await connectDB();

      const body = await req.json();
      const {
        siteName,
        siteDescription,
        siteKeywords,
        logo,
        favicon,
      } = body;

      let settings = await Settings.findOne({});

      if (!settings) {
        settings = new Settings({});
      }

      if (siteName !== undefined) settings.siteName = siteName;
      if (siteDescription !== undefined) settings.siteDescription = siteDescription;
      if (siteKeywords !== undefined) settings.siteKeywords = siteKeywords;
      if (logo !== undefined) settings.logo = logo;
      if (favicon !== undefined) settings.favicon = favicon;

      await settings.save();

      return NextResponse.json({
        message: '设置更新成功',
        settings,
      });
    } catch (error: any) {
      console.error('更新设置错误:', error);
      return NextResponse.json(
        { error: '更新设置失败' },
        { status: 500 }
      );
    }
  });
}
