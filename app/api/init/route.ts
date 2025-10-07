import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Theme from '@/models/Theme';
import Settings from '@/models/Settings';
import { getAvailableThemeNames, getThemeManifests } from '@/lib/theme-registry';
import { syncThemesWithFilesystem } from '@/lib/theme';

export async function POST(_req: NextRequest) {
  try {
    await connectDB();
    await syncThemesWithFilesystem();

    const manifests = getThemeManifests();
    const availableNames = manifests.map(manifest => manifest.name);

    const settings = await Settings.findOne({});
    if (!settings) {
      await Settings.create({
        activeTheme: availableNames.includes('fullscreen-section') ? 'fullscreen-section' : availableNames[0] ?? 'fullscreen-section',
        siteName: 'NavGo',
        siteDescription: '基于 Next.js 的可切换主题导航系统',
        themeConfigs: {},
      });
    } else {
      const sanitizedConfigs = Object.fromEntries(
        Object.entries(settings.themeConfigs || {}).filter(([key]) => availableNames.includes(key)),
      );

      const currentActive = settings.activeTheme;
      settings.activeTheme = availableNames.includes(currentActive)
        ? currentActive
        : availableNames.includes('fullscreen-section')
          ? 'fullscreen-section'
          : availableNames[0] ?? 'fullscreen-section';
      settings.themeConfigs = sanitizedConfigs;
      await settings.save();
    }

    const themes = await Theme.find({ name: { $in: availableNames } }).sort({ name: 1 });

    return NextResponse.json({
      message: '主题已初始化并同步',
      success: true,
      themes,
    });
  } catch (error) {
    console.error('同步主题失败:', error);
    return NextResponse.json(
      { error: '同步主题失败' },
      { status: 500 },
    );
  }
}
