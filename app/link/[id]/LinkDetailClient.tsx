'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LinkDetailClientProps {
  initialData: {
    link: any;
    rating: { avg: number; total: number };
    comments: any[];
  };
  linkId: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role?: string;
}

const formatHost = (url?: string) => {
  if (!url) return '';
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

export default function LinkDetailClient({
  initialData,
  linkId,
}: LinkDetailClientProps) {
  const router = useRouter();
  const { link } = initialData;

  const [user, setUser] = useState<UserData | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(initialData.rating.avg);
  const [totalRatings, setTotalRatings] = useState(initialData.rating.total);
  const [comments, setComments] = useState(initialData.comments);
  const [newComment, setNewComment] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);

  const accentClass = 'bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600';

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed: UserData = JSON.parse(stored);
        if (parsed.role && parsed.role !== 'user') {
          return;
        }
        setUser(parsed);
        void loadUserRating();
        void checkFavorite();
      } catch (error) {
        console.error('解析用户信息失败:', error);
      }
    }
  }, []);

  const loadUserRating = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`/api/ratings?linkId=${linkId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setUserRating(data.userRating || 0);
    } catch (error) {
      console.error('加载用户评分失败:', error);
    }
  };

  const checkFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const fav = (data.favorites || []).some(
        (item: any) => item.linkId?._id === linkId
      );
      setIsFavorited(fav);
    } catch (error) {
      console.error('检查收藏失败:', error);
    }
  };

  const handleRate = async (score: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ linkId, rating: score }),
      });

      if (res.ok) {
        setUserRating(score);
        const ratingRes = await fetch(`/api/ratings?linkId=${linkId}`);
        if (ratingRes.ok) {
          const data = await ratingRes.json();
          setAvgRating(data.avgRating || 0);
          setTotalRatings(data.totalRatings || 0);
        }
      }
    } catch (error) {
      console.error('评分失败:', error);
    }
  };

  const handleComment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!newComment.trim()) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ linkId, content: newComment }),
      });

      if (res.ok) {
        setNewComment('');
        const commentsRes = await fetch(`/api/comments?linkId=${linkId}`);
        if (commentsRes.ok) {
          const data = await commentsRes.json();
          setComments(data.comments || []);
        }
      }
    } catch (error) {
      console.error('评论失败:', error);
    }
  };

  const toggleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      if (isFavorited) {
        await fetch(`/api/favorites?linkId=${linkId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFavorited(false);
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ linkId }),
        });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
    }
  };

  const handleVisit = async () => {
    try {
      await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId }),
      });
    } catch (error) {
      console.error('记录访问失败:', error);
    }
    window.open(link?.url, '_blank', 'noopener,noreferrer');
  };

  const ratingLabel = useMemo(() => {
    if (!totalRatings) return '暂无评分';
    return `${avgRating.toFixed(1)} / 5 · ${totalRatings} 人已评分`;
  }, [avgRating, totalRatings]);

  return (
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto max-w-6xl space-y-10 px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
          >
            <span className="text-lg">←</span>
            返回导航
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>{formatHost(link?.url)}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>
              {new Date(link?.updatedAt || link?.createdAt || Date.now()).toLocaleDateString('zh-CN')}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-4">
                  {link?.iconUrl ? (
                    <img
                      src={link.iconUrl}
                      alt={link.title}
                      className="h-16 w-16 rounded-2xl object-cover shadow-sm"
                    />
                  ) : (
                    <span className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-200 text-2xl font-semibold text-slate-600">
                      {link?.title?.charAt(0) ?? '•'}
                    </span>
                  )}
                  <div>
                    <h1 className="text-3xl font-semibold text-slate-900">
                      {link?.title}
                    </h1>
                    {link?.categoryId?.title && (
                      <p className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {link.categoryId.title}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={toggleFavorite}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isFavorited
                      ? 'border-blue-200 bg-blue-50 text-blue-600'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  {isFavorited ? '★ 已收藏' : '☆ 收藏'}
                </button>
              </div>

              {link?.description && (
                <p className="max-w-3xl text-base leading-relaxed text-slate-600">
                  {link.description}
                </p>
              )}

              {link?.tags && link.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {link.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">评分概览</p>
                  <h3 className="text-xl font-semibold text-slate-900">{ratingLabel}</h3>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      className={`text-lg transition-colors ${
                        userRating >= star
                          ? 'text-amber-400'
                          : 'text-slate-300 hover:text-amber-300'
                      }`}
                      aria-label={`评分 ${star} 星`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleVisit}
                  className={`rounded-full px-5 py-3 text-sm font-medium text-white shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${accentClass}`}
                >
                  访问网站
                </button>
                <a
                  href={link?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                >
                  在新标签打开
                </a>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700">站点信息</h3>
              <dl className="mt-4 space-y-3 text-sm text-slate-500">
                <div className="flex justify-between">
                  <dt>网址</dt>
                  <dd className="max-w-[55%] truncate text-right text-slate-700">
                    {formatHost(link?.url)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>首次收录</dt>
                  <dd>{new Date(link?.createdAt || Date.now()).toLocaleDateString('zh-CN')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>最近更新</dt>
                  <dd>{new Date(link?.updatedAt || Date.now()).toLocaleDateString('zh-CN')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>评论数</dt>
                  <dd>{comments.length}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700">操作</h3>
              <div className="mt-4 space-y-3 text-sm">
                <button
                  onClick={() => router.back()}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                >
                  返回上一页
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                >
                  回到首页
                </button>
              </div>
            </div>
          </aside>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">用户评论</h2>
            <span className="text-sm text-slate-500">{comments.length} 条留言</span>
          </div>

          <div className="mt-6 space-y-6">
            <div className="space-y-3">
              <textarea
                value={newComment}
                onChange={event => setNewComment(event.target.value)}
                placeholder={user ? '欢迎分享你的体验…' : '登录后可发表评论'}
                disabled={!user}
                maxLength={1000}
                className="h-28 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition focus:border-blue-300 focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{newComment.length} / 1000</span>
                <button
                  onClick={handleComment}
                  disabled={!user || !newComment.trim()}
                  className={`rounded-full px-4 py-2 text-sm font-medium text-white shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${accentClass} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  发布评论
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {comments.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center text-sm text-slate-400">
                  暂无评论，快来留下你的观点。
                </div>
              )}

              {comments.map((comment: any) => (
                <article
                  key={comment._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                      {comment.userId?.name?.charAt(0)?.toUpperCase() || '访'}
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium text-slate-800">
                          {comment.userId?.name || '匿名用户'}
                        </span>
                        <span className="text-slate-400">
                          {new Date(comment.createdAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
