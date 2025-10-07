"use client";

import { useEffect, useMemo, useState } from "react";

interface CategoryOption {
  id: string;
  title: string;
}

const TEXT = {
  title: "提交友链",
  subtitle: "填写站点信息，我们将在审核通过后展示。",
  successApproved: "检测到友链，已自动发布。",
  successPending: "提交成功，我们会尽快审核。",
  errorGeneric: "提交失败，请稍后再试。",
  requirementsTitle: "提交须知",
  requirements: [
    "请先在您的网站添加本站友链，并确保页面可访问。",
    "填写准确的联系方式，以便我们需要调整时与您联系。",
    "若未检测到友链，提交将进入人工审核流程。",
  ],
};

type SubmitStatus = "idle" | "loading" | "success" | "error";

type ApiState = {
  status: SubmitStatus;
  message: string;
  autoApproved?: boolean;
};

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
    if (!form.url) {
      setError("请先填写网站链接。");
      return;
    }

    try {
      setMetadataLoading(true);
      setError("");
      const res = await fetch(`/api/metadata?url=${encodeURIComponent(form.url)}`);
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
      setError(err?.message || "获取站点信息失败。");
    } finally {
      setMetadataLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.url) {
      setError("网站链接为必填项。");
      return;
    }
    if (!form.categoryId) {
      setError("请选择所属分类。");
      return;
    }

    try {
      setApiState({ status: "loading", message: "" });
      setError("");

      const payload = {
        url: form.url,
        title: form.title,
        description: form.description,
        iconUrl: form.iconUrl,
        categoryId: form.categoryId,
        tags: form.tags
          ? form.tags.split(",[\s]*").map(tag => tag.trim()).filter(Boolean)
          : [],
        contactName: form.contactName,
        contactEmail: form.contactEmail,
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

      setApiState({
        status: "success",
        message: data.autoApproved ? TEXT.successApproved : TEXT.successPending,
        autoApproved: data.autoApproved,
      });
      setForm(prev => ({ ...initialForm, categoryId: prev.categoryId }));
    } catch (err: any) {
      setApiState({ status: "error", message: err?.message || TEXT.errorGeneric });
    }
  };

  const isSubmitting = apiState.status === "loading";

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto w-full max-w-5xl px-6 py-16 text-slate-100">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-semibold">{TEXT.title}</h1>
          <p className="mt-3 text-sm text-slate-400">{TEXT.subtitle}</p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
          <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.9)] backdrop-blur">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-slate-200">网站链接 *</span>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      value={form.url}
                      onChange={event => handleChange("url", event.target.value)}
                      placeholder="https://example.com"
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAutoFill}
                      disabled={!form.url || metadataLoading}
                      className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-white/30 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {metadataLoading ? "获取中…" : "自动填写"}
                    </button>
                  </div>
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-slate-200">网站名称</span>
                  <input
                    value={form.title}
                    onChange={event => handleChange("title", event.target.value)}
                    placeholder="例如：我的博客"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-slate-200">网站简介</span>
                  <textarea
                    value={form.description}
                    onChange={event => handleChange("description", event.target.value)}
                    rows={4}
                    placeholder="简要介绍网站的特色"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-slate-200">图标链接</span>
                  <input
                    value={form.iconUrl}
                    onChange={event => handleChange("iconUrl", event.target.value)}
                    placeholder="https://example.com/favicon.ico"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-slate-200">所属分类 *</span>
                  <select
                    value={form.categoryId}
                    onChange={event => handleChange("categoryId", event.target.value)}
                    disabled={loadingCategories}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.id} value={option.id} className="text-slate-900">
                        {option.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-slate-200">标签</span>
                  <input
                    value={form.tags}
                    onChange={event => handleChange("tags", event.target.value)}
                    placeholder="用逗号分隔，例如：导航, 工具"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-slate-200">联系人</span>
                  <input
                    value={form.contactName}
                    onChange={event => handleChange("contactName", event.target.value)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-slate-200">联系邮箱</span>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={event => handleChange("contactEmail", event.target.value)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                  />
                </label>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              )}

              {apiState.status === "success" && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  {apiState.message}
                </div>
              )}

              {apiState.status === "error" && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {apiState.message}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "提交中…" : "提交审核"}
                </button>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...initialForm, categoryId: prev.categoryId }))}
                  className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-slate-200 transition hover:border-white/30 hover:bg-white/10"
                >
                  重置
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/50 p-8 text-sm text-slate-300">
            <h2 className="text-base font-semibold text-slate-100">{TEXT.requirementsTitle}</h2>
            <ul className="space-y-3 text-xs leading-5 text-slate-400">
              {TEXT.requirements.map(item => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200">
              <p className="font-semibold text-slate-100">温馨提示</p>
              <p className="mt-2">
                若首页已添加本站友链，将自动通过审核并立即展示；如未检测到友链，将进入人工审核，请保持联系方式畅通。
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

