
"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import type { ThemeProps } from "@/lib/types/theme";
import { importThemeComponent } from "@/lib/theme-loader";
import { ThemeSettingsDrawer, ThemeConfigField } from "@/themes/shared/ThemeSettingsDrawer";

type ThemeComponentProps = ThemeProps;

interface PreviewShellProps {
  themeName: string;
  categories: any[];
  links: any[];
  siteName: string;
  initialConfig: Record<string, any>;
  configSchema?: Record<string, ThemeConfigField>;
  embed?: boolean;
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

export default function PreviewShell(props: PreviewShellProps) {
  const { themeName, categories, links, siteName, initialConfig, configSchema, embed = false } = props;
  const showControls = !embed;
  const containerClass = embed ? "relative min-h-[600px] bg-white" : "relative min-h-screen bg-slate-50";

  const [themeComponent, setThemeComponent] = useState<ComponentType<ThemeComponentProps> | null>(null);
  const [loadingTheme, setLoadingTheme] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingTheme(true);

    const loadTheme = async () => {
      try {
        const component = await importThemeComponent(themeName);
        if (!cancelled) {
          setThemeComponent(() => component);
        }
      } catch (error) {
        console.error("Failed to load preview theme:", themeName, error);
        if (!cancelled) {
          try {
            const fallback = await importThemeComponent("fullscreen-section");
            if (!cancelled) setThemeComponent(() => fallback);
          } catch (fallbackError) {
            console.error("Fallback theme load failed:", fallbackError);
            if (!cancelled) setThemeComponent(null);
          }
        }
      } finally {
        if (!cancelled) setLoadingTheme(false);
      }
    };

    void loadTheme();

    return () => {
      cancelled = true;
    };
  }, [themeName]);

  const savedConfig = useMemo(
    () => mergeConfigWithDefaults(configSchema, initialConfig),
    [configSchema, initialConfig],
  );

  const [panelOpen, setPanelOpen] = useState(!embed);
  useEffect(() => {
    setPanelOpen(!embed);
  }, [embed]);

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
      setToast("This theme does not support editable configuration.");
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    if (!token) {
      setToast("Please sign in to the admin before saving.");
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
        throw new Error(data.error || "Save failed, please try again later.");
      }
      setToast("Configuration saved.");
    } catch (error: any) {
      console.error("Failed to save theme configuration:", error);
      setToast(error?.message || "Save failed, please try again later.");
    } finally {
      setSaving(false);
    }
  };

  const LoadedTheme = themeComponent;

  return (
    <div className={containerClass}>
      {showControls && (
        <div className="bg-yellow-500 px-4 py-2 text-center font-semibold text-black">
          Preview Mode - Theme: {themeName}
        </div>
      )}

      {LoadedTheme ? (
        <LoadedTheme
          categories={categories}
          links={links}
          siteName={siteName}
          config={config}
        >
          {null}
        </LoadedTheme>
      ) : (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-slate-400">
          {loadingTheme ? "Loading theme..." : "Unable to load this theme"}
        </div>
      )}

      {showControls && (
        <ThemeSettingsDrawer
          open={panelOpen}
          visible={showControls}
          onOpenChange={setPanelOpen}
          configSchema={configSchema}
          config={config}
          onFieldChange={handleFieldChange}
          onListEntryChange={handleListEntryChange}
          onSave={handleSave}
          saving={saving}
          toast={toast}
        />
      )}
    </div>
  );
}



