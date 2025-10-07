import type { ComponentType } from 'react';
import type { ThemeProps } from '@/lib/types/theme';

export type ThemeComponent = ComponentType<ThemeProps>;

declare const require: any;

const themeContext = require.context('../themes', true, /index\.tsx$/);
const themeModules: Record<string, () => Promise<any>> = {};

themeContext.keys().forEach((key: string) => {
  const match = key.match(/^\.\/([^/]+)\/index\.tsx$/);
  if (!match) return;
  const name = match[1];
  themeModules[name] = async () => themeContext(key);
});

export async function importThemeComponent(themeName: string): Promise<ThemeComponent> {
  const loader = themeModules[themeName];
  if (!loader) {
    throw new Error(`Unable to load theme component "${themeName}"`);
  }
  const module = await loader();
  return module?.default;
}


