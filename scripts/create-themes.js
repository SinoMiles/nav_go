const fs = require('fs');
const path = require('path');

const themesDir = path.join(__dirname, '..', 'themes');

// 主题1: 现代卡片网格 (modern-grid)
const modernGridTheme = `import React from 'react';
import { ThemeProps } from '@/lib/types/theme';

export default function ModernGridTheme({
  children,
  categories,
  links,
  config,
  siteName,
}: ThemeProps) {
  const primaryColor = config.primaryColor || '#6366f1';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {siteName.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {siteName}
                </h1>
                <p className="text-sm text-gray-500">发现优质网站资源</p>
              </div>
            </div>
            <nav className="flex gap-6">
              <a href="/" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">首页</a>
              <a href="/admin" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                管理后台
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {children || (
          <div className="space-y-16">
            {categories.map((category) => {
              const categoryLinks = links.filter(
                (link) => link.categoryId?.toString() === category._id?.toString()
              );

              if (categoryLinks.length === 0) return null;

              return (
                <section key={category._id?.toString()} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{category.title}</h2>
                      {category.description && (
                        <p className="text-gray-600">{category.description}</p>
                      )}
                    </div>
                    <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                      {categoryLinks.length} 个网站
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryLinks.map((link) => (
                      <a
                        key={link._id?.toString()}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 hover:-translate-y-1"
                      >
                        <div className="flex items-start gap-4">
                          {link.iconUrl && (
                            <img
                              src={link.iconUrl}
                              alt={link.title}
                              className="w-14 h-14 rounded-xl object-cover shadow-md"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors truncate">
                              {link.title}
                            </h3>
                            {link.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                {link.description}
                              </p>
                            )}
                            {link.tags && link.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {link.tags.slice(0, 3).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-xs font-medium"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-gray-600">© 2024 {siteName}. Powered by NavCraft.</p>
        </div>
      </footer>
    </div>
  );
}
`;

// 主题2: 极简列表 (minimalist-list)
const minimalistListTheme = `import React from 'react';
import { ThemeProps } from '@/lib/types/theme';

export default function MinimalistListTheme({
  children,
  categories,
  links,
  config,
  siteName,
}: ThemeProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* 顶部 */}
      <header className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{siteName}</h1>
          <p className="text-gray-600">精选网站导航集合</p>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {children || (
          <div className="space-y-12">
            {categories.map((category) => {
              const categoryLinks = links.filter(
                (link) => link.categoryId?.toString() === category._id?.toString()
              );

              if (categoryLinks.length === 0) return null;

              return (
                <section key={category._id?.toString()}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-900">
                    {category.title}
                  </h2>
                  <div className="space-y-3">
                    {categoryLinks.map((link) => (
                      <a
                        key={link._id?.toString()}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {link.iconUrl && (
                          <img src={link.iconUrl} alt={link.title} className="w-10 h-10 rounded" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {link.title}
                          </h3>
                          {link.description && (
                            <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                          )}
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-gray-600">
          © 2024 {siteName}
        </div>
      </footer>
    </div>
  );
}
`;

// 创建主题目录和文件的函数
function createTheme(themeName, themeCode, settings) {
  const themeDir = path.join(themesDir, themeName);

  // 创建目录
  if (!fs.existsSync(themeDir)) {
    fs.mkdirSync(themeDir, { recursive: true });
  }

  // 写入index.tsx
  fs.writeFileSync(path.join(themeDir, 'index.tsx'), themeCode);

  // 写入settings.json
  fs.writeFileSync(
    path.join(themeDir, 'settings.json'),
    JSON.stringify(settings, null, 2)
  );

  console.log(`✅ 创建主题: ${themeName}`);
}

console.log('🎨 开始创建主题...\n');

// 创建主题1
createTheme('modern-grid', modernGridTheme, {
  name: 'modern-grid',
  title: '现代卡片网格',
  description: '时尚的卡片网格布局，适合展示大量网站',
  version: '1.0.0',
  author: 'NavCraft',
  configSchema: {
    primaryColor: {
      type: 'color',
      label: '主色调',
      default: '#6366f1'
    }
  }
});

// 创建主题2
createTheme('minimalist-list', minimalistListTheme, {
  name: 'minimalist-list',
  title: '极简列表',
  description: '简洁的列表布局，注重内容和可读性',
  version: '1.0.0',
  author: 'NavCraft',
  configSchema: {}
});

console.log('\n🎉 主题创建完成！');
console.log('💡 运行 node scripts/install-themes.js 来安装这些主题到数据库');
