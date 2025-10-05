'use client';

import { useEffect, useMemo, useState } from 'react';

interface CategoryOption {
  id: string;
  title: string;
}

interface AddLinkModalProps {
  open: boolean;
  onClose: () => void;
  categories: CategoryOption[];
  accentColor?: string;
}

const TEXT = {
  submitTitle: '\u63d0\u4ea4\u7ad9\u70b9',
  close: '\u5173\u95ed',
  notice:
    '\u63d0\u4ea4\u7684\u94fe\u63a5\u9700\u8981\u7ba1\u7406\u5458\u5ba1\u6838\u540e\u624d\u4f1a\u663e\u793a\u3002',
  success:
    '\u63d0\u4ea4\u6210\u529f\uff0c\u7ba1\u7406\u5458\u5ba1\u6838\u540e\u5c06\u663e\u793a\u3002',
  errorGeneric: '\u63d0\u4ea4\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002',
  urlRequired: '\u7f51\u7ad9\u94fe\u63a5\u4e3a\u5fc5\u586b\u9879\u3002',
  selectCategory: '\u8bf7\u9009\u62e9\u5206\u7c7b\u3002',
  urlFirst: '\u8bf7\u5148\u8f93\u5165\u7f51\u5740\u3002',
  metadataFailed: '\u83b7\u53d6\u7ad9\u70b9\u4fe1\u606f\u5931\u8d25\u3002',
  form: {
    url: '\u7f51\u7ad9\u94fe\u63a5 *',
    name: '\u7f51\u7ad9\u540d\u79f0',
    namePlaceholder: '\u4f8b\u5982\uff1a\u767e\u5ea6',
    description: '\u7f51\u7ad9\u7b80\u4ecb',
    descriptionPlaceholder: '\u7b80\u8981\u4ecb\u7ecd\u6b64\u7f51\u7ad9\u7684\u7279\u8272',
    icon: '\u56fe\u6807\u94fe\u63a5',
    category: '\u6240\u5c5e\u5206\u7c7b *',
    categoryPlaceholder: '\u8bf7\u9009\u62e9\u5206\u7c7b',
    tags: '\u6807\u7b7e',
    tagsPlaceholder: '\u7528\u9017\u53f7\u5206\u9694\uff0c\u4f8b\u5982\uff1a\u641c\u7d22, \u5de5\u5177',
    contactName: '\u8054\u7cfb\u4eba',
    contactEmail: '\u8054\u7cfb\u90ae\u7bb1',
    optional: '\u9009\u586b',
    submit: '\u63d0\u4ea4\u5ba1\u6838',
    submitting: '\u63d0\u4ea4\u4e2d…',
    autoFill: '\u81ea\u52a8\u586b\u5145',
    fetching: '\u83b7\u53d6\u4e2d…',
  },
};

export default function AddLinkModal({
  open,
  onClose,
  categories,
  accentColor = '#2563eb',
}: AddLinkModalProps) {
  const [form, setForm] = useState({
    url: '',
    title: '',
    description: '',
    iconUrl: '',
    categoryId: '',
    tags: '',
    contactName: '',
    contactEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const categoryOptions = useMemo(
    () => categories.map(({ id, title }) => ({ id, title })),
    [categories]
  );

  useEffect(() => {
    if (open) {
      setForm(prev => ({
        ...prev,
        categoryId: prev.categoryId || categoryOptions[0]?.id || '',
      }));
      setMessage('');
      setError('');
    }
  }, [open, categoryOptions]);

  const resetForm = () => {
    setForm({
      url: '',
      title: '',
      description: '',
      iconUrl: '',
      categoryId: categoryOptions[0]?.id || '',
      tags: '',
      contactName: '',
      contactEmail: '',
    });
  };

  const handleAutoFill = async () => {
    if (!form.url) {
      setError(TEXT.urlFirst);
      return;
    }

    try {
      setMetadataLoading(true);
      setError('');

      const res = await fetch(`/api/metadata?url=${encodeURIComponent(form.url)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || TEXT.metadataFailed);
      }

      const meta = data.metadata?.data || data.metadata || {};
      const keywords = meta.keywords || meta.meta_keywords || meta.keyword;
      const derivedTags = Array.isArray(keywords)
        ? keywords.join(', ')
        : typeof keywords === 'string'
        ? keywords
        : '';

      setForm(prev => ({
        ...prev,
        title: prev.title || meta.title || meta.siteName || meta.site_name || '',
        description:
          prev.description || meta.description || meta.summary || meta.seo_description || '',
        iconUrl: prev.iconUrl || meta.icon || meta.logo || meta.image || '',
        tags: prev.tags || derivedTags || prev.tags,
      }));
    } catch (err: any) {
      setError(err?.message || TEXT.metadataFailed);
    } finally {
      setMetadataLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.url) {
      setError(TEXT.urlRequired);
      return;
    }
    if (!form.categoryId) {
      setError(TEXT.selectCategory);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        url: form.url,
        title: form.title,
        description: form.description,
        iconUrl: form.iconUrl,
        categoryId: form.categoryId,
        tags: form.tags
          ? form.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          : [],
        contactName: form.contactName,
        contactEmail: form.contactEmail,
      };

      const res = await fetch('/api/links/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || TEXT.errorGeneric);
      }

      setMessage(TEXT.success);
      resetForm();
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err?.message || TEXT.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-slate-950/60 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{TEXT.submitTitle}</h3>
          <button
            onClick={() => {
              resetForm();
              setMessage('');
              setError('');
              onClose();
            }}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
          >
            {TEXT.close}
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-500">{TEXT.notice}</p>

        {message && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
            {message}
          </div>
        )}

        {error && !message && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">{TEXT.form.url}</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={form.url}
                onChange={event => setForm({ ...form, url: event.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-[color:var(--accent)]"
                placeholder="https://"
                required
                style={{ ['--accent' as any]: accentColor }}
              />
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={metadataLoading}
                className="whitespace-nowrap rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {metadataLoading ? TEXT.form.fetching : TEXT.form.autoFill}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">{TEXT.form.name}</label>
            <input
              type="text"
              value={form.title}
              onChange={event => setForm({ ...form, title: event.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-[color:var(--accent)]"
              placeholder={TEXT.form.namePlaceholder}
              style={{ ['--accent' as any]: accentColor }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">{TEXT.form.description}</label>
            <textarea
              value={form.description}
              onChange={event => setForm({ ...form, description: event.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-[color:var(--accent)]"
              rows={3}
              placeholder={TEXT.form.descriptionPlaceholder}
              style={{ ['--accent' as any]: accentColor }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">{TEXT.form.icon}</label>
              <input
                type="url"
                value={form.iconUrl}
                onChange={event => setForm({ ...form, iconUrl: event.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-[color:var(--accent)]"
                placeholder="https://"
                style={{ ['--accent' as any]: accentColor }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">{TEXT.form.category}</label>
              <select
                value={form.categoryId}
                onChange={event => setForm({ ...form, categoryId: event.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-[color:var(--accent)]"
                required
                style={{ ['--accent' as any]: accentColor }}
              >
                <option value="">{TEXT.form.categoryPlaceholder}</option>
                {categoryOptions.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">{TEXT.form.tags}</label>
            <input
              type="text"
              value={form.tags}
              onChange={event => setForm({ ...form, tags: event.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-[color:var(--accent)]"
              placeholder={TEXT.form.tagsPlaceholder}
              style={{ ['--accent' as any]: accentColor }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">{TEXT.form.contactName}</label>
              <input
                type="text"
                value={form.contactName}
                onChange={event => setForm({ ...form, contactName: event.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-[color:var(--accent)]"
                placeholder={TEXT.form.optional}
                style={{ ['--accent' as any]: accentColor }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">{TEXT.form.contactEmail}</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={event => setForm({ ...form, contactEmail: event.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-[color:var(--accent)]"
                placeholder={TEXT.form.optional}
                style={{ ['--accent' as any]: accentColor }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border border-transparent px-5 py-3 text-sm font-semibold text-white shadow-sm transition"
            style={{
              backgroundColor: accentColor,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? TEXT.form.submitting : TEXT.form.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
