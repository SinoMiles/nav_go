import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { withAdminAuth } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const settings = await Settings.findOne({});

    if (!settings) {
      const newSettings = new Settings({
        activeTheme: 'fullscreen-section',
        siteName: 'NavGo',
        themeConfigs: {},
      });
      await newSettings.save();
      return NextResponse.json({ settings: newSettings });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Failed to load settings:', error);
    return NextResponse.json(
      { error: '无法加载站点设置' },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  return withAdminAuth(req, async () => {
    try {
      await connectDB();

      const body = await req.json();
      const {
        siteName,
        siteDescription,
        siteKeywords,
        logo,
        favicon,
        headerTagline,
        friendLinkDomain,
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
      if (headerTagline !== undefined) settings.headerTagline = headerTagline;
      if (friendLinkDomain !== undefined) {
        settings.friendLinkDomain = typeof friendLinkDomain === 'string' ? friendLinkDomain.trim() : '';
      }

      await settings.save();

      return NextResponse.json({
        message: '站点设置更新成功',
        settings,
      });
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      return NextResponse.json(
        { error: '更新站点设置失败' },
        { status: 500 },
      );
    }
  });
}
