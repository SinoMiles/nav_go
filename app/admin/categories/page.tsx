'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface Category {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  order: number;
  enabled: boolean;
  parentId?: { _id?: string; title?: string } | string | null;
}

const PAGE_SIZE = 8;

const getParentId = (category: Category): string | null => {
  const parent = category.parentId as any;
  if (!parent) return null;
  if (typeof parent === 'string') return parent;
  if (typeof parent === 'object') {
    if (parent?._id) return parent._id as string;
    if (typeof parent.toString === 'function') return parent.toString();
  }
  return null;
};

const sortCategories = (list: Category[]) =>
  list.sort((a, b) => {
    const orderDiff = (a.order ?? 0) - (b.order ?? 0);
    return orderDiff !== 0
      ? orderDiff
      : a.title.localeCompare(b.title, 'zh-CN');
  });

export default function Categories第() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [current第, setCurrent第] = useState(1);

  useEffect(() => {
    void loadCategories();
  }, []);

  useEffect(() => {
    const flash = searchParams.get('flash');
    if (!flash) return;

    const text =
      flash === 'created'
        ? '分类创建成功'
        : flash === 'updated'
        ? '分类更新成功'
        : flash === 'deleted'
        ? '分类删除成功'
        : '';

    if (text) {
      setMessage(text);
      setTimeout(() => setMessage(''), 3000);
    }

    router.replace('/admin/categories', { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    setCurrent第(1);
  }, [categories.length]);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setLoading(false);
    }
  };

  const flatList = useMemo(() => {
    const byParent = new Map<string | null, Category[]>();
    categories.forEach(category => {
      const parentId = getParentId(category);
      const key = parentId ?? null;
      const list = byParent.get(key) ?? [];
      list.push(category);
      byParent.set(key, list);
    });

    byParent.forEach(list => sortCategories(list));

    const roots = byParent.get(null) ?? [];
    sortCategories(roots);

    const flat: { category: Category; depth: number }[] = [];
    roots.forEach(root => {
      flat.push({ category: root, depth: 0 });
      const children = byParent.get(root._id) ?? [];
      children.forEach(child => flat.push({ category: child, depth: 1 }));
    });

    return flat;
  }, [categories]);

  const total第s = Math.max(1, Math.ceil(flatList.length / PAGE_SIZE));
  const safe第 = Math.min(current第, total第s);
  const pageData = flatList.slice((safe第 - 1) * PAGE_SIZE, safe第 * PAGE_SIZE);

  const handle删除 = async (id: string) => {
    if (!confirm('该分类将被永久删除，是否继续？')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setMessage('分类删除成功');
        setTimeout(() => setMessage(''), 3000);
        await loadCategories();
        router.replace('/admin/categories?flash=deleted', { scroll: false });
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete category');
      }
    } catch (error) {
      alert('Failed to delete category. Please try again later.');
    }
  };

  const handleCreate = () => {
    router.push('/admin/categories/new');
  };

  const handle编辑 = (id: string) => {
    router.push(`/admin/categories/${id}/edit`);
  };

  if (loading) {
    return (
      <div class名称="flex min-h-[280px] flex-col items-center justify-center gap-4 text-sm text-slate-300">
        <span class名称="inline-flex h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        Loading categories…
      </div>
    );
  }

  return (
    <div class名称="space-y-8">
      <div class名称="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class名称="text-2xl font-semibold text-white">Categories</h1>
          <p class名称="text-sm text-slate-300/80">
            Manage navigation structure with two-level hierarchy, custom ordering, and visibility controls.
          </p>
        </div>
        <div class名称="flex items-center gap-3">
          <button
            onClick={handleCreate}
            class名称="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
          >
            <span>＋</span>
            新建分类
          </button>
          <button
            onClick={loadCategories}
            class名称="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            刷新
          </button>
        </div>
      </div>

      {message && (
        <div class名称="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      )}

      <div class名称="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.95)]">
        <table class名称="w-full border-collapse text-sm text-slate-200">
          <thead class名称="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-300">
            <tr>
              <th class名称="px-6 py-4 text-left font-medium">名称</th>
              <th class名称="px-6 py-4 text-left font-medium">标识</th>
              <th class名称="px-6 py-4 text-left font-medium">排序</th>
              <th class名称="px-6 py-4 text-left font-medium">状态</th>
              <th class名称="px-6 py-4 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody class名称="divide-y divide-white/5">
            {pageData.map(({ category, depth }) => {
              const parentId = getParentId(category);
              const isTopLevel = depth === 0;
              const margin = depth * 24;

              return (
                <tr key={category._id} class名称="transition hover:bg-white/5">
                  <td class名称="px-6 py-4">
                    <div class名称="flex flex-col gap-2">
                      <div class名称="flex items-center gap-2">
                        <span
                          class名称="font-medium text-white"
                          style={{ marginLeft: margin }}
                        >
                          {category.title}
                        </span>
                        {!isTopLevel && (
                          <span class名称="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] text-slate-200">
                            子级
                          </span>
                        )}
                      </div>
                      <div
                        class名称="flex flex-wrap items-center gap-2 text-xs text-slate-300/80"
                        style={{ marginLeft: margin }}
                      >
                        {category.description && <span>{category.description}</span>}
                        {!isTopLevel && parentId && (
                          <span class名称="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                            父级： {categories.find(cat => cat._id === parentId)?.title ?? 'None'}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td class名称="px-6 py-4 text-slate-300/80">{category.slug}</td>
                  <td class名称="px-6 py-4 text-slate-300/80">{category.order}</td>
                  <td class名称="px-6 py-4">
                    <span
                      class名称={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                        category.enabled
                          ? 'border border-emerald-400/40 bg-emerald-500/20 text-emerald-200'
                          : 'border border-white/10 bg-white/5 text-slate-300'
                      }`}
                    >
                      <span class名称="text-[10px]">•</span>
                      {category.enabled ? '可见' : '隐藏'}
                    </span>
                  </td>
                  <td class名称="px-6 py-4">
                    <div class名称="flex justify-end gap-2">
                      <button
                        onClick={() => handle编辑(category._id)}
                        class名称="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handle删除(category._id)}
                        class名称="rounded-full border border-red-400/40 bg-red-500/15 px-4 py-1 text-xs text-red-100 transition hover:border-red-400/60 hover:bg-red-500/25"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {flatList.length === 0 && (
          <div class名称="py-16 text-center text-sm text-slate-300/80">
            暂无分类，可通过上方按钮新建。
          </div>
        )}
      </div>

      {flatList.length > PAGE_SIZE && (
        <div class名称="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-xs text-slate-200">
          <p>
            第 {safe第} / {total第s} · {flatList.length} 条记录
          </p>
          <div class名称="flex items-center gap-2">
            <button
              onClick={() => setCurrent第(prev => Math.max(1, prev - 1))}
              class名称="rounded-full border border-white/10 px-3 py-1 transition hover:border-white/20 hover:bg-white/5"
              disabled={safe第 === 1}
            >
              上一页
            </button>
            {Array.from({ length: total第s }, (_, index) => index + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrent第(page)}
                class名称={`h-8 w-8 rounded-full text-sm transition ${
                  page === safe第
                    ? 'border border-white/20 bg-white/20 text-white'
                    : 'border border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrent第(prev => Math.min(total第s, prev + 1))}
              class名称="rounded-full border border-white/10 px-3 py-1 transition hover:border-white/20 hover:bg-white/5"
              disabled={safe第 === total第s}
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
