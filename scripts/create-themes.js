const fs = require('fs');
const path = require('path');

const themesDir = path.join(__dirname, '..', 'themes');

// 涓婚1: 鐜颁唬鍗＄墖缃戞牸 (modern-grid)
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
      {/* 椤堕儴瀵艰埅 */}
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
                <p className="text-sm text-gray-500">鍙戠幇浼樿川缃戠珯璧勬簮</p>
              </div>
            </div>
            <nav className="flex gap-6">
              <a href="/" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">棣栭〉</a>
              <a href="/admin" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                绠＄悊鍚庡彴
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* 涓诲唴瀹?*/}
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
                      {categoryLinks.length} 涓綉绔?                    </span>
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

      {/* 椤佃剼 */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-gray-600">漏 2024 {siteName}. Powered by NavGo.</p>
        </div>
      </footer>
    </div>
  );
}
`;

// 涓婚2: 鏋佺畝鍒楄〃 (minimalist-list)
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
      {/* 椤堕儴 */}
      <header className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{siteName}</h1>
          <p className="text-gray-600">绮鹃€夌綉绔欏鑸泦鍚?/p>
        </div>
      </header>

      {/* 涓诲唴瀹?*/}
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

      {/* 椤佃剼 */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-gray-600">
          漏 2024 {siteName}
        </div>
      </footer>
    </div>
  );
}
`;

// 鍒涘缓涓婚鐩綍鍜屾枃浠剁殑鍑芥暟
function createTheme(themeName, themeCode, settings) {
  const themeDir = path.join(themesDir, themeName);

  // 鍒涘缓鐩綍
  if (!fs.existsSync(themeDir)) {
    fs.mkdirSync(themeDir, { recursive: true });
  }

  // 鍐欏叆index.tsx
  fs.writeFileSync(path.join(themeDir, 'index.tsx'), themeCode);

  // 鍐欏叆settings.json
  fs.writeFileSync(
    path.join(themeDir, 'settings.json'),
    JSON.stringify(settings, null, 2)
  );

  console.log(`鉁?鍒涘缓涓婚: ${themeName}`);
}

console.log('馃帹 寮€濮嬪垱寤轰富棰?..\n');

// 鍒涘缓涓婚1
createTheme('modern-grid', modernGridTheme, {
  name: 'modern-grid',
  title: '鐜颁唬鍗＄墖缃戞牸',
  description: '鏃跺皻鐨勫崱鐗囩綉鏍煎竷灞€锛岄€傚悎灞曠ず澶ч噺缃戠珯',
  version: '1.0.0',
  author: 'NavGo',
  configSchema: {
    primaryColor: {
      type: 'color',
      label: '涓昏壊璋?,
      default: '#6366f1'
    }
  }
});

// 鍒涘缓涓婚2
createTheme('minimalist-list', minimalistListTheme, {
  name: 'minimalist-list',
  title: '鏋佺畝鍒楄〃',
  description: '绠€娲佺殑鍒楄〃甯冨眬锛屾敞閲嶅唴瀹瑰拰鍙鎬?,
  version: '1.0.0',
  author: 'NavGo',
  configSchema: {}
});

console.log('\n馃帀 涓婚鍒涘缓瀹屾垚锛?);
console.log('馃挕 杩愯 node scripts/install-themes.js 鏉ュ畨瑁呰繖浜涗富棰樺埌鏁版嵁搴?);

