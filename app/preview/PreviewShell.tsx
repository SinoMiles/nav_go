"use client";

import { useEffect, useMemo, useState } from "react";
import SidebarNavTheme from "@/themes/sidebar-nav";
import FullscreenSectionTheme from "@/themes/fullscreen-section";

type ThemeComponentProps = React.ComponentProps<typeof SidebarNavTheme>;

type ThemeConfigField = {
  type: "color" | "text" | "url" | "boolean" | "list";
  label?: string;
  default?: any;
  placeholder?: string;
  itemLabel?: string;
  fields?: Record<string, ThemeConfigField>;
};

const THEME_COMPONENTS: Record<string, React.ComponentType<ThemeComponentProps>> = {
  "sidebar-nav": SidebarNavTheme,
  "fullscreen-section": FullscreenSectionTheme,
};

interface PreviewShellProps {
  themeName: string;
  categories: any[];
  links: any[];
  siteName: string;
  initialConfig: Record<string, any>;
  configSchema?: Record<string, ThemeConfigField>;
}

const buildDefaultConfig = (schema?: Record<string, ThemeConfigField>) => {
  if (!schema) return {};
  const result: Record<string, any> = {};
  for (const [key, field] of Object.entries(schema)) {
    switch (field.type) {
      case "boolean":
        result[key] = Boolean(field.default);
        break;
      case "list":
        result[key] = Array.isArray(field.default) ? field.default : [];
        break;
      default:
        result[key] = field.default ?? "";
        break;
    }
  }
  return result;
};

const mergeConfigWithDefaults = (
  schema: Record<string, ThemeConfigField> | undefined,
  saved: any,
) => {
  const defaults = buildDefaultConfig(schema);
  if (!saved) return defaults;
  const merged: Record<string, any> = { ...defaults, ...saved };

  if (schema) {
    Object.entries(schema).forEach(([key, field]) => {
      if (field.type === "list") {
        merged[key] = Array.isArray(saved?.[key]) ? saved[key] : defaults[key] ?? [];
      }
    });
  }

  return merged;
};

const PANEL_WIDTH = 320;
const PANEL_OFFSET = 24;

export default function PreviewShell(props: PreviewShellProps) {
  const { themeName, categories, links, siteName, initialConfig, configSchema } = props;

  const ThemeComponent = THEME_COMPONENTS[themeName] ?? FullscreenSectionTheme;
  const savedConfig = useMemo(
    () => mergeConfigWithDefaults(configSchema, initialConfig),
    [configSchema, initialConfig],
  );

  const [panelOpen, setPanelOpen] = useState(true);
  const [config, setConfig] = useState<Record<string, any>>(savedConfig);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setConfig(savedConfig);
  }, [savedConfig]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleFieldChange = (field: string, value: any) => {
    setConfig(prev => {
      if (value === undefined) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return { ...prev, [field]: value };
    });
  };

  const handleListEntryChange = (
    fieldKey: string,
    index: number,
    entryKey: string,
    value: string,
  ) => {
    setConfig(prev => {
      const list = Array.isArray(prev[fieldKey]) ? [...prev[fieldKey]] : [];
      list[index] = { ...list[index], [entryKey]: value };
      return { ...prev, [fieldKey]: list };
    });
  };

  const handleSave = async () => {
    if (!configSchema || Object.keys(configSchema).length === 0) {
      setToast("当前主题暂不支持自定义配置");
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    if (!token) {
      setToast("请登录后台后再保存配置");
      return;
    }

    const payload: Record<string, any> = { ...config };

    Object.entries(configSchema).forEach(([fieldKey, field]) => {
      if (field.type === "list") {
        const listValue = Array.isArray(config[fieldKey]) ? config[fieldKey] : [];
        payload[fieldKey] = listValue.filter(item => {
          if (!item || typeof item !== "object") return false;
          return Object.values(item).some(value => {
            if (typeof value === "string") {
              return value.trim().length > 0;
            }
            return Boolean(value);
          });
        });
      }
    });

    try {
      setSaving(true);
      const res = await fetch("/api/themes/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ themeName, config: payload }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "保存失败");
      }
      setToast("配置已保存");
    } catch (error: any) {
      console.error("保存主题配置失败:", error);
      setToast(error?.message || "保存失败，请稍后再试");
    } finally {
      setSaving(false);
    }
  };

  const renderField = (key: string, field: ThemeConfigField) => {
    const label = field.label || key;
    const value = config[key];

    switch (field.type) {
      case "color": {
        const defaultValue =
          typeof field.default === "string" && field.default ? field.default : "#2563eb";
        const colorValue = typeof value === "string" && value ? value : defaultValue;
        return (
          <label key={key} className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">{label}</span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colorValue}
                onChange={event => handleFieldChange(key, event.target.value)}
                className="h-10 w-16 cursor-pointer rounded border border-slate-200 bg-white"
              />
              <button
                type="button"
                onClick={() => handleFieldChange(key, undefined)}
                disabled={value === undefined}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  value === undefined
                    ? 'cursor-not-allowed border-slate-200 text-slate-400'
                    : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-800'
                }`}
              >
                恢复默认
              </button>
            </div>
          </label>
        );
      }

      case "boolean":
        return (
          <label
            key={key}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <span className="text-slate-600">{label}</span>
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={event => handleFieldChange(key, event.target.checked)}
              className="h-4 w-4"
            />
          </label>
        );

      case "list": {
        const listValue = Array.isArray(value) ? value : [];
        const entries = field.fields || {};

        return (
          <div key={key} className="space-y-3">
            <span className="text-sm font-medium text-slate-600">{label}</span>
            <div className="space-y-2">
              {listValue.length > 0 ? (
                listValue.map((item: Record<string, any>, index: number) => (
                  <div
                    key={`${key}-${index}`}
                    className="space-y-2 rounded-xl border border-slate-200 p-3"
                  >
                    {Object.entries(entries).map(([entryKey, entryField]) => {
                      const inputType = entryField.type === "url" ? "url" : "text";
                      return (
                        <input
                          key={`${key}-${index}-${entryKey}`}
                          type={inputType}
                          value={item?.[entryKey] || ""}
                          onChange={event =>
                            handleListEntryChange(key, index, entryKey, event.target.value)
                          }
                          placeholder={entryField.placeholder || entryField.label || ""}
                          className="w全 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                        />
                      );
                    })}
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400">
                  暂无可编辑数据，请在后台配置后再试。
                </p>
              )}
            </div>
          </div>
        );
      }

      default:
        return (
          <label key={key} className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">{label}</span>
            <input
              type="text"
              value={value || ""}
              placeholder={field.placeholder || ""}
              onChange={event => handleFieldChange(key, event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>
        );
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50">
      <div className="bg-yellow-500 px-4 py-2 text-center font-semibold text-black">
        ⚠️ 预览模式 - 当前主题：{themeName}
      </div>

      <ThemeComponent
        categories={categories}
        links={links}
        siteName={siteName}
        config={config}
      >
        {null}
      </ThemeComponent>

      <button
        type="button"
        onClick={() => setPanelOpen(prev => !prev)}
        style={{ right: panelOpen ? PANEL_WIDTH + PANEL_OFFSET + 16 : PANEL_OFFSET }}
        className={`fixed top-1/2 z-[120] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition-all duration-300 hover:bg-slate-800 ${panelOpen ? "ring-2 ring-white" : ""}`}
        aria-label="切换主题配置面板"
      >
        ⚙️
      </button>

      <aside
        style={{ width: PANEL_WIDTH }}
        className={`fixed right-6 top-1/2 z-[110] flex max-h-[calc(100vh-8rem)] max-w-none -translate-y-1/2 flex-col gap-3 overflow-hidden rounded-3xl border border-slate-200 bg-white px-4 pb-5 pt-5 shadow-2xl transition-transform duration-300 ${panelOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">主题设置</h2>
            <p className="text-xs text-slate-400">实时调整配色并查看效果</p>
          </div>
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            className="rounded-full border border-transparent px-2 py-1 text-sm text-slate-400 transition hover:text-slate-600"
          >
            收起
          </button>
        </div>

        {configSchema && Object.keys(configSchema).length > 0 ? (
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {Object.entries(configSchema).map(([key, field]) => renderField(key, field))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
            当前主题暂无可配置选项
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleSave}
            className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "保存中…" : "保存配置"}
          </button>
        </div>

        {toast && (
          <div className="pointer-events-none fixed bottom-6 right-4 z-[130] rounded-full bg-slate-900/90 px-4 py-2 text-xs font-medium text-white shadow-lg">
            {toast}
          </div>
        )}
      </aside>
    </div>
  );
}
