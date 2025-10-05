import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LinkItem from '@/models/LinkItem';
import SearchHistory from '@/models/SearchHistory';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!keyword || keyword.trim().length === 0) {
      return NextResponse.json({ links: [] });
    }

    // 保存搜索历史
    try {
      const token = req.headers.get('authorization')?.replace('Bearer ', '');
      const decoded = token ? await verifyToken(token) : null;

      await SearchHistory.create({
        userId: decoded?.userId,
        keyword: keyword.trim(),
      });
    } catch (error) {
      // 忽略保存搜索历史的错误
      console.error('保存搜索历史失败:', error);
    }

    // 搜索链接
    const links = await LinkItem.find({
      enabled: true,
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } },
      ],
    })
      .populate('categoryId', 'title')
      .limit(limit)
      .lean();

    return NextResponse.json({
      links: JSON.parse(JSON.stringify(links)),
      total: links.length
    });
  } catch (error) {
    console.error('搜索错误:', error);
    return NextResponse.json(
      { error: '搜索失败' },
      { status: 500 }
    );
  }
}

// 获取热门搜索词
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const hotSearches = await SearchHistory.aggregate([
      {
        $match: {
          searchedAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 最近7天
          },
        },
      },
      {
        $group: {
          _id: '$keyword',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          keyword: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    return NextResponse.json({ hotSearches });
  } catch (error) {
    console.error('获取热门搜索失败:', error);
    return NextResponse.json(
      { error: '获取热门搜索失败' },
      { status: 500 }
    );
  }
}
