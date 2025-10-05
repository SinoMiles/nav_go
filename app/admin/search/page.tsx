'use client';

import { useEffect, useMemo, useState } from 'react';

interface EngineForm {
  id?: string;
  name: string;
  urlTemplate: string;
  order: number;
  isDefault: boolean;
}

interface GroupRecord {
  _id: string;
  name: string;
  order: number;
  engines: EngineForm[];
}

const BLANK_ENGINE = (): EngineForm => ({
  name: '',
  urlTemplate: '',
  order: 0,
  isDefault: false,
});

export default function SearchManagerPage() {
  const [groups, setGroups] = useState<GroupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formOrder, setFormOrder] = useState(0);
  const [formEngines, setFormEngines] = useState<EngineForm[]>([BLANK_ENGINE()]);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setFormName('');
    setFormOrder(groups.length);
    setFormEngines([BLANK_ENGINE()]);
  };

  useEffect(() => {
    void loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/search-engines');
      const data = await res.json();
      if (res.ok) {
        setGroups(data.groups || []);
      } else {
        setMessage(data.error || '搜索配置加载失败');
      }
    } catch (error) {
      console.error('加载搜索配置失败:', error);
      setMessage('搜索配置加载失败');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (group: GroupRecord) => {
    setEditingId(group._id);
    setFormName(group.name);
    setFormOrder(group.order ?? 0);
    const engines = (group.engines || []).map(engine => ({
      id: engine?.id,
      name: engine?.name ?? '',
      urlTemplate: engine?.urlTemplate ?? '',
      order: engine?.order ?? 0,
      isDefault: Boolean(engine?.isDefault),
    }));
    setFormEngines(engines.length > 0 ? engines : [BLANK_ENGINE()]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddEngine = () => {
    setFormEngines(prev => [...prev, BLANK_ENGINE()]);
  };

  const handleEngineChange = (index: number, patch: Partial<EngineForm>) => {
    setFormEngines(prev =>
      prev.map((engine, idx) => (idx === index ? { ...engine, ...patch } : engine)),
    );
  };

  const handleRemoveEngine = (index: number) => {
    setFormEngines(prev => prev.filter((_, idx) => idx !== index));
  };

  const hasValidEngines = useMemo(
    () => formEngines.some(engine => engine.name.trim() && engine.urlTemplate.trim()),
    [formEngines],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formName.trim()) {
      setMessage('分组名称不能为空');
      return;
    }
    if (!hasValidEngines) {
      setMessage('请至少配置一个有效的搜索引擎');
      return;
    }

    setSaving(true);
    setMessage('');

    const payload = {
      name: formName.trim(),
      order: formOrder,
      engines: formEngines
        .map(engine => ({
          name: engine.name.trim(),
          urlTemplate: engine.urlTemplate.trim(),
          order: engine.order,
          isDefault: engine.isDefault,
        }))
        .filter(engine => engine.name && engine.urlTemplate),
    };

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(editingId ? `/api/search-engines/${editingId}` : '/api/search-engines', {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '保存失败');
      }

      setMessage(editingId ? '搜索分组已更新' : '搜索分组已创建');
      resetForm();
      await loadGroups();
    } catch (error: any) {
      console.error('保存搜索分组失败:', error);
      setMessage(error?.message || '保存失败，请稍后再试');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!confirm('删除后将无法恢复，确认删除该搜索分组？')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/search-engines/${groupId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '删除失败');
      }
      if (editingId === groupId) {
        resetForm();
      }
      setMessage('搜索分组已删除');
      await loadGroups();
    } catch (error: any) {
      console.error('删除搜索分组失败:', error);
      setMessage(error?.message || '删除失败，请稍后再试');
    }
  };

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-slate-100">
        <h1 className="text-2xl font-semibold text-white">搜索引擎管理</h1>
        <p className="mt-2 text-sm text-slate-300/90">
          配置首页搜索框的外部引擎。搜索地址可使用 <code className="rounded bg-slate-800/70 px-1">{`{query}`}</code>{' '}
          作为关键词占位符，例如 <code className="rounded bg-slate-800/70 px-1">https://www.baidu.com/s?wd={'{query}'}</code>。
        </p>
      </header>

      {message && (
        <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-100">
          {message}
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-slate-900/55 p-6 text-slate-100 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.95)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-200">分组名称</span>
              <input
                type="text"
                value={formName}
                onChange={event => setFormName(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
                placeholder="例如：常用、工具、社区"
                required
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-200">展示顺序</span>
              <input
                type="number"
                value={formOrder}
                onChange={event => setFormOrder(Number(event.target.value) || 0)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
              />
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-200">
              <span className="font-medium">搜索引擎列表</span>
              <button
                type="button"
                onClick={handleAddEngine}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs transition hover:bg-white/10"
              >
                新增引擎
              </button>
            </div>

            <div className="space-y-3">
              {formEngines.map((engine, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-2 text-xs">
                      <span className="text-slate-200">引擎名称</span>
                      <input
                        type="text"
                        value={engine.name}
                        onChange={event => handleEngineChange(index, { name: event.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none transition focus:border-white/20"
                        placeholder="例如：百度"
                      />
                    </label>
                    <label className="space-y-2 text-xs">
                      <span className="text-slate-200">搜索地址</span>
                      <input
                        type="text"
                        value={engine.urlTemplate}
                        onChange={event => handleEngineChange(index, { urlTemplate: event.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none transition focus:border-white/20"
                        placeholder="https://www.baidu.com/s?wd={query}"
                      />
                    </label>
                    <label className="space-y-2 text-xs">
                      <span className="text-slate-200">排序值</span>
                      <input
                        type="number"
                        value={engine.order}
                        onChange={event => handleEngineChange(index, { order: Number(event.target.value) || 0 })}
                        className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none transition focus:border-white/20"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-200">
                      <input
                        type="checkbox"
                        checked={engine.isDefault}
                        onChange={event =>
                          handleEngineChange(index, { isDefault: event.target.checked })
                        }
                        className="h-4 w-4"
                      />
                      设为默认搜索
                    </label>
                  </div>

                  {formEngines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEngine(index)}
                      className="rounded-full border border-red-400/40 bg-red-500/10 px-3 py-1 text-xs text-red-100 transition hover:border-red-400/60 hover:bg-red-500/20"
                    >
                      移除该引擎
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? '保存中…' : editingId ? '保存修改' : '创建分组'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              重置表单
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center text-sm text-slate-300">
            正在加载搜索分组…
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/55 p-10 text-center text-sm text-slate-300/80">
            暂未配置任何搜索引擎分组。
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {groups.map(group => (
              <div
                key={group._id}
                className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-slate-100"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                    <p className="text-xs text-slate-300/80">排序：{group.order ?? 0}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(group)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(group._id)}
                      className="rounded-full border border-red-400/40 bg-red-500/15 px-4 py-1 text-xs text-red-100 transition hover:border-red-400/60 hover:bg-red-500/25"
                    >
                      删除
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-slate-200/90">
                  {group.engines && group.engines.length > 0 ? (
                    group.engines
                      .slice()
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                      .map(engine => (
                        <div
                          key={`${group._id}-${engine.name}-${engine.urlTemplate}`}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                        >
                          <div className="flex items-center justify-between text-slate-100">
                            <span>{engine.name}</span>
                            {engine.isDefault && (
                              <span className="rounded-full border border-emerald-300/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-100">
                                默认
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-300/80">{engine.urlTemplate}</p>
                        </div>
                      ))
                  ) : (
                    <p className="rounded-2xl border border-dashed border-white/15 px-4 py-4 text-center text-xs text-slate-400">
                      尚未配置搜索引擎
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
