import type { ThemeProps } from "@/lib/types/theme";

export type ThemeConfigField = {
  type: "color" | "text" | "url" | "boolean" | "list";
  label?: string;
  default?: any;
  placeholder?: string;
  itemLabel?: string;
  fields?: Record<string, ThemeConfigField>;
};

interface ThemeSettingsDrawerProps {
  open: boolean;
  visible: boolean;
  onOpenChange: (open: boolean) => void;
  configSchema?: Record<string, ThemeConfigField>;
  config: Record<string, any>;
  onFieldChange: (field: string, value: any) => void;
  onListEntryChange: (field: string, index: number, entryKey: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
  toast?: string | null;
}

const renderField = (
  key: string,
  field: ThemeConfigField,
  config: Record<string, any>,
  onFieldChange: ThemeSettingsDrawerProps["onFieldChange"],
  onListEntryChange: ThemeSettingsDrawerProps["onListEntryChange"],
) => {
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
              onChange={event => onFieldChange(key, event.target.value)}
              className="h-10 w-16 cursor-pointer rounded border border-slate-200 bg-white"
            />
            <button
              type="button"
              onClick={() => onFieldChange(key, undefined)}
              disabled={value === undefined}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                value === undefined
                  ? "cursor-not-allowed border-slate-200 text-slate-400"
                  : "border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-800"
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
            onChange={event => onFieldChange(key, event.target.checked)}
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
                <div key={`${key}-${index}`} className="space-y-2 rounded-xl border border-slate-200 p-3">
                  {Object.entries(entries).map(([entryKey, entryField]) => {
                    const inputType = entryField.type === "url" ? "url" : "text";
                    return (
                      <input
                        key={`${key}-${index}-${entryKey}`}
                        type={inputType}
                        value={item?.[entryKey] || ""}
                        onChange={event =>
                          onListEntryChange(key, index, entryKey, event.target.value)
                        }
                        placeholder={entryField.placeholder || entryField.label || ""}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                      />
                    );
                  })}
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400">
                暂无可配置数据，请在后台补充后再试。
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
            onChange={event => onFieldChange(key, event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </label>
      );
  }
};

export function ThemeSettingsDrawer(props: ThemeSettingsDrawerProps) {
  const {
    open,
    visible,
    onOpenChange,
    configSchema,
    config,
    onFieldChange,
    onListEntryChange,
    onSave,
    saving,
    toast,
  } = props;

  if (!visible) {
    return null;
  }

  const handleToggle = () => onOpenChange(!open);

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        style={{ right: open ? PANEL_WIDTH + PANEL_OFFSET + 16 : PANEL_OFFSET }}
        className={`fixed top-1/2 z-[120] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition-all duration-300 hover:bg-slate-800 ${open ? "ring-2 ring-white" : ""}`}
        aria-label="切换主题设置面板"
      >
        设置
      </button>

      <aside
        style={{ width: PANEL_WIDTH }}
        className={`fixed right-6 top-1/2 z-[110] flex max-h-[calc(100vh-8rem)] max-w-none -translate-y-1/2 flex-col gap-3 overflow-hidden rounded-3xl border border-slate-200 bg-white px-4 pb-5 pt-5 shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">主题设置</h2>
            <p className="text-xs text-slate-400">调整主题配置并实时查看效果</p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-transparent px-2 py-1 text-sm text-slate-400 transition hover:text-slate-600"
          >
            收起
          </button>
        </div>

        {configSchema && Object.keys(configSchema).length > 0 ? (
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {Object.entries(configSchema).map(([key, field]) =>
              renderField(key, field, config, onFieldChange, onListEntryChange),
            )}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
            当前主题暂未提供可配置项
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={onSave}
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
    </>
  );
}

const PANEL_WIDTH = 320;
const PANEL_OFFSET = 24;

