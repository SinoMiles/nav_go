import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Rating from '@/models/Rating';
import { verifyToken } from '@/lib/auth';

// 获取评分
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get('linkId');

    if (!linkId) {
      return NextResponse.json({ error: '缺少linkId参数' }, { status: 400 });
    }

    // 计算平均分和总评分数
    const ratings = await Rating.find({ linkId });
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    // 获取当前用户的评分
    let userRating = null;
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = await verifyToken(token);
      if (decoded) {
        const ur = await Rating.findOne({ linkId, userId: decoded.userId });
        userRating = ur ? ur.rating : null;
      }
    }

    return NextResponse.json({
      avgRating: Math.round(avgRating * 10) / 10,
      totalRatings: ratings.length,
      userRating,
    });
  } catch (error) {
    console.error('获取评分失败:', error);
    return NextResponse.json({ error: '获取评分失败' }, { status: 500 });
  }
}

// 提交评分
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '无效token' }, { status: 401 });
    }

    const { linkId, rating } = await req.json();

    if (!linkId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    // 更新或创建评分
    await Rating.findOneAndUpdate(
      { linkId, userId: decoded.userId },
      { rating, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: '评分成功' });
  } catch (error) {
    console.error('评分失败:', error);
    return NextResponse.json({ error: '评分失败' }, { status: 500 });
  }
}
