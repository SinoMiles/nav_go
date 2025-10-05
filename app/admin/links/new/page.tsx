'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CategoryOption {
  id: string;
  title: string;
}

type ReviewStatus = 'pending' | 'approved' | 'rejected';

export default function CreateLinkPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    iconUrl: '',
    categoryId: '',
    order: 0,
    enabled: true,
    tags: '',
    reviewStatus: 'approved' as ReviewStatus,
  });

  useEffect(() => {
    void loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      const options = (data.categories || []).map((cat: any) => ({ id: cat._id, title: cat.title }));
      setCategories(options);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('admin_token');
      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags
              .split(',')
              .map(tag => tag.trim())
              .filter(Boolean)
          : [],
      };

      const res = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create link');
      }

      router.push('/admin/links?flash=created');
    } catch (error: any) {
      setMessage(error?.message || 'Unable to create this link. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <nav className="text-xs uppercase tracking-[0.3em] text-slate-400">
        <span className="text-slate-300/80">Content</span>
        <span className="mx-2 text-slate-500">/</span>
        <span className="text-white">New link</span>
      </nav>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Add navigation link</h1>
          <p className="text-sm text-slate-300/80">
            Provide the URL, choose a category, and decide whether the link should be visible immediately.
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/links')}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-slate-200 transition hover:bg-white/20"
        >
          Back to list
        </button>
      </header>

      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.9)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={event => setFormData(prev => ({ ...prev, title: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                placeholder="e.g. Awesome Resource"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={event => setFormData(prev => ({ ...prev, url: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                placeholder="https://example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Description</label>
            <textarea
              value={formData.description}
              onChange={event => setFormData(prev => ({ ...prev, description: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
              rows={3}
              placeholder="Optional summary displayed to visitors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Icon URL</label>
            <input
              type="url"
              value={formData.iconUrl}
              onChange={event => setFormData(prev => ({ ...prev, iconUrl: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
              placeholder="Optional: custom favicon or screenshot"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Category</label>
              <select
                value={formData.categoryId}
                onChange={event => setFormData(prev => ({ ...prev, categoryId: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                disabled={loadingCategories}
                required
              >
                <option value="">Select a category</option>
                {categories.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Order weight</label>
              <input
                type="number"
                value={formData.order}
                onChange={event => setFormData(prev => ({ ...prev, order: Number(event.target.value) }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={event => setFormData(prev => ({ ...prev, tags: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                placeholder="Comma separated"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Review status</label>
              <select
                value={formData.reviewStatus}
                onChange={event => setFormData(prev => ({ ...prev, reviewStatus: event.target.value as ReviewStatus }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <input
              id="link-enabled"
              type="checkbox"
              checked={formData.enabled}
              onChange={event => setFormData(prev => ({ ...prev, enabled: event.target.checked }))}
              className="h-4 w-4 rounded border-white/20 bg-white/10 text-white focus:ring-white/30"
            />
            <label htmlFor="link-enabled" className="text-sm font-medium text-slate-200">
              Link visible
            </label>
          </div>

          {message && (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-100">
              {message}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Create link'}
            </button>
            <button
              type="button"
              onClick={() => setFormData({
                title: '',
                url: '',
                description: '',
                iconUrl: '',
                categoryId: '',
                order: 0,
                enabled: true,
                tags: '',
                reviewStatus: 'approved',
              })}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Reset form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
