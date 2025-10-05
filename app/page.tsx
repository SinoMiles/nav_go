import connectDB from '@/lib/mongodb';
import { getActiveTheme, getThemeConfig } from '@/lib/theme';
import Category from '@/models/Category';
import LinkItem from '@/models/LinkItem';
import Settings from '@/models/Settings';
import SidebarNavTheme from '@/themes/sidebar-nav';
import FullscreenSectionTheme from '@/themes/fullscreen-section';

const themeComponents: Record<string, any> = {
  'sidebar-nav': SidebarNavTheme,
  'fullscreen-section': FullscreenSectionTheme,
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  try {
    await connectDB();

    // 获取激活的主题
    const activeTheme = await getActiveTheme();
    const themeConfig = await getThemeConfig(activeTheme);

    // 获取站点设置
    const settings = await Settings.findOne({});
    const siteName = settings?.siteName || 'NavGo';

    // 获取分类和链接
    const categories = await Category.find({ enabled: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const links = await LinkItem.find({
      enabled: true,
      $or: [{ reviewStatus: { $exists: false } }, { reviewStatus: 'approved' }],
    })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    // 转换MongoDB对象为纯对象
    const categoriesData = JSON.parse(JSON.stringify(categories));
    const linksData = JSON.parse(JSON.stringify(links));

    // 选择主题组件
    const ThemeComponent =
      themeComponents[activeTheme] || FullscreenSectionTheme;

    return (
      <ThemeComponent
        categories={categoriesData}
        links={linksData}
        config={themeConfig}
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            NavGo
          </h1>
          <p className="text-gray-600 mb-8">
            欢迎使用NavGo导航系统
          </p>
          <p className="text-sm text-gray-500">
            请先配置数据库连接并初始化数据
          </p>
        </div>
      </div>
    );
  }
}
