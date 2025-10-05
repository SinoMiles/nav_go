'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface LinkRecord {
  _id: string;
  title: string;
  url: string;
  description?: string;
  iconUrl?: string;
  categoryId: any;
  order: number;
  enabled: boolean;
  tags?: string[];
  reviewStatus?: 'pending' | 'approved' | 'rejected';
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PAGE_SIZE = 10;

export default function LinksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [links, setLinks] = useState<LinkRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    void loadLinks(page);
  }, [page]);

  useEffect(() => {
    const flash = searchParams.get('flash');
    if (!flash) return;

    const text =
      flash === 'created'
        ? 'Link saved successfully'
        : flash === 'updated'
        ? 'Link updated successfully'
        : flash === 'deleted'
        ? 'Link removed successfully'
        : '';

    if (text) {
      setMessage(text);
      setTimeout(() => setMessage(''), 3000);
    }

    router.replace('/admin/links', { scroll: false });
  }, [router, searchParams]);

  const loadLinks = async (targetPage: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/links?page=${targetPage}&limit=${PAGE_SIZE}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch links');
      }

      setLinks(data.links || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error('Failed to load links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('This link will be permanently removed. Continue?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete link');
      }

      setMessage('Link removed successfully');
      setTimeout(() => setMessage(''), 3000);
      await loadLinks(page);
      router.replace('/admin/links?flash=deleted', { scroll: false });
    } catch (error: any) {
      alert(error?.message || 'Unable to delete this link. Please try again.');
    }
  };

  const handleCreate = () => {
    router.push('/admin/links/new');
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/links/${id}/edit`);
  };

  const categoryName = (record: LinkRecord) => {
    if (!record.categoryId) return 'None';
    if (typeof record.categoryId === 'string') return record.categoryId;
    return record.categoryId?.title ?? 'None';
  };

  const statusBadge = useMemo(() => ({
    pending: { label: 'Pending', classes: 'border-yellow-400/40 bg-yellow-500/20 text-yellow-100' },
    approved: { label: 'Approved', classes: 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200' },
    rejected: { label: 'Rejected', classes: 'border-rose-400/40 bg-rose-500/20 text-rose-100' },
  }), []);

  if (loading) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-sm text-slate-300">
        <span className="inline-flex h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        Loading links...
      </div>
    );
  }

  const totalPages = pagination?.totalPages ?? 1;
  const totalLinks = pagination?.total ?? links.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Links</h1>
          <p className="text-sm text-slate-300/80">
            Maintain the navigation catalogue, approve submissions and ensure every resource stays reachable.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
          >
            <span>+</span>
            New link
          </button>
          <button
            onClick={() => loadLinks(page)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Refresh
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.95)]">
        <table className="w-full border-collapse text-sm text-slate-200">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-300">
            <tr>
              <th className="px-6 py-4 text-left font-medium">Name</th>
              <th className="px-6 py-4 text-left font-medium">URL</th>
              <th className="px-6 py-4 text-left font-medium">Category</th>
              <th className="px-6 py-4 text-left font-medium">Review</th>
              <th className="px-6 py-4 text-left font-medium">Visible</th>
              <th className="px-6 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {links.map(link => {
              const review = statusBadge[link.reviewStatus ?? 'approved'];
              return (
                <tr key={link._id} className="transition hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-white">{link.title}</span>
                      {link.description && (
                        <span className="text-xs text-slate-300/80">{link.description}</span>
                      )}
                      {link.tags && link.tags.length > 0 && (
                        <span className="text-xs text-slate-400">Tags: {link.tags.slice(0, 3).join(', ')}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300/80">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                      {link.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-slate-300/80">{categoryName(link)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${review.classes}`}>
                      {review.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                        link.enabled
                          ? 'border border-emerald-400/40 bg-emerald-500/20 text-emerald-200'
                          : 'border border-white/10 bg-white/5 text-slate-300'
                      }`}
                    >
                      {link.enabled ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(link._id)}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(link._id)}
                        className="rounded-full border border-rose-400/40 bg-rose-500/15 px-4 py-1 text-xs text-rose-100 transition hover:border-rose-400/60 hover:bg-rose-500/25"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {links.length === 0 && (
          <div className="py-16 text-center text-sm text-slate-300/80">
            No links found. Use the "New link" button to add one.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-xs text-slate-200">
          <p>
            Page {pagination?.page ?? 1} / {totalPages} - {totalLinks} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              className="rounded-full border border-white/10 px-3 py-1 transition hover:border-white/20 hover:bg-white/5"
              disabled={(pagination?.page ?? 1) === 1}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`h-8 w-8 rounded-full text-sm transition ${
                  pageNumber === (pagination?.page ?? 1)
                    ? 'border border-white/20 bg-white/20 text-white'
                    : 'border border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              className="rounded-full border border-white/10 px-3 py-1 transition hover:border-white/20 hover:bg-white/5"
              disabled={(pagination?.page ?? 1) === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
