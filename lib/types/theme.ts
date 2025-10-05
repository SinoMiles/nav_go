export interface ThemeConfig {
  logo?: string;
  primaryColor?: string;
  contentColor?: string;
  backgroundColor?: string;
  friendLinks?: Array<{ title: string; url: string }>;
  defaultDarkMode?: boolean;
}

export interface ThemeSettings {
  name: string;
  title: string;
  description?: string;
  version: string;
  author?: string;
  previewUrl?: string;
  configSchema?: Record<string, any>;
}

export interface ThemeProps {
  children: React.ReactNode;
  categories: any[];
  links: any[];
  config: ThemeConfig;
  siteName: string;
}
