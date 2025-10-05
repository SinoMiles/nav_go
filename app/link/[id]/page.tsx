import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import LinkItem from '@/models/LinkItem';
import Rating from '@/models/Rating';
import Comment from '@/models/Comment';
import LinkDetailClient from './LinkDetailClient';

interface LinkDetail {
  _id: string;
  title: string;
  url: string;
  description?: string;
  iconUrl?: string;
  tags?: string[];
  categoryId?: { _id: string; title: string };
}

async function getLinkData(id: string) {
  await connectDB();

  const link = await LinkItem.findById(id)
    .populate('categoryId', 'title')
    .lean();

  if (!link) {
    return null;
  }

  // 获取评分数据
  const ratings = await Rating.find({ linkId: id }).lean();
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  // 获取评论数据
  const comments = await Comment.find({ linkId: id })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return {
    link: JSON.parse(JSON.stringify(link)),
    rating: {
      avg: avgRating,
      total: ratings.length,
    },
    comments: JSON.parse(JSON.stringify(comments)),
  };
}

export default async function LinkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const data = await getLinkData(resolvedParams.id);

  if (!data) {
    notFound();
  }

  return <LinkDetailClient initialData={data} linkId={resolvedParams.id} />;
}
