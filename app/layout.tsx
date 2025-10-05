import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NavCraft - 智能导航站',
  description: '基于Next.js的可切换主题导航系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
