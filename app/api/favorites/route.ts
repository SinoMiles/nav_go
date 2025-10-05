import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Favorite from '@/models/Favorite';
import Folder from '@/models/Folder';
import { verifyToken } from '@/lib/auth';

// 获取用户收藏
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId');

    const query: any = { userId: decoded.userId };
    if (folderId) {
      query.folderId = folderId;
    }

    const favorites = await Favorite.find(query)
      .populate('linkId')
      .populate('folderId')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ favorites: JSON.parse(JSON.stringify(favorites)) });
  } catch (error) {
    console.error('获取收藏失败:', error);
    return NextResponse.json({ error: '获取收藏失败' }, { status: 500 });
  }
}

// 添加收藏
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

    const { linkId, folderId } = await req.json();

    // 检查是否已收藏
    const existing = await Favorite.findOne({
      userId: decoded.userId,
      linkId,
    });

    if (existing) {
      return NextResponse.json({ error: '已经收藏过了' }, { status: 400 });
    }

    const favorite = await Favorite.create({
      userId: decoded.userId,
      linkId,
      folderId,
    });

    return NextResponse.json({ message: '收藏成功', favorite });
  } catch (error) {
    console.error('收藏失败:', error);
    return NextResponse.json({ error: '收藏失败' }, { status: 500 });
  }
}

// 取消收藏
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get('linkId');

    await Favorite.deleteOne({
      userId: decoded.userId,
      linkId,
    });

    return NextResponse.json({ message: '取消收藏成功' });
  } catch (error) {
    console.error('取消收藏失败:', error);
    return NextResponse.json({ error: '取消收藏失败' }, { status: 500 });
  }
}
