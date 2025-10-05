'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface CategoryRecord {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  order: number;
  enabled: boolean;
  parentId?: { _id?: string; title?: string } | string | null;
}

const PAGE_SIZE = 8;

const getParentId = (category: CategoryRecord): string | null => {
  const parent = category.parentId as any;
  if (!parent) return null;
  if (typeof parent === 'string') return parent;
  if (typeof parent === 'object') {
    if (parent?._id) return String(parent._id);
    if (typeof parent.toString === 'function') return parent.toString();
  }
  return null;
};

const sortCategories = (list: CategoryRecord[]) =>
  list.sort((a, b) => {
    const orderDiff = (a.order ?? 0) - (b.order ?? 0);
    return orderDiff !== 0 ? orderDiff : a.title.localeCompare(b.title, 'zh-CN');
  });

export default function CategoriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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
    setCurrentPage(1);
  }, [keyword]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('加载分类失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredList = useMemo(() => {
    const lower = keyword.trim().toLowerCase();
    if (!lower) {
      return categories;
    }
    return categories.filter(category => {
      const title = category.title ?? '';
      const slug = category.slug ?? '';
      const description = category.description ?? '';
      return (
        title.toLowerCase().includes(lower) ||
        slug.toLowerCase().includes(lower) ||
        description.toLowerCase().includes(lower)
      );
    });
  }, [categories, keyword]);

  const flatList = useMemo(() => {
    const byParent = new Map<string | null, CategoryRecord[]>();
    filteredList.forEach(category => {
      const parentId = getParentId(category);
      const key = parentId ?? null;
      const list = byParent.get(key) ?? [];
      list.push(category);
      byParent.set(key, list);
    });

    byParent.forEach(list => sortCategories(list));

    const roots = byParent.get(null) ?? [];
    sortCategories(roots);

    const rows: { category: CategoryRecord; depth: number }[] = [];
    roots.forEach(root => {
      rows.push({ category: root, depth: 0 });
      const children = byParent.get(root._id) ?? [];
      children.forEach(child => rows.push({ category: child, depth: 1 }));
    });

    return rows;
  }, [filteredList]);

  const totalPages = Math.max(1, Math.ceil(flatList.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageRows = flatList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleDelete = async (id: string) => {
    if (!confirm('该分类将被永久删除，是否继续？')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '删除失败');
      }

      setMessage('分类删除成功');
      setTimeout(() => setMessage(''), 3000);
      await loadCategories();
      router.replace('/admin/categories?flash=deleted', { scroll: false });
    } catch (error: any) {
      alert(error?.message || '无法删除该分类，请稍后重试。');
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/categories/${id}/edit`);
  };

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">分类管理</h1>
            <p className="text-sm text-slate-300/80">维护导航结构，支持一级与二级分类的排序与显示状态。</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/categories/new"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
            >
              新建分类
            </Link>
            <button
              onClick={() => void loadCategories()}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/20"
            >
              刷新列表
            </button>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/55 p-4 text-slate-100">
          <input
            type="text"
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            placeholder="输入分类名称或标识搜索"
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
          />
          <button
            onClick={() => setKeyword('')}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            清空
          </button>
        </div>

        {message && (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {message}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.95)]">
          {loading ? (
            <div className="py-16 text-center text-sm text-slate-300/80">分类数据加载中…</div>
          ) : (
            <table className="w-full border-collapse text-sm text-slate-200">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-300">
                <tr>
                  <th className="px-6 py-4 text-left font-medium">名称</th>
                  <th className="px-6 py-4 text-left font-medium">标识</th>
                  <th className="px-6 py-4 text-left font-medium">排序</th>
                  <th className="px-6 py-4 text-left font-medium">状态</th>
                  <th className="px-6 py-4 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pageRows.map(({ category, depth }) => {
                  const marginLeft = depth * 24;
                  const parentId = getParentId(category);
                  const isTopLevel = depth === 0;

                  return (
                    <tr key={category._id} className="transition hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-medium text-white"
                              style={{ marginLeft }}
                            >
                              {category.title}
                            </span>
                            {!isTopLevel && (
                              <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] text-slate-200">
                                子级
                              </span>
                            )}
                          </div>
                          <div
                            className="flex flex-wrap items-center gap-2 text-xs text-slate-300/80"
                            style={{ marginLeft }}
                          >
                            {category.description && <span>{category.description}</span>}
                            {!isTopLevel && parentId && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                                父级：{categories.find(cat => cat._id === parentId)?.title ?? '无'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300/80">{category.slug}</td>
                      <td className="px-6 py-4 text-slate-300/80">{category.order}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                            category.enabled
                              ? 'border border-emerald-400/40 bg-emerald-500/20 text-emerald-200'
                              : 'border border-white/10 bg-white/5 text-slate-300'
                          }`}
                        >
                          <span className="text-[10px]">•</span>
                          {category.enabled ? '可见' : '隐藏'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(category._id)}
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            className="rounded-full border border-red-400/40 bg-red-500/15 px-4 py-1 text-xs text-red-100 transition hover:border-red-400/60 hover:bg-red-500/25"
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
          )}

          {!loading && flatList.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-300/80">暂无分类，可通过上方按钮新建。</div>
          )}
        </div>

        {flatList.length > PAGE_SIZE && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-xs text-slate-200">
            <p>
              第 {safePage} / {totalPages} · {flatList.length} 条记录
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="rounded-full border border-white/10 px-3 py-1 transition hover:border-white/20 hover:bg-white/5"
                disabled={safePage === 1}
              >
                上一页
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-full text-sm transition ${
                    page === safePage
                      ? 'border border-white/20 bg-white/20 text-white'
                      : 'border border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="rounded-full border border-white/10 px-3 py-1 transition hover:border-white/20 hover:bg-white/5"
                disabled={safePage === totalPages}
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
