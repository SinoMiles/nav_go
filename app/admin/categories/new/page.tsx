'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CategoryOption {
  id: string;
  title: string;
}

export default function CreateCategoryPage() {
  const router = useRouter();
  const [options, setOptions] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    order: 0,
    enabled: true,
    parentId: '',
  });

  useEffect(() => {
    void loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      const topLevels = (data.categories || []).filter((cat: any) => !cat.parentId);
      setOptions(topLevels.map((cat: any) => ({ id: cat._id, title: cat.title })));
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create category');
      }

      router.push('/admin/categories?flash=created');
    } catch (error: any) {
      setMessage(error?.message || 'Unable to create category. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <nav className="text-xs uppercase tracking-[0.3em] text-slate-400">
        <span className="text-slate-300/80">Content</span>
        <span className="mx-2 text-slate-500">/</span>
        <span className="text-white">New category</span>
      </nav>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Create navigation category</h1>
          <p className="text-sm text-slate-300/80">
            Define the category name, slug and hierarchy. Changes are synced to the public site instantly.
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/categories')}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-slate-200 transition hover:bg-white/20"
        >
          Back to list
        </button>
      </header>

      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.9)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Category name</label>
              <input
                type="text"
                value={formData.title}
                onChange={event => setFormData(prev => ({ ...prev, title: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                placeholder="e.g. Inspiration"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={event => setFormData(prev => ({ ...prev, slug: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                placeholder="e.g. design"
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
              placeholder="Visible on the public site (optional)"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Order weight</label>
              <input
                type="number"
                value={formData.order}
                onChange={event => setFormData(prev => ({ ...prev, order: Number(event.target.value) }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Parent category</label>
              <select
                value={formData.parentId}
                onChange={event => setFormData(prev => ({ ...prev, parentId: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                disabled={loading}
              >
                <option value="">None (top level)</option>
                {options.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400">Supports up to two levels. Parent must be a top-level category.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <input
              id="category-enabled"
              type="checkbox"
              checked={formData.enabled}
              onChange={event => setFormData(prev => ({ ...prev, enabled: event.target.checked }))}
              className="h-4 w-4 rounded border-white/20 bg-white/10 text-white focus:ring-white/30"
            />
            <label htmlFor="category-enabled" className="text-sm font-medium text-slate-200">
              Category visible
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
              {submitting ? 'Saving…' : 'Create category'}
            </button>
            <button
              type="button"
              onClick={() => setFormData({ title: '', slug: '', description: '', order: 0, enabled: true, parentId: '' })}
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
