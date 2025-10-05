import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ClickStats from '@/models/ClickStats';
import LinkItem from '@/models/LinkItem';

// 记录点击
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { linkId } = await req.json();
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const userAgent = req.headers.get('user-agent') || '';
    const referer = req.headers.get('referer') || '';

    await ClickStats.create({
      linkId,
      ip,
      userAgent,
      referer,
    });

    return NextResponse.json({ message: '记录成功' });
  } catch (error) {
    console.error('记录点击失败:', error);
    return NextResponse.json({ error: '记录失败' }, { status: 500 });
  }
}

// 获取热门网站
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');
    const limit = parseInt(searchParams.get('limit') || '10');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const hotLinks = await ClickStats.aggregate([
      {
        $match: {
          clickedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$linkId',
          clicks: { $sum: 1 },
        },
      },
      {
        $sort: { clicks: -1 },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: 'linkitems',
          localField: '_id',
          foreignField: '_id',
          as: 'link',
        },
      },
      {
        $unwind: '$link',
      },
      {
        $project: {
          linkId: '$_id',
          clicks: 1,
          title: '$link.title',
          url: '$link.url',
          iconUrl: '$link.iconUrl',
          _id: 0,
        },
      },
    ]);

    return NextResponse.json({ hotLinks });
  } catch (error) {
    console.error('获取热门网站失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
