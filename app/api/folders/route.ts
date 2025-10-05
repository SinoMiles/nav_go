import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Folder from '@/models/Folder';
import { verifyToken } from '@/lib/auth';

// 获取收藏夹列表
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

    const folders = await Folder.find({ userId: decoded.userId })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({ folders: JSON.parse(JSON.stringify(folders)) });
  } catch (error) {
    console.error('获取收藏夹失败:', error);
    return NextResponse.json({ error: '获取收藏夹失败' }, { status: 500 });
  }
}

// 创建收藏夹
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

    const { name, description, icon } = await req.json();

    const folder = await Folder.create({
      userId: decoded.userId,
      name,
      description,
      icon,
    });

    return NextResponse.json({ message: '创建成功', folder });
  } catch (error) {
    console.error('创建收藏夹失败:', error);
    return NextResponse.json({ error: '创建收藏夹失败' }, { status: 500 });
  }
}

// 删除收藏夹
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
    const folderId = searchParams.get('id');

    await Folder.deleteOne({
      _id: folderId,
      userId: decoded.userId,
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除收藏夹失败:', error);
    return NextResponse.json({ error: '删除收藏夹失败' }, { status: 500 });
  }
}
