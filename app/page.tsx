import connectDB from '@/lib/mongodb';
import { getActiveTheme, getThemeConfig, syncThemesWithFilesystem } from '@/lib/theme';
import { getAvailableThemeNames } from '@/lib/theme-registry';
import { importThemeComponent } from '@/lib/theme-loader';
import Category from '@/models/Category';
import LinkItem from '@/models/LinkItem';
import Settings from '@/models/Settings';

export const dynamic = 'force-dynamic';

async function resolveThemeComponent(themeName: string, fallback: string) {
  try {
    return await importThemeComponent(themeName);
  } catch (error) {
    console.warn(`Failed to load theme component "${themeName}"`, error);
    return importThemeComponent(fallback);
  }
}

export default async function HomePage() {
  try {
    await connectDB();
    await syncThemesWithFilesystem();

    const activeTheme = await getActiveTheme();
    const availableNames = getAvailableThemeNames();
    const resolvedTheme = availableNames.includes(activeTheme)
      ? activeTheme
      : availableNames[0] ?? 'fullscreen-section';

    const themeConfig = await getThemeConfig(resolvedTheme);

    const settings = await Settings.findOne({});
    const siteName = settings?.siteName || 'NavGo';
    const enhancedThemeConfig = {
      ...themeConfig,
      headerTagline: settings?.headerTagline || (themeConfig as any)?.headerTagline,
    };

    const categories = await Category.find({ enabled: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const links = await LinkItem.find({
      enabled: true,
      $or: [{ reviewStatus: { $exists: false } }, { reviewStatus: 'approved' }],
    })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const categoriesData = JSON.parse(JSON.stringify(categories));
    const linksData = JSON.parse(JSON.stringify(links));

    const fallbackTheme = availableNames.includes('fullscreen-section')
      ? 'fullscreen-section'
      : availableNames[0] || resolvedTheme;

    const ThemeComponent = await resolveThemeComponent(resolvedTheme, fallbackTheme);

    return (
      <ThemeComponent
        categories={categoriesData}
        links={linksData}
        config={enhancedThemeConfig}
        siteName={siteName}
      >
        {null}
      </ThemeComponent>
    );
  } catch (error) {
    console.error('首页加载错误:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">NavGo</h1>
          <p className="text-gray-600 mb-8">欢迎使用 NavGo 导航系统</p>
          <p className="text-sm text-gray-500">请先配置数据库连接并初始化数据</p>
        </div>
      </div>
    );
  }
}
