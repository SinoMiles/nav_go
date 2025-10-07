"use client";

import { useEffect, useMemo, useState } from "react";

interface CategoryOption {
  id: string;
  title: string;
}

const TEXT = {
  title: "提交友链",
  subtitle: "请填写站点信息，若检测到友链将自动通过审核。",
  successApproved: "检测到友链，已自动发布。",
  successPending: "提交成功，我们会尽快审核。",
  errorGeneric: "提交失败，请稍后再试。",
  requirementsTitle: "提交须知",
  requirements: [
    "请先在您的网站明显位置添加本站友链，并确保页面可访问。",
    "请填写准确的联系方式，方便审核过程中保持沟通。",
    "若未检测到友链，将进入人工审核，请耐心等待通知。",
  ],
};

type SubmitStatus = "idle" | "loading" | "success" | "error";

interface ApiState {
  status: SubmitStatus;
  message: string;
  autoApproved?: boolean;
}

const initialForm = {
  url: "",
  title: "",
  description: "",
  iconUrl: "",
  categoryId: "",
  tags: "",
  contactName: "",
  contactEmail: "",
};

function normalizeTags(source: string): string[] {
  if (!source) return [];
  return source
    .split(/[,，\s]+/)
    .map(tag => tag.trim())
    .filter(Boolean);
}

export default function SubmitPage() {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [apiState, setApiState] = useState<ApiState>({ status: "idle", message: "" });
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await fetch("/api/categories?enabled=true");
        const data = await res.json();
        const list: CategoryOption[] = (data.categories || []).map((cat: any) => ({
          id: cat._id,
          title: cat.title,
        }));
        setCategories(list);
        setForm(prev => ({ ...prev, categoryId: prev.categoryId || list[0]?.id || "" }));
      } catch (err) {
        console.error("Failed to load categories", err);
        setError("分类加载失败，请刷新页面后重试。");
      } finally {
        setLoadingCategories(false);
      }
    };

    void loadCategories();
  }, []);

  const categoryOptions = useMemo(() => categories, [categories]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAutoFill = async () => {
    if (!form.url.trim()) {
      setError("请先填写网站链接。");
      return;
    }

    try {
      setMetadataLoading(true);
      setError("");
      const res = await fetch(`/api/metadata?url=${encodeURIComponent(form.url.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "获取站点信息失败。");
      }

      const meta = data.metadata?.data || data.metadata || {};
      const keywords = meta.keywords || meta.meta_keywords || meta.keyword;
      const derivedTags = Array.isArray(keywords)
        ? keywords.join(", ")
        : typeof keywords === "string"
        ? keywords
        : "";

      setForm(prev => ({
        ...prev,
        title: prev.title || meta.title || meta.siteName || meta.site_name || "",
        description:
          prev.description || meta.description || meta.summary || meta.seo_description || "",
        iconUrl: prev.iconUrl || meta.icon || meta.logo || meta.image || "",
        tags: prev.tags || derivedTags,
      }));
    } catch (err: any) {
      console.error("Auto-fill metadata failed", err);
      setError(err?.message || "获取站点信息失败。");
    } finally {
      setMetadataLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.url.trim()) {
      setError("网站链接为必填项。");
      return;
    }

    if (!form.categoryId) {
      setError("请选择所属分类。");
      return;
    }

    setError("");
    setApiState({ status: "loading", message: "提交中…" });

    try {
      const payload = {
        ...form,
        url: form.url.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        iconUrl: form.iconUrl.trim(),
        contactName: form.contactName.trim(),
        contactEmail: form.contactEmail.trim(),
        tags: normalizeTags(form.tags),
      };

      const res = await fetch("/api/links/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || TEXT.errorGeneric);
      }

      const message = data.autoApproved ? TEXT.successApproved : TEXT.successPending;
      setApiState({ status: "success", message, autoApproved: Boolean(data.autoApproved) });
      setForm(prev => ({ ...initialForm, categoryId: prev.categoryId }));
    } catch (err: any) {
      console.error("Submit friend link failed", err);
      setApiState({ status: "error", message: err?.message || TEXT.errorGeneric });
    }
  };

  const isSubmitting = apiState.status === "loading";

  return (
    <div className="min-h-screen bg-rose-50">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-100 via-white to-white" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
          <header className="space-y-4 text-center lg:text-left">
            <span className="inline-flex items-center rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-500">
              NavGo 友链提交
            </span>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{TEXT.title}</h1>
            <p className="text-sm text-slate-600 sm:text-base">{TEXT.subtitle}</p>
          </header>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-3xl border border-rose-100 bg-white p-8 shadow-sm">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm md:col-span-2">
                    <span className="font-medium text-slate-700">网站链接 *</span>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        value={form.url}
                        onChange={event => handleChange("url", event.target.value)}
                        placeholder="https://example.com"
                        className="flex-1 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
                      />
                      <button
                        type="button"
                        onClick={handleAutoFill}
                        disabled={metadataLoading || !form.url.trim()}
                        className="inline-flex items-center justify-center rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {metadataLoading ? "读取中…" : "自动获取"}
                      </button>
                    </div>
                  </label>

                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-slate-700">网站名称 *</span>
                    <input
                      value={form.title}
                      onChange={event => handleChange("title", event.target.value)}
                      placeholder="站点名称"
                      className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-slate-700">网站标签</span>
                    <input
                      value={form.tags}
                      onChange={event => handleChange("tags", event.target.value)}
                      placeholder="用逗号分隔，例如：导航, 工具"
                      className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm md:col-span-2">
                    <span className="font-medium text-slate-700">网站简介</span>
                    <textarea
                      value={form.description}
                      onChange={event => handleChange("description", event.target.value)}
                      rows={4}
                      placeholder="简介亮点、服务内容或特色"
                      className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-slate-700">图标链接</span>
                    <input
                      value={form.iconUrl}
                      onChange={event => handleChange("iconUrl", event.target.value)}
                      placeholder="https://example.com/favicon.ico"
                      className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-slate-700">所属分类 *</span>
                    <select
                      value={form.categoryId}
                      onChange={event => handleChange("categoryId", event.target.value)}
                      disabled={loadingCategories}
                      className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
                    >
                      {categoryOptions.map(option => (
                        <option key={option.id} value={option.id} className="text-slate-900">
                          {option.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-slate-700">联系人</span>
                    <input
                      value={form.contactName}
                      onChange={event => handleChange("contactName", event.target.value)}
                      className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-slate-700">联系邮箱</span>
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={event => handleChange("contactEmail", event.target.value)}
                      className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
                    />
                  </label>
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                    {error}
                  </div>
                )}

                {apiState.status === "success" && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                    {apiState.message}
                  </div>
                )}

                {apiState.status === "error" && !error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                    {apiState.message}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-full bg-gradient-to-r from-rose-500 via-rose-400 to-amber-300 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "提交中…" : "提交审核"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...initialForm, categoryId: prev.categoryId }))}
                    className="rounded-full border border-rose-200 bg-white px-6 py-3 text-sm text-rose-500 transition hover:bg-rose-50"
                  >
                    重置
                  </button>
                </div>
              </form>
            </section>

            <aside className="flex flex-col gap-4 rounded-3xl border border-rose-100 bg-rose-50 p-8 text-sm text-slate-700">
              <h2 className="text-base font-semibold text-slate-900">{TEXT.requirementsTitle}</h2>
              <ul className="space-y-3 text-xs leading-5 text-slate-600">
                {TEXT.requirements.map(item => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              <div className="rounded-2xl border border-rose-100 bg-white p-4 text-xs text-slate-600">
                <p className="font-semibold text-slate-900">温馨提示</p>
                <p className="mt-2">
                  若首页已添加本站友链，将自动通过审核并立即展示；如未检测到友链，将进入人工审核，请保持联系方式畅通。
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
